import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT_FILE = path.resolve(__dirname, '../src/data/schedule.json')
const OUTPUT_FILE = path.resolve(__dirname, '../public/openfeedback.json')

// Infer the social network name from a raw profile URL.
// OpenFeedback expects socials as { name, link }.
function inferSocialName(url) {
    const u = url.toLowerCase()
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter'
    if (u.includes('github.com')) return 'github'
    if (u.includes('linkedin.com')) return 'linkedin'
    if (u.includes('mastodon') || u.includes('@')) return 'mastodon'
    if (u.includes('bsky') || u.includes('bluesky')) return 'bluesky'
    if (u.includes('youtube.com')) return 'youtube'
    if (u.includes('instagram.com')) return 'instagram'
    return 'website'
}

// Transform a Conference-Hall schedule.json into the OpenFeedback model:
// maps keyed by id for `sessions` and `speakers`.
function toOpenFeedback(schedule) {
    const sessions = {}
    const speakers = {}

    for (const s of schedule.sessions) {
        const proposal = s.proposal
        const speakerIds = (proposal?.speakers ?? []).map((sp) => sp.id)

        sessions[s.id] = {
            id: s.id,
            title: s.title,
            startTime: s.start,
            endTime: s.end,
            speakers: speakerIds,
            trackTitle: s.track,
            tags: proposal?.categories?.length ? proposal.categories : [s.track],
            ...(s.language ? { language: s.language } : {}),
            ...(proposal?.abstract ? { abstract: proposal.abstract } : {}),
            // Slots without a proposal (breaks, logistics) stay on the
            // calendar but collect no feedback.
            ...(speakerIds.length === 0 ? { hideInFeedback: true } : {}),
        }

        for (const sp of proposal?.speakers ?? []) {
            if (speakers[sp.id]) continue
            speakers[sp.id] = {
                id: sp.id,
                name: sp.name,
                ...(sp.picture ? { photoUrl: sp.picture } : {}),
                ...(sp.bio ? { bio: sp.bio } : {}),
                ...(sp.company ? { company: sp.company } : {}),
                socials: (sp.socialLinks ?? []).map((link) => ({
                    name: inferSocialName(link),
                    link,
                })),
            }
        }
    }

    return { sessions, speakers }
}

const schedule = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
const openfeedback = toOpenFeedback(schedule)

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(openfeedback, null, 2))
console.log(`OpenFeedback data written to ${OUTPUT_FILE}`)
console.log(
    `  ${Object.keys(openfeedback.sessions).length} sessions, ${Object.keys(openfeedback.speakers).length} speakers`
)
