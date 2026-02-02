// @ts-check
import { defineConfig, envField } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), sitemap()],
    site: 'https://techwork.events',
    base: '/',
    redirects: {
        '/schedule': '/schedule/day-1',
    },
    env: {
        schema: {
            OPENPLANNER_URL: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_API_KEY: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_AUTH_DOMAIN: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_DATABASE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
            FIREBASE_PROJECT_ID: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_STORAGE_BUCKET: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_APP_ID: envField.string({ context: 'client', access: 'public', optional: false }),
            FIREBASE_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
            CONFERENCE_HALL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
        },
    },
})
