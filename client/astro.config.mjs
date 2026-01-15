import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.agilist.co.uk',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    optimizeDeps: {
      exclude: ['@openai/agents', '@openai/agents-openai', '@openai/agents-realtime']
    },
    ssr: {
      external: ['@openai/agents', '@openai/agents-openai', '@openai/agents-realtime']
    }
  }
})
