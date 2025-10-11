export type UTMParams = Partial<{
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
}>

/** Merge incoming UTM params with defaults.
 * Rule: incoming overrides only if non-empty; otherwise keep defaults. Remove empties at the end.
 */
export function mergeUtm(incoming: UTMParams = {}, defaults: UTMParams = {}): UTMParams {
    const result: UTMParams = { ...defaults }
    for (const [k, v] of Object.entries(incoming) as [keyof UTMParams, string][]) {
        if (v !== undefined && v !== null && String(v).trim() !== '') {
            result[k] = v
        }
    }
    for (const k of Object.keys(result) as Array<keyof UTMParams>) {
        const v = result[k]
        if (v === undefined || v === null || String(v).trim() === '') {
            delete result[k]
        }
    }
    return result
}

/** Build a URL by merging UTM params into base URL. Preserves existing query params on baseUrl. */
export function buildUrlWithUtm(baseUrl: string, utm: UTMParams): string {
    try {
        const url = new URL(baseUrl)
        Object.entries(utm).forEach(([key, value]) => {
            if (!value) return
            url.searchParams.set(key, value)
        })
        return url.toString()
    } catch {
        // If baseUrl is relative, fallback to string concatenation
        const q = new URLSearchParams(utm as Record<string, string>).toString()
        if (!q) return baseUrl
        return baseUrl.includes('?') ? `${baseUrl}&${q}` : `${baseUrl}?${q}`
    }
}

/** Extract current page UTM params from a location-like object */
export function getIncomingUtmFromLocation(locationLike: { search: string }): UTMParams {
    const params = new URLSearchParams(locationLike.search)
    const utm: UTMParams = {}
    ;(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const).forEach((k) => {
        const v = params.get(k)
        if (v) utm[k] = v
    })
    return utm
}
