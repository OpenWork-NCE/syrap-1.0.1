import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';
import { backendUrl, extractQueryParams, fetchJson } from '@/app/lib/utils';
import IPaginateResponse from '@/interfaces/IPaginateResponse';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      //query params
      const queryParams: { page: string; limit: string } =
        extractQueryParams(req);

      console.log(
        'Voici les informations du header lors de la soumission : ',
        authHeaders,
      );
      console.log(
        'Voici le cle du token lors de la soumission : ',
        process.env.USER_SESSION_COOKIE_KEY!,
      );
      console.log(
        'Voici le token lors de la soumissions : ',
        cookies().get(process.env.USER_SESSION_COOKIE_KEY!),
      );

      const response = await fetchJson<IPaginateResponse<any>>(
        backendUrl(`/api/programmes/ues`, queryParams),
        {
          headers: {
            method: 'GET',
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          cache: 'no-cache',
        },
      );
      return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }
  });
}
