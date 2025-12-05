export interface ContentFrontmatter {
  title: string
  description: string
  author?: string
  date?: string
  category?: string
  tags?: string[]
  mbti_types?: string[]
  roles?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  published?: boolean
}

export interface ContentItem extends ContentFrontmatter {
  slug: string
  content: string
}
