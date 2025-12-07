export interface ContentFrontmatter {
  title: string
  description: string
  author?: string
  date?: string
  category?: 'business' | 'personal' | 'industry' | string
  subcategory?: string
  tags?: string[]
  mbti_types?: string[]
  roles?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  published?: boolean
  xp_reward?: number
  tenant_scope?: string | string[]
  industry_tags?: string[]
  department_tags?: string[]
  role_tags?: string[]
  competency_level?: 1 | 2 | 3 | 4 | 5
  prerequisites?: string[]
  next_articles?: string[]
  featured?: boolean
  sort_order?: number
}

export interface ContentItem extends ContentFrontmatter {
  slug: string
  content: string
}
