import type { Session, Speaker, Track, Category } from '../type'
import scheduleData from './schedule.json'

// Conference-Hall API types
interface CHSpeaker {
    id: string
    name: string
    bio: string | null
    company: string | null
    picture: string | null
    socialLinks: string[]
}

interface CHProposal {
    id: string
    proposalNumber: number
    abstract: string
    level: string | null
    formats: string[]
    categories: string[]
    speakers: CHSpeaker[]
}

interface CHSession {
    id: string
    start: string
    end: string
    track: string
    title: string
    language: string | null
    proposal: CHProposal | null
}

interface CHSchedule {
    name: string
    days: string[]
    timeZone: string
    sessions: CHSession[]
}

export type CommonSession = {
    id: string
    title: string
    dateStart: string
    dateEnd: string
    durationMinutes: number
}

type ScheduleResult = {
    sessions: Session[]
    speakers: Speaker[]
    tracks: Track[]
    categories: Category[]
    commonSessions: CommonSession[]
}

const CATEGORY_COLORS: Record<string, { color: string; colorSecondary: string }> = {
    Agilité: { color: '#e67e22', colorSecondary: '#fdebd0' },
    Craft: { color: '#2ecc71', colorSecondary: '#d5f5e3' },
    'Cloud & DevOps': { color: '#3498db', colorSecondary: '#d6eaf8' },
    'Data & IA': { color: '#9b59b6', colorSecondary: '#e8daef' },
}

// Conference-Hall returns local times with a misleading Z suffix.
// Strip it so JS treats them as local wall-clock times.
function fixTimestamp(iso: string): string {
    return iso.replace('Z', '')
}

// Normalize workshop track names
function normalizeTrackName(name: string): string {
    if (name.startsWith('Workshop')) return 'Workshop'
    return name
}

function inferSocialIcon(url: string): { name: string; icon: string; link: string } {
    const lowerUrl = url.toLowerCase()
    let icon = 'web'

    if (lowerUrl.includes('github.com') || lowerUrl.includes('gitlab.com')) icon = 'github'
    else if (lowerUrl.includes('linkedin.com')) icon = 'linkedin'
    else if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) icon = 'twitter'
    else if (lowerUrl.includes('bsky.app') || lowerUrl.includes('bluesky')) icon = 'bluesky'
    else if (lowerUrl.includes('mastodon') || lowerUrl.includes('piaille')) icon = 'mastodon'

    return { name: icon, icon, link: url }
}

// In-memory cache
let cachedResult: ScheduleResult | null = null

export function getScheduleData(): ScheduleResult {
    if (cachedResult) {
        return cachedResult
    }

    const data = scheduleData as CHSchedule

    // Only keep confirmed sessions (with a proposal)
    // Include keynotes from track "Commun" that have a proposal with format "Keynote"
    const confirmedSessions = data.sessions.filter((s) => s.proposal !== null)

    // Extract ALL tracks (including those with only placeholders) to show full schedule structure
    const trackOrder = ['Agilité', 'Craft', 'DevOps', 'Data', 'Workshop']
    const trackNames = [...new Set(data.sessions.map((s) => normalizeTrackName(s.track)))]
    trackNames.sort((a, b) => {
        const ia = trackOrder.indexOf(a)
        const ib = trackOrder.indexOf(b)
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
    const tracks: Track[] = trackNames.map((name) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
    }))

    // Extract unique categories
    const categoryNames = [...new Set(confirmedSessions.flatMap((s) => s.proposal!.categories))]
    const categories: Category[] = categoryNames.map((name) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        ...(CATEGORY_COLORS[name] || {}),
    }))

    // Extract unique speakers
    const speakerMap = new Map<string, Speaker>()
    for (const session of confirmedSessions) {
        for (const sp of session.proposal!.speakers) {
            if (!speakerMap.has(sp.id)) {
                speakerMap.set(sp.id, {
                    id: sp.id,
                    name: sp.name,
                    bio: sp.bio,
                    company: sp.company,
                    photoUrl: sp.picture,
                    jobTitle: null,
                    pronouns: null,
                    companyLogoUrl: null,
                    socials: sp.socialLinks.map(inferSocialIcon),
                })
            }
        }
    }
    const speakers = Array.from(speakerMap.values())

    // Transform sessions
    const sessions: Session[] = confirmedSessions.map((s) => {
        const dateStart = fixTimestamp(s.start)
        const dateEnd = fixTimestamp(s.end)
        const durationMinutes = Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 60000)

        const normalizedTrack = normalizeTrackName(s.track)
        const isKeynote = s.track === 'Commun' && s.proposal!.formats?.includes('Keynote')
        const trackId = isKeynote ? null : tracks.find((t) => t.name === normalizedTrack)?.id || null
        const categoryId = s.proposal!.categories[0]
            ? categories.find((c) => c.name === s.proposal!.categories[0])?.id || null
            : null
        const speakerIds = s.proposal!.speakers.map((sp) => sp.id)

        return {
            id: s.id,
            title: s.title,
            abstract: s.proposal!.abstract || null,
            dateStart,
            dateEnd,
            durationMinutes,
            speakerIds,
            trackId,
            language: s.language,
            level: s.proposal!.level || null,
            categoryId,
            formatId: s.proposal!.formats?.[0] || null,
            imageUrl: null,
            presentationLink: null,
            videoLink: null,
            tags: [],
            showInFeedback: false,
            hideTrackTitle: false,
            extendHeight: undefined,
            extendWidth: undefined,
            teaserVideoUrl: null,
            teaserImageUrl: null,
        }
    })

    // Extract common sessions (track "Commun" - pauses, accueil, etc.)
    // Exclude keynotes (they are now promoted to full Session objects)
    const isKeynoteSession = (s: CHSession) => s.proposal !== null && s.proposal.formats?.includes('Keynote')
    const commonSessions: CommonSession[] = data.sessions
        .filter((s) => s.track === 'Commun' && !isKeynoteSession(s))
        .map((s) => ({
            id: s.id,
            title: s.title,
            dateStart: fixTimestamp(s.start),
            dateEnd: fixTimestamp(s.end),
            durationMinutes: Math.round(
                (new Date(fixTimestamp(s.end)).getTime() - new Date(fixTimestamp(s.start)).getTime()) / 60000
            ),
        }))
        .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())

    cachedResult = { sessions, speakers, tracks, categories, commonSessions }
    return cachedResult
}
