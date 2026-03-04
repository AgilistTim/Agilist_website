import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    canonicalUrl: z.string().url().optional(), // For LinkedIn cross-posts
    linkedinUrl: z.string().url().optional() // Alternative field name
  })
})

export const collections = { blog }
