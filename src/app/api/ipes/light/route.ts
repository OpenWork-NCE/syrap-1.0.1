import { backendUrl, fetchJson, getClientIp } from '@/app/lib/utils';
import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      const response = await fetchJson<any>(
        backendUrl('/api/acteurs/ipes/light'),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-ip': getClientIp(request),
            'x-user-agent': request.headers.get('user-agent')!,
            ...authHeaders,
          },
        },
      );
      return new Response(JSON.stringify(response));
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch ipes' }), {
        status: 500,
      });
    }
  });
}
