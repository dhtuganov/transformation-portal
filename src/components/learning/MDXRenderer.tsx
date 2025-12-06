'use client'

import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import {
  DichotomyScale,
  ComparisonTable,
  MBTITypeCard,
  CognitiveFunctionsStack,
  QuestionBox,
  Callout,
} from './MBTIComponents'

interface MDXRendererProps {
  mdxSource: MDXRemoteSerializeResult
}

// Helper to generate heading ID from text
function generateHeadingId(text: string | React.ReactNode): string {
  const textContent = typeof text === 'string' ? text : String(text)
  return textContent
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Custom components for MDX
const components = {
  h1: (props: React.ComponentProps<'h1'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h1 className="text-4xl font-bold tracking-tight mb-6 mt-8 scroll-mt-20" id={id} {...props} />
    )
  },
  h2: (props: React.ComponentProps<'h2'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h2 className="text-3xl font-semibold tracking-tight mb-4 mt-8 scroll-mt-20" id={id} {...props} />
    )
  },
  h3: (props: React.ComponentProps<'h3'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h3 className="text-2xl font-semibold tracking-tight mb-3 mt-6 scroll-mt-20" id={id} {...props} />
    )
  },
  h4: (props: React.ComponentProps<'h4'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h4 className="text-xl font-semibold tracking-tight mb-3 mt-4 scroll-mt-20" id={id} {...props} />
    )
  },
  h5: (props: React.ComponentProps<'h5'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h5 className="text-lg font-semibold tracking-tight mb-2 mt-4 scroll-mt-20" id={id} {...props} />
    )
  },
  h6: (props: React.ComponentProps<'h6'>) => {
    const id = props.id || (props.children ? generateHeadingId(props.children) : undefined)
    return (
      <h6 className="text-base font-semibold tracking-tight mb-2 mt-4 scroll-mt-20" id={id} {...props} />
    )
  },
  p: (props: React.ComponentProps<'p'>) => (
    <p className="leading-7 mb-4 text-foreground" {...props} />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a
      className="text-primary hover:underline font-medium"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />
  ),
  li: (props: React.ComponentProps<'li'>) => (
    <li className="leading-7 text-foreground" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
      {...props}
    />
  ),
  code: (props: React.ComponentProps<'code'>) => {
    const { className, children, ...rest } = props
    // Check if this is an inline code or code block
    const isInline = !className

    if (isInline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
          {...rest}
        >
          {children}
        </code>
      )
    }

    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
  pre: (props: React.ComponentProps<'pre'>) => (
    <pre
      className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm border"
      {...props}
    />
  ),
  hr: (props: React.ComponentProps<'hr'>) => (
    <hr className="my-8 border-border" {...props} />
  ),
  table: (props: React.ComponentProps<'table'>) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-border" {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<'th'>) => (
    <th
      className="px-4 py-2 bg-muted font-semibold text-left text-sm"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<'td'>) => (
    <td className="px-4 py-2 border-t border-border text-sm" {...props} />
  ),
  img: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg my-4 max-w-full h-auto"
      loading="lazy"
      {...props}
      alt={props.alt || ''}
    />
  ),
  // MBTI-specific components
  DichotomyScale,
  ComparisonTable,
  MBTITypeCard,
  CognitiveFunctionsStack,
  QuestionBox,
  Callout,
}

export function MDXRenderer({ mdxSource }: MDXRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  )
}
