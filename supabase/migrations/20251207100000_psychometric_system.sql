-- Otrar Transformation Platform - Advanced Psychometric System
-- Version: 2.0
-- Date: 2025-12-07
-- Purpose: IRT-based adaptive testing, cognitive functions, validity detection

-- ===========================================
-- PSYCHOMETRIC ITEM BANK
-- ===========================================
CREATE TABLE public.psychometric_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- Item identification
  item_code TEXT UNIQUE NOT NULL, -- 'EI-001', 'SN-042'
  dimension TEXT NOT NULL CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),

  -- Content
  question_text_ru TEXT NOT NULL,
  question_text_en TEXT,
  option_a_text_ru TEXT NOT NULL, -- First pole (E, S, T, J)
  option_a_text_en TEXT,
  option_b_text_ru TEXT NOT NULL, -- Second pole (I, N, F, P)
  option_b_text_en TEXT,

  -- IRT Parameters (2PL Model)
  discrimination DECIMAL(4,3) DEFAULT 1.0, -- 'a' parameter (0.5 - 2.5 typical)
  difficulty DECIMAL(4,3) DEFAULT 0.0,     -- 'b' parameter (-3 to +3 typical)
  guessing DECIMAL(4,3) DEFAULT 0.0,       -- 'c' parameter (for 3PL, usually 0 for forced choice)

  -- Validity flags
  social_desirability_risk TEXT DEFAULT 'low' CHECK (social_desirability_risk IN ('low', 'medium', 'high')),
  reverse_scored BOOLEAN DEFAULT false,

  -- Metadata
  source TEXT, -- 'original', 'tiger_book', 'kreger_book'
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ADAPTIVE SESSION TABLE
-- ===========================================
CREATE TABLE public.adaptive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- Session state
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Current theta estimates (ability levels for each dimension)
  theta_ei DECIMAL(4,3) DEFAULT 0.0, -- Negative = E, Positive = I
  theta_sn DECIMAL(4,3) DEFAULT 0.0, -- Negative = S, Positive = N
  theta_tf DECIMAL(4,3) DEFAULT 0.0, -- Negative = T, Positive = F
  theta_jp DECIMAL(4,3) DEFAULT 0.0, -- Negative = J, Positive = P

  -- Standard errors (confidence)
  se_ei DECIMAL(4,3) DEFAULT 1.0,
  se_sn DECIMAL(4,3) DEFAULT 1.0,
  se_tf DECIMAL(4,3) DEFAULT 1.0,
  se_jp DECIMAL(4,3) DEFAULT 1.0,

  -- Questions administered per dimension
  items_administered_ei INTEGER DEFAULT 0,
  items_administered_sn INTEGER DEFAULT 0,
  items_administered_tf INTEGER DEFAULT 0,
  items_administered_jp INTEGER DEFAULT 0,

  -- Validity indicators
  consistency_score DECIMAL(4,3), -- 0-1, higher = more consistent
  response_time_flag BOOLEAN DEFAULT false, -- True if suspicious timing
  social_desirability_score DECIMAL(4,3), -- 0-1, higher = more faking

  -- Session metadata
  device_type TEXT,
  user_agent TEXT,
  ip_hash TEXT -- Hashed for privacy

);

-- ===========================================
-- ADAPTIVE RESPONSES TABLE
-- ===========================================
CREATE TABLE public.adaptive_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.adaptive_sessions(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.psychometric_items(id),

  -- Response data
  response TEXT NOT NULL CHECK (response IN ('A', 'B')), -- A = first pole, B = second pole
  response_time_ms INTEGER, -- Milliseconds to respond

  -- State at time of response
  theta_before DECIMAL(4,3), -- Theta estimate before this response
  theta_after DECIMAL(4,3),  -- Theta estimate after this response
  se_before DECIMAL(4,3),
  se_after DECIMAL(4,3),
  information DECIMAL(4,3),  -- Fisher information at this theta

  -- Order
  presentation_order INTEGER NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ASSESSMENT RESULTS TABLE
-- ===========================================
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.adaptive_sessions(id),
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- MBTI Result
  mbti_type TEXT NOT NULL CHECK (mbti_type ~ '^[EI][SN][TF][JP]$'),

  -- Dimension scores with confidence
  dimensions JSONB NOT NULL DEFAULT '{
    "EI": {"score": 0, "preference": "E", "confidence": 0.5, "clarity": "unclear"},
    "SN": {"score": 0, "preference": "S", "confidence": 0.5, "clarity": "unclear"},
    "TF": {"score": 0, "preference": "T", "confidence": 0.5, "clarity": "unclear"},
    "JP": {"score": 0, "preference": "J", "confidence": 0.5, "clarity": "unclear"}
  }'::jsonb,

  -- Cognitive functions profile
  cognitive_functions JSONB DEFAULT '{
    "dominant": null,
    "auxiliary": null,
    "tertiary": null,
    "inferior": null,
    "shadow": [],
    "development_scores": {}
  }'::jsonb,

  -- Type probabilities (all 16 types)
  type_probabilities JSONB,

  -- Validity metrics
  validity JSONB DEFAULT '{
    "is_valid": true,
    "consistency_score": null,
    "response_time_valid": true,
    "social_desirability_ok": true,
    "flags": []
  }'::jsonb,

  -- Metadata
  assessment_version TEXT DEFAULT '2.0',
  algorithm TEXT DEFAULT 'adaptive_irt',
  total_items INTEGER,
  total_time_seconds INTEGER,

  -- Lifecycle
  is_primary BOOLEAN DEFAULT true, -- Is this the user's primary/current result?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- COGNITIVE FUNCTIONS PROFILE
-- ===========================================
CREATE TABLE public.cognitive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- 8 Cognitive Functions (0-100 development level)
  ni_score INTEGER DEFAULT 0 CHECK (ni_score >= 0 AND ni_score <= 100), -- Introverted Intuition
  ne_score INTEGER DEFAULT 0 CHECK (ne_score >= 0 AND ne_score <= 100), -- Extroverted Intuition
  si_score INTEGER DEFAULT 0 CHECK (si_score >= 0 AND si_score <= 100), -- Introverted Sensing
  se_score INTEGER DEFAULT 0 CHECK (se_score >= 0 AND se_score <= 100), -- Extroverted Sensing
  ti_score INTEGER DEFAULT 0 CHECK (ti_score >= 0 AND ti_score <= 100), -- Introverted Thinking
  te_score INTEGER DEFAULT 0 CHECK (te_score >= 0 AND te_score <= 100), -- Extroverted Thinking
  fi_score INTEGER DEFAULT 0 CHECK (fi_score >= 0 AND fi_score <= 100), -- Introverted Feeling
  fe_score INTEGER DEFAULT 0 CHECK (fe_score >= 0 AND fe_score <= 100), -- Extroverted Feeling

  -- Function stack based on MBTI type
  function_stack JSONB DEFAULT '[]'::jsonb, -- ["Ni", "Te", "Fi", "Se"] for INTJ

  -- Shadow functions (opposite attitude)
  shadow_stack JSONB DEFAULT '[]'::jsonb, -- ["Ne", "Ti", "Fe", "Si"] for INTJ

  -- Development stage (Tiger model)
  development_stage TEXT CHECK (development_stage IN (
    'emergence',      -- 0-6 years
    'crystallization', -- 6-12 years
    'differentiation', -- 12-25 years
    'integration',     -- 25-50 years
    'transcendence'    -- 50+ years
  )),

  -- Derived from assessment or updated via exercises
  last_assessment_id UUID REFERENCES public.assessment_results(id),
  manually_adjusted BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_psychometric_items_dimension ON public.psychometric_items(dimension);
CREATE INDEX idx_psychometric_items_active ON public.psychometric_items(is_active);
CREATE INDEX idx_psychometric_items_difficulty ON public.psychometric_items(difficulty);
CREATE INDEX idx_psychometric_items_tenant ON public.psychometric_items(tenant_id);

CREATE INDEX idx_adaptive_sessions_user ON public.adaptive_sessions(user_id);
CREATE INDEX idx_adaptive_sessions_status ON public.adaptive_sessions(status);
CREATE INDEX idx_adaptive_sessions_tenant ON public.adaptive_sessions(tenant_id);

CREATE INDEX idx_adaptive_responses_session ON public.adaptive_responses(session_id);
CREATE INDEX idx_adaptive_responses_item ON public.adaptive_responses(item_id);

CREATE INDEX idx_assessment_results_user ON public.assessment_results(user_id);
CREATE INDEX idx_assessment_results_type ON public.assessment_results(mbti_type);
CREATE INDEX idx_assessment_results_primary ON public.assessment_results(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_assessment_results_tenant ON public.assessment_results(tenant_id);

CREATE INDEX idx_cognitive_profiles_user ON public.cognitive_profiles(user_id);
CREATE INDEX idx_cognitive_profiles_tenant ON public.cognitive_profiles(tenant_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.psychometric_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_profiles ENABLE ROW LEVEL SECURITY;

-- Psychometric items: Tenant-scoped read
CREATE POLICY "Users can view active items in tenant"
  ON public.psychometric_items FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Adaptive sessions: User owns their sessions
CREATE POLICY "Users can manage own sessions"
  ON public.adaptive_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Adaptive responses: User owns their responses
CREATE POLICY "Users can manage own responses"
  ON public.adaptive_responses FOR ALL
  TO authenticated
  USING (
    session_id IN (SELECT id FROM public.adaptive_sessions WHERE user_id = auth.uid())
  );

-- Assessment results: User can view own, admins can view all in tenant
CREATE POLICY "Users can view own results"
  ON public.assessment_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all results in tenant"
  ON public.assessment_results FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Cognitive profiles: Same as assessment results
CREATE POLICY "Users can view own cognitive profile"
  ON public.cognitive_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cognitive profile"
  ON public.cognitive_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER psychometric_items_updated_at
  BEFORE UPDATE ON public.psychometric_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER cognitive_profiles_updated_at
  BEFORE UPDATE ON public.cognitive_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- COGNITIVE FUNCTION MAPPING
-- ===========================================

-- Reference data: MBTI type to cognitive function stack
CREATE TABLE public.mbti_function_stacks (
  mbti_type TEXT PRIMARY KEY CHECK (mbti_type ~ '^[EI][SN][TF][JP]$'),
  dominant TEXT NOT NULL,
  auxiliary TEXT NOT NULL,
  tertiary TEXT NOT NULL,
  inferior TEXT NOT NULL,
  shadow_1 TEXT NOT NULL,
  shadow_2 TEXT NOT NULL,
  shadow_3 TEXT NOT NULL,
  shadow_4 TEXT NOT NULL
);

INSERT INTO public.mbti_function_stacks VALUES
  ('INTJ', 'Ni', 'Te', 'Fi', 'Se', 'Ne', 'Ti', 'Fe', 'Si'),
  ('INTP', 'Ti', 'Ne', 'Si', 'Fe', 'Te', 'Ni', 'Se', 'Fi'),
  ('ENTJ', 'Te', 'Ni', 'Se', 'Fi', 'Ti', 'Ne', 'Si', 'Fe'),
  ('ENTP', 'Ne', 'Ti', 'Fe', 'Si', 'Ni', 'Te', 'Fi', 'Se'),
  ('INFJ', 'Ni', 'Fe', 'Ti', 'Se', 'Ne', 'Fi', 'Te', 'Si'),
  ('INFP', 'Fi', 'Ne', 'Si', 'Te', 'Fe', 'Ni', 'Se', 'Ti'),
  ('ENFJ', 'Fe', 'Ni', 'Se', 'Ti', 'Fi', 'Ne', 'Si', 'Te'),
  ('ENFP', 'Ne', 'Fi', 'Te', 'Si', 'Ni', 'Fe', 'Ti', 'Se'),
  ('ISTJ', 'Si', 'Te', 'Fi', 'Ne', 'Se', 'Ti', 'Fe', 'Ni'),
  ('ISFJ', 'Si', 'Fe', 'Ti', 'Ne', 'Se', 'Fi', 'Te', 'Ni'),
  ('ESTJ', 'Te', 'Si', 'Ne', 'Fi', 'Ti', 'Se', 'Ni', 'Fe'),
  ('ESFJ', 'Fe', 'Si', 'Ne', 'Ti', 'Fi', 'Se', 'Ni', 'Te'),
  ('ISTP', 'Ti', 'Se', 'Ni', 'Fe', 'Te', 'Si', 'Ne', 'Fi'),
  ('ISFP', 'Fi', 'Se', 'Ni', 'Te', 'Fe', 'Si', 'Ne', 'Ti'),
  ('ESTP', 'Se', 'Ti', 'Fe', 'Ni', 'Si', 'Te', 'Fi', 'Ne'),
  ('ESFP', 'Se', 'Fi', 'Te', 'Ni', 'Si', 'Fe', 'Ti', 'Ne');
