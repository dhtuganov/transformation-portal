-- Content Metadata Table
-- Stores metadata for MDX content to enable search, analytics, and recommendations

CREATE TABLE IF NOT EXISTS content_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- 'mbti/introduction', 'transformation/adkar-model'
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  category TEXT,                                -- 'mbti', 'skills', 'transformation'
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER,                             -- reading time in minutes
  tags TEXT[] DEFAULT '{}',
  mbti_types TEXT[] DEFAULT '{}',               -- which MBTI types this content is for
  roles TEXT[] DEFAULT '{}',                    -- which roles can access

  -- Video and external content
  videos JSONB DEFAULT '[]',                    -- [{url, title, duration, platform}]
  external_links JSONB DEFAULT '[]',            -- [{url, title, description}]

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_completion_rate NUMERIC(5,2) DEFAULT 0,   -- 0-100%
  avg_rating NUMERIC(3,2),                      -- 1-5
  rating_count INTEGER DEFAULT 0,

  -- Publishing
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  content_updated_at TIMESTAMPTZ,               -- when MDX file was last modified
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_content_search ON content_metadata USING GIN(search_vector);

-- Category and filtering indexes
CREATE INDEX IF NOT EXISTS idx_content_category ON content_metadata(category);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content_metadata(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_metadata(published);
CREATE INDEX IF NOT EXISTS idx_content_mbti_types ON content_metadata USING GIN(mbti_types);
CREATE INDEX IF NOT EXISTS idx_content_tags ON content_metadata USING GIN(tags);

-- Content views tracking (for analytics)
CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_slug TEXT NOT NULL REFERENCES content_metadata(slug) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,                              -- for anonymous tracking
  duration_seconds INTEGER DEFAULT 0,           -- time spent reading
  scroll_depth INTEGER DEFAULT 0,               -- 0-100%
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_views_slug ON content_views(content_slug);
CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_created ON content_views(created_at);

-- Content ratings
CREATE TABLE IF NOT EXISTS content_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_slug TEXT NOT NULL REFERENCES content_metadata(slug) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_slug, user_id)
);

CREATE INDEX IF NOT EXISTS idx_content_ratings_slug ON content_ratings(content_slug);

-- Content bookmarks
CREATE TABLE IF NOT EXISTS content_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_slug TEXT NOT NULL REFERENCES content_metadata(slug) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_slug, user_id)
);

CREATE INDEX IF NOT EXISTS idx_content_bookmarks_user ON content_bookmarks(user_id);

-- Function to update content analytics
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content_metadata
  SET
    view_count = (SELECT COUNT(*) FROM content_views WHERE content_slug = NEW.content_slug),
    unique_viewers = (SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) FROM content_views WHERE content_slug = NEW.content_slug),
    avg_completion_rate = (SELECT AVG(scroll_depth) FROM content_views WHERE content_slug = NEW.content_slug AND scroll_depth > 0),
    updated_at = NOW()
  WHERE slug = NEW.content_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on view
CREATE TRIGGER trigger_update_content_analytics
AFTER INSERT OR UPDATE ON content_views
FOR EACH ROW
EXECUTE FUNCTION update_content_analytics();

-- Function to update rating stats
CREATE OR REPLACE FUNCTION update_content_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content_metadata
  SET
    avg_rating = (SELECT AVG(rating) FROM content_ratings WHERE content_slug = COALESCE(NEW.content_slug, OLD.content_slug)),
    rating_count = (SELECT COUNT(*) FROM content_ratings WHERE content_slug = COALESCE(NEW.content_slug, OLD.content_slug)),
    updated_at = NOW()
  WHERE slug = COALESCE(NEW.content_slug, OLD.content_slug);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating stats
CREATE TRIGGER trigger_update_content_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON content_ratings
FOR EACH ROW
EXECUTE FUNCTION update_content_rating_stats();

-- RLS Policies
ALTER TABLE content_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_bookmarks ENABLE ROW LEVEL SECURITY;

-- Content metadata: everyone can read published content
CREATE POLICY "Anyone can read published content" ON content_metadata
  FOR SELECT USING (published = true);

-- Content metadata: admins can manage
CREATE POLICY "Admins can manage content metadata" ON content_metadata
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Views: users can insert their own views
CREATE POLICY "Users can insert views" ON content_views
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Views: users can read their own views
CREATE POLICY "Users can read own views" ON content_views
  FOR SELECT USING (user_id = auth.uid());

-- Ratings: users can manage their own ratings
CREATE POLICY "Users can manage own ratings" ON content_ratings
  FOR ALL USING (user_id = auth.uid());

-- Bookmarks: users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON content_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Function to search content
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  filter_category TEXT DEFAULT NULL,
  filter_difficulty TEXT DEFAULT NULL,
  filter_mbti_type TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  duration INTEGER,
  tags TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.slug,
    cm.title,
    cm.description,
    cm.category,
    cm.difficulty,
    cm.duration,
    cm.tags,
    ts_rank(cm.search_vector, websearch_to_tsquery('russian', search_query)) as rank
  FROM content_metadata cm
  WHERE
    cm.published = true
    AND (search_query IS NULL OR cm.search_vector @@ websearch_to_tsquery('russian', search_query))
    AND (filter_category IS NULL OR cm.category = filter_category)
    AND (filter_difficulty IS NULL OR cm.difficulty = filter_difficulty)
    AND (filter_mbti_type IS NULL OR filter_mbti_type = ANY(cm.mbti_types) OR 'all' = ANY(cm.mbti_types))
  ORDER BY
    CASE WHEN search_query IS NOT NULL THEN ts_rank(cm.search_vector, websearch_to_tsquery('russian', search_query)) ELSE 0 END DESC,
    cm.sort_order,
    cm.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE content_metadata IS 'Metadata for MDX learning content - enables search, analytics, and recommendations';
