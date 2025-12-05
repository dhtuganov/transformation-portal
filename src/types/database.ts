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
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type MBTIProfile = Database['public']['Tables']['mbti_profiles']['Row']
export type Content = Database['public']['Tables']['content']['Row']
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
