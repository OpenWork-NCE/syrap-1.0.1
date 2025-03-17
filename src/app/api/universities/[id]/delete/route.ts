import { serializeError } from 'serialize-error';
import { backendUrl, fetchJson, getClientIp } from '@/app/lib/utils';
import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params: { id } }: { params: { id: string } },
) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      const university = await fetchJson<any>(
        backendUrl(`/api/acteurs/universities/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-ip': getClientIp(request),
            'x-user-agent': request.headers.get('user-agent')!,
            'x-user-auth': request.headers.get('x-auto-auth') ?? 'false',
						...authHeaders
          },
        },
      );
      return new Response(JSON.stringify(university));
    } catch (error) {
      return new Response(JSON.stringify(serializeError(error)), {
        status: 500,
      });
    }
  });
}
