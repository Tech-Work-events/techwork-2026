/// <reference types="astro/client" />

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any
    }
}

declare module 'astro:content' {
    interface Render {
        '.md': Promise<{
            Content: import('astro').MarkdownInstance<{}>['Content']
            headings: import('astro').MarkdownHeading[]
            remarkPluginFrontmatter: Record<string, any>
        }>
    }
}
