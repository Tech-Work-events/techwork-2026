import { SERVICES_DATA } from '../../config'

export async function GET() {
    try {
        const apiUrl = `${SERVICES_DATA.cfp.api.endpoint}?key=${SERVICES_DATA.cfp.api.key}`
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            return new Response(JSON.stringify({
                error: 'API call failed',
                status: response.status,
                statusText: response.statusText,
                url: apiUrl
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        
        const data = await response.json()
        
        return new Response(JSON.stringify({
            success: true,
            url: apiUrl,
            data: data,
            processedData: {
                title: data.name,
                description: data.description,
                isOpen: data.cfpState === 'opened',
                cfpState: data.cfpState,
                cfpEnd: data.cfpEnd,
                conferenceStart: data.conferenceStart,
                address: data.address,
                formats: data.formats
            }
        }, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Exception occurred',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}