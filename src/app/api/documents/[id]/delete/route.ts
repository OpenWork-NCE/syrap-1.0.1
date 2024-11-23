import { serializeError } from 'serialize-error';
import { backendUrl, fetchJson, getClientIp } from '@/app/lib/utils';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params: { id } }: { params: { id: string } },
) {
  // return adminMiddleware(req, async (user) => {
  try {
    const branch = await fetchJson<any>(backendUrl(`/api/files/${id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-ip': getClientIp(request),
        'x-user-agent': request.headers.get('user-agent')!,
        'x-user-auth': request.headers.get('x-auto-auth') ?? 'false',
      },
    });
    return new Response(JSON.stringify(branch));
  } catch (error) {
    return new Response(JSON.stringify(serializeError(error)), { status: 500 });
  }
  // })
}
