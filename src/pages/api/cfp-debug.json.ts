export async function GET() {
    try {
        const apiUrl = 'https://conference-hall.io/api/v1/event/tech-work-2026?key=2dd5a5af-0aad-4028-8e5b-d11736362418'
        
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
            message: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}