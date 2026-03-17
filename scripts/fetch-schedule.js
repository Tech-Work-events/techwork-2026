import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file if it exists
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) return
        const key = trimmed.substring(0, eqIndex).trim()
        const value = trimmed.substring(eqIndex + 1).trim()
        if (key && !process.env[key]) {
            process.env[key] = value
        }
    })
}

const API_KEY = process.env.CONFERENCE_HALL_API_KEY
const API_URL = process.env.CONFERENCE_HALL_URL

if (!API_KEY || !API_URL) {
    console.error('Error: CONFERENCE_HALL_API_KEY and CONFERENCE_HALL_URL must be set in .env')
    process.exit(1)
}

const OUTPUT_FILE = path.resolve(__dirname, '../src/data/schedule.json')

async function fetchSchedule() {
    console.log(`Fetching schedule from ${API_URL}...`)
    try {
        const response = await fetch(API_URL, {
            headers: { 'X-API-Key': API_KEY },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Validate response before overwriting
        if (!data || !data.sessions || !Array.isArray(data.sessions)) {
            throw new Error('Invalid response: missing sessions array')
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2))
        console.log(`Schedule saved to ${OUTPUT_FILE}`)
        console.log(`  ${data.sessions.length} sessions found`)
    } catch (error) {
        console.error('Error fetching schedule:', error)
        process.exit(1)
    }
}

fetchSchedule()
