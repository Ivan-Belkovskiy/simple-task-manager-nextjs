import 'server-only';

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
];

export function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('origin');

    const allowOrigin =
        !origin
            ? '*'
            : ALLOWED_ORIGINS.includes(origin)
                ? origin
                : '';

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };

    if (allowOrigin) {
        headers['Access-Control-Allow-Origin'] = allowOrigin;
    }

    return headers;
}

export async function handleOptions(request: Request): Promise<Response> {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}