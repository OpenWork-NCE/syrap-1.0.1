import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';
import { backendUrl, extractQueryParams, fetchJson } from '@/app/lib/utils';
import IPaginateResponse from '@/interfaces/IPaginateResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    console.log("Je suis encore ici");
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      const response = await fetchJson<IPaginateResponse<any>>(
        backendUrl(`/api/dashboard`),
        {
          headers: {
            method: 'GET',
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          cache: 'no-cache',
        },
      );
      console.log("Voici la réponse de la requête renvoyée : ", JSON.stringify(response));
      return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }
  });
}
