import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file if it exists (simple parser for local dev)
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=')
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const API_KEY = process.env.CONFERENCE_HALL_API_KEY
if (!API_KEY) {
    console.error('Error: CONFERENCE_HALL_API_KEY environment variable is not set.')
    console.error('Please add it to your .env file or set it as an environment variable.')
    process.exit(1)
}

const URL = 'https://conference-hall.io/api/v1/event/tech-work-lyon-2026'
const CONFIG_FILE = path.resolve(__dirname, '../src/config/cfp.json')

async function fetchCFP() {
    console.log(`Fetching CFP data from ${URL}...`)
    try {
        const response = await fetch(URL, {
            headers: {
                'X-API-Key': API_KEY,
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Read existing config
        let currentConfig
        try {
            currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
        } catch (e) {
            console.error(`Error reading config file ${CONFIG_FILE}:`, e)
            process.exit(1)
        }

        // Hardcoded date as per requirements, to be used if API doesn't provide it
        // In a real scenario, we might parse data.cfp.end if available
        const deadlineISO = '2026-03-02T23:59:59.999Z'
        const deadlineFrench = '2 mars 2026'

        // Update config
        const updatedConfig = {
            ...currentConfig,
            cfp: {
                ...currentConfig.cfp,
                deadline: deadlineFrench,
                deadlineISO: deadlineISO,
            },
        }

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 4))
        console.log(`Data updated in ${CONFIG_FILE}`)
        console.log('CFP Deadline:', updatedConfig.cfp.deadline)
    } catch (error) {
        console.error('Error fetching CFP data:', error)
        process.exit(1)
    }
}

fetchCFP()
