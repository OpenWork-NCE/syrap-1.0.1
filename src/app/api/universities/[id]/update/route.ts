import { serializeError } from 'serialize-error';
import {
  backendUrl,
  fetchJson,
  getClientIp,
  requestJsonBody,
} from '@/app/lib/utils';
import { z } from 'zod';
import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z
    .string({ required_error: "Le nom de l'université est requis." })
    .min(3, 'Plus de trois caractères')
    .max(100, 'Moins de 100 caractères.'),
  code: z
    .string()
    .min(1, 'Plus de un caractère')
    .max(20, 'Moins de 20 caractères.')
    .optional(),
  description: z
    .string()
    .max(500, 'Moins de 500 caractères.')
    .optional(),
  phone: z
    .string()
    .max(20, 'Moins de 20 caractères.')
    .optional()
    .nullable(),
  email: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      },
      {
        message: "Format d'email invalide",
      },
    )
    .optional()
    .nullable(),
  arrondissement_id: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .optional()
    .nullable(),
  user_id: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .optional()
    .nullable(),
});

export async function PUT(
  request: Request,
  { params: { id } }: { params: { id: string } },
) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      const bodyPayload = updateSchema.parse(await requestJsonBody(request));
      const branch = await fetchJson<any>(
        backendUrl(`/api/acteurs/universities/${id}`),
        {
          method: 'PUT',
          body: JSON.stringify(bodyPayload),
          headers: {
            'Content-Type': 'application/json',
            'x-user-ip': getClientIp(request),
            'x-user-agent': request.headers.get('user-agent')!,
            'x-user-auth': request.headers.get('x-auto-auth') ?? 'false',
            ...authHeaders,
          },
        },
      );
      return new Response(JSON.stringify(branch));
    } catch (error) {
      return new Response(JSON.stringify(serializeError(error)), {
        status: 500,
      });
    }
  });
}
