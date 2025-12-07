export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'employee' | 'manager' | 'executive' | 'admin'
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export type ContentType = 'article' | 'video' | 'test' | 'document' | 'checklist'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type LearningStatus = 'not_started' | 'in_progress' | 'completed'

export interface Database {
  public: {
    Tables: {
      ai_usage: {
        Row: {
          user_id: string
          date: string
          tokens_used: number
          request_count: number
          last_request_at: string
        }
        Insert: {
          user_id: string
          date: string
          tokens_used?: number
          request_count?: number
          last_request_at?: string
        }
        Update: {
          user_id?: string
          date?: string
          tokens_used?: number
          request_count?: number
          last_request_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          department: string | null
          branch: string | null
          mbti_type: MBTIType | null
          mbti_verified: boolean
          job_title: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          department?: string | null
          branch?: string | null
          mbti_type?: MBTIType | null
          mbti_verified?: boolean
          job_title?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          department?: string | null
          branch?: string | null
          mbti_type?: MBTIType | null
          mbti_verified?: boolean
          job_title?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mbti_profiles: {
        Row: {
          id: string
          user_id: string
          mbti_type: MBTIType
          dominant_function: string | null
          auxiliary_function: string | null
          tertiary_function: string | null
          inferior_function: string | null
          strengths: Json
          growth_areas: Json
          communication_style: Json
          assessed_by: string | null
          assessed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mbti_type: MBTIType
          dominant_function?: string | null
          auxiliary_function?: string | null
          tertiary_function?: string | null
          inferior_function?: string | null
          strengths?: Json
          growth_areas?: Json
          communication_style?: Json
          assessed_by?: string | null
          assessed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mbti_type?: MBTIType
          dominant_function?: string | null
          auxiliary_function?: string | null
          tertiary_function?: string | null
          inferior_function?: string | null
          strengths?: Json
          growth_areas?: Json
          communication_style?: Json
          assessed_by?: string | null
          assessed_at?: string | null
          created_at?: string
        }
      }
      content: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          content_type: ContentType
          category: string | null
          tags: string[]
          mbti_types: string[]
          roles: string[]
          difficulty: Difficulty
          duration_minutes: number | null
          author: string | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          content_type?: ContentType
          category?: string | null
          tags?: string[]
          mbti_types?: string[]
          roles?: string[]
          difficulty?: Difficulty
          duration_minutes?: number | null
          author?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          content_type?: ContentType
          category?: string | null
          tags?: string[]
          mbti_types?: string[]
          roles?: string[]
          difficulty?: Difficulty
          duration_minutes?: number | null
          author?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          status: LearningStatus
          progress_percent: number
          started_at: string | null
          completed_at: string | null
          time_spent_minutes: number
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          status?: LearningStatus
          progress_percent?: number
          started_at?: string | null
          completed_at?: string | null
          time_spent_minutes?: number
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          status?: LearningStatus
          progress_percent?: number
          started_at?: string | null
          completed_at?: string | null
          time_spent_minutes?: number
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          branch: string | null
          manager_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          branch?: string | null
          manager_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          branch?: string | null
          manager_id?: string | null
          created_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          team_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      // Multi-tenant tables
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          branding: Json
          features: Json
          config: Json
          plan: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          branding?: Json
          features?: Json
          config?: Json
          plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          branding?: Json
          features?: Json
          config?: Json
          plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Psychometric tables
      psychometric_items: {
        Row: {
          id: string
          tenant_id: string | null
          item_code: string
          dimension: string
          question_text_ru: string
          question_text_en: string | null
          option_a_text_ru: string
          option_a_text_en: string | null
          option_b_text_ru: string
          option_b_text_en: string | null
          irt_discrimination: number
          irt_difficulty: number
          irt_guessing: number
          social_desirability_risk: string
          reverse_scored: boolean
          source: string | null
          version: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          item_code: string
          dimension: string
          question_text_ru: string
          question_text_en?: string | null
          option_a_text_ru: string
          option_a_text_en?: string | null
          option_b_text_ru: string
          option_b_text_en?: string | null
          irt_discrimination?: number
          irt_difficulty?: number
          irt_guessing?: number
          social_desirability_risk?: string
          reverse_scored?: boolean
          source?: string | null
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          item_code?: string
          dimension?: string
          question_text_ru?: string
          question_text_en?: string | null
          option_a_text_ru?: string
          option_a_text_en?: string | null
          option_b_text_ru?: string
          option_b_text_en?: string | null
          irt_discrimination?: number
          irt_difficulty?: number
          irt_guessing?: number
          social_desirability_risk?: string
          reverse_scored?: boolean
          source?: string | null
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      adaptive_sessions: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          status: string
          started_at: string
          completed_at: string | null
          theta_ei: number
          theta_sn: number
          theta_tf: number
          theta_jp: number
          se_ei: number
          se_sn: number
          se_tf: number
          se_jp: number
          items_administered_ei: number
          items_administered_sn: number
          items_administered_tf: number
          items_administered_jp: number
          consistency_score: number | null
          response_time_flag: boolean
          social_desirability_score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          status?: string
          started_at?: string
          completed_at?: string | null
          theta_ei?: number
          theta_sn?: number
          theta_tf?: number
          theta_jp?: number
          se_ei?: number
          se_sn?: number
          se_tf?: number
          se_jp?: number
          items_administered_ei?: number
          items_administered_sn?: number
          items_administered_tf?: number
          items_administered_jp?: number
          consistency_score?: number | null
          response_time_flag?: boolean
          social_desirability_score?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          status?: string
          started_at?: string
          completed_at?: string | null
          theta_ei?: number
          theta_sn?: number
          theta_tf?: number
          theta_jp?: number
          se_ei?: number
          se_sn?: number
          se_tf?: number
          se_jp?: number
          items_administered_ei?: number
          items_administered_sn?: number
          items_administered_tf?: number
          items_administered_jp?: number
          consistency_score?: number | null
          response_time_flag?: boolean
          social_desirability_score?: number | null
        }
      }
      adaptive_responses: {
        Row: {
          id: string
          session_id: string
          item_id: string
          response: string
          response_time_ms: number
          theta_before: number
          theta_after: number
          se_before: number
          se_after: number
          information: number
          presentation_order: number
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          item_id: string
          response: string
          response_time_ms: number
          theta_before: number
          theta_after: number
          se_before: number
          se_after: number
          information: number
          presentation_order: number
          answered_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          item_id?: string
          response?: string
          response_time_ms?: number
          theta_before?: number
          theta_after?: number
          se_before?: number
          se_after?: number
          information?: number
          presentation_order?: number
          answered_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          session_id: string | null
          mbti_type: string
          dimension_scores: Json
          overall_confidence: number
          type_probabilities: Json
          validity_flags: Json
          algorithm: string
          completion_time: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          session_id?: string | null
          mbti_type: string
          dimension_scores: Json
          overall_confidence: number
          type_probabilities?: Json
          validity_flags?: Json
          algorithm?: string
          completion_time: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          session_id?: string | null
          mbti_type?: string
          dimension_scores?: Json
          overall_confidence?: number
          type_probabilities?: Json
          validity_flags?: Json
          algorithm?: string
          completion_time?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      cognitive_profiles: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          scores: Json
          function_stack: string[]
          shadow_stack: string[]
          development_stage: string | null
          last_assessment_id: string | null
          manually_adjusted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          scores: Json
          function_stack: string[]
          shadow_stack: string[]
          development_stage?: string | null
          last_assessment_id?: string | null
          manually_adjusted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          scores?: Json
          function_stack?: string[]
          shadow_stack?: string[]
          development_stage?: string | null
          last_assessment_id?: string | null
          manually_adjusted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Gamification tables
      achievements: {
        Row: {
          id: string
          tenant_id: string | null
          code: string
          category: string
          name_ru: string
          name_en: string
          description_ru: string
          description_en: string
          icon: string
          requirement_type: string
          requirement_value: number
          requirement_context: Json
          xp_reward: number
          badge_url: string | null
          is_hidden: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          code: string
          category: string
          name_ru: string
          name_en: string
          description_ru: string
          description_en: string
          icon: string
          requirement_type: string
          requirement_value: number
          requirement_context?: Json
          xp_reward: number
          badge_url?: string | null
          is_hidden?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          code?: string
          category?: string
          name_ru?: string
          name_en?: string
          description_ru?: string
          description_en?: string
          icon?: string
          requirement_type?: string
          requirement_value?: number
          requirement_context?: Json
          xp_reward?: number
          badge_url?: string | null
          is_hidden?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string | null
          progress: number
          notified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string | null
          progress?: number
          notified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string | null
          progress?: number
          notified?: boolean
          created_at?: string
        }
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          total_xp: number
          level: number
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          total_articles_read: number
          total_quizzes_completed: number
          total_exercises_completed: number
          total_journal_entries: number
          total_challenges_completed: number
          weekly_xp: number
          monthly_xp: number
          week_start_date: string | null
          month_start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_articles_read?: number
          total_quizzes_completed?: number
          total_exercises_completed?: number
          total_journal_entries?: number
          total_challenges_completed?: number
          weekly_xp?: number
          monthly_xp?: number
          week_start_date?: string | null
          month_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_articles_read?: number
          total_quizzes_completed?: number
          total_exercises_completed?: number
          total_journal_entries?: number
          total_challenges_completed?: number
          weekly_xp?: number
          monthly_xp?: number
          week_start_date?: string | null
          month_start_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          tenant_id: string
          code: string
          challenge_type: string
          title_ru: string
          title_en: string
          description_ru: string
          description_en: string
          icon: string | null
          task_type: string
          task_count: number
          task_filter: Json
          recommended_types: string[]
          xp_reward: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          challenge_type: string
          title_ru: string
          title_en: string
          description_ru: string
          description_en: string
          icon?: string | null
          task_type: string
          task_count: number
          task_filter?: Json
          recommended_types?: string[]
          xp_reward: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          challenge_type?: string
          title_ru?: string
          title_en?: string
          description_ru?: string
          description_en?: string
          icon?: string | null
          task_type?: string
          task_count?: number
          task_filter?: Json
          recommended_types?: string[]
          xp_reward?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          status: string
          progress: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          status?: string
          progress?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          status?: string
          progress?: number
          started_at?: string
          completed_at?: string | null
        }
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          amount: number
          source: string
          source_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          amount: number
          source: string
          source_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          amount?: number
          source?: string
          source_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Multi-tenant types
export type TenantPlan = 'enterprise' | 'pro' | 'free'

// Psychometric types
export type SocialDesirabilityRisk = 'low' | 'medium' | 'high'
export type AdaptiveSessionStatus = 'in_progress' | 'completed' | 'abandoned'
export type AchievementCategory = 'discovery' | 'learning' | 'practice' | 'consistency' | 'shadow_work' | 'connection' | 'mastery' | 'special'
export type AchievementRequirementType = 'count' | 'streak' | 'completion' | 'score'
export type ChallengeType = 'daily' | 'weekly' | 'special'
export type ChallengeStatus = 'in_progress' | 'completed' | 'expired'
export type XPSource = 'article' | 'quiz' | 'achievement' | 'challenge' | 'streak' | 'exercise' | 'journal' | 'shadow_work' | 'bonus'

// Shadow Work types
export type ShadowWorkTheme = 'awareness' | 'recognition' | 'integration' | 'mastery'
export type ExerciseType = 'reflection' | 'journaling' | 'practice' | 'meditation' | 'observation' | 'action'
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'abandoned'
export type ExerciseProgressStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type StressMood = 'great' | 'good' | 'neutral' | 'low' | 'stressed'

export interface ShadowWorkProgram {
  id: string
  slug: string
  title: string
  title_en: string | null
  description: string
  description_en: string | null
  duration_weeks: number
  target_function: string
  applicable_types: string[]
  difficulty: Difficulty
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShadowWorkWeek {
  id: string
  program_id: string
  week_number: number
  title: string
  title_en: string | null
  description: string
  description_en: string | null
  theme: ShadowWorkTheme
  learning_objectives: string[]
  created_at: string
}

export interface ShadowWorkExercise {
  id: string
  week_id: string
  day_number: number
  exercise_type: ExerciseType
  title: string
  title_en: string | null
  description: string
  description_en: string | null
  instructions: string
  instructions_en: string | null
  duration_minutes: number
  xp_reward: number
  is_required: boolean
  created_at: string
}

export interface ShadowWorkEnrollment {
  id: string
  user_id: string
  program_id: string
  status: EnrollmentStatus
  started_at: string
  current_week: number
  current_day: number
  completed_at: string | null
  total_xp_earned: number
  created_at: string
  updated_at: string
}

export interface ShadowWorkProgress {
  id: string
  enrollment_id: string
  exercise_id: string
  status: ExerciseProgressStatus
  started_at: string | null
  completed_at: string | null
  reflection_text: string | null
  mood_before: number | null
  mood_after: number | null
  difficulty_rating: number | null
  xp_earned: number
  created_at: string
  updated_at: string
}

export interface StressCheckIn {
  id: string
  user_id: string
  stress_level: number
  energy_level: number | null
  mood: StressMood | null
  triggers: string[] | null
  coping_strategies_used: string[] | null
  notes: string | null
  inferior_function_active: boolean
  checked_in_at: string
  created_at: string
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type MBTIProfile = Database['public']['Tables']['mbti_profiles']['Row']
export type Content = Database['public']['Tables']['content']['Row']
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type PsychometricItem = Database['public']['Tables']['psychometric_items']['Row']
export type AdaptiveSession = Database['public']['Tables']['adaptive_sessions']['Row']
export type AdaptiveResponse = Database['public']['Tables']['adaptive_responses']['Row']
export type AssessmentResult = Database['public']['Tables']['assessment_results']['Row']
export type CognitiveProfile = Database['public']['Tables']['cognitive_profiles']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type UserGamification = Database['public']['Tables']['user_gamification']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type UserChallenge = Database['public']['Tables']['user_challenges']['Row']
export type XPTransaction = Database['public']['Tables']['xp_transactions']['Row']
