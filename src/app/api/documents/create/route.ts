import { serializeError } from 'serialize-error';
import {
  backendUrl,
  fetchJson,
  getClientIp,
  requestJsonBody,
} from '@/app/lib/utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z
    .string({ required_error: 'Le nom de la filiere est requis.' })
    .min(3, 'Plus de trois caractères')
    .max(100, 'Moins de 100 caractères.'),
  file: z.unknown({ required_error: 'Champ requis' }),
});

export async function POST(request: Request) {
  // return adminMiddleware(req, async (user) => {
  try {
    const bodyPayload = createSchema.parse(await requestJsonBody(request));
    const branch = await fetchJson<any>(backendUrl(`/api/files`), {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
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
