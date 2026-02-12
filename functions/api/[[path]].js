// Cloudflare Worker Functions
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // If requesting the API endpoint, return all registrations
    if (url.pathname === '/api/registrations') {
        try {
            // List all keys in KV
            const list = await env.REGISTRATIONS.list();
            const registrations = [];

            // Fetch each registration
            for (const key of list.keys) {
                const data = await env.REGISTRATIONS.get(key.name);
                if (data) {
                    registrations.push(JSON.parse(data));
                }
            }

            return new Response(JSON.stringify({
                success: true,
                count: registrations.length,
                registrations: registrations
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                error: 'Failed to fetch registrations',
                details: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }

    // For other GET requests, pass through to the static page
    return context.next();
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Handle registration POST request
    if (url.pathname === '/api/register') {
        try {
            // Parse the incoming JSON data
            const data = await request.json();
            const { name, email, phone} = data;

            // Validate input
            if (!name || !email) {
                return new Response(JSON.stringify({
                    error: 'Name and email are required'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return new Response(JSON.stringify({
                    error: 'Invalid email format'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
			
            // Validate phone number if provided (optional validation)
            if (phone && phone.trim() !== '') {
                // Basic phone validation - you can make this more strict if needed
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(phone)) {
                    return new Response(JSON.stringify({
                        error: 'Invalid phone number format'
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
            }

            // Check if email already exists
            const existingUser = await env.REGISTRATIONS.get(email);
            if (existingUser) {
                return new Response(JSON.stringify({
                    error: 'Email already registered'
                }), {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
			
	

            // Create registration object
            const registration = {
                name,
                email,
				phone: phone || '',
                registeredAt: new Date().toISOString(),
                id: crypto.randomUUID()
            };

            // Store in KV (using email as key)
            await env.REGISTRATIONS.put(
                email,
                JSON.stringify(registration)
            );
			
			
            return new Response(JSON.stringify({
                success: true,
                message: 'Registration successful!',
                data: registration
            }), {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({
                error: 'Registration failed',
                details: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }

    // If not a registration endpoint, return 404
    return new Response('Not Found', { status: 404 });
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
