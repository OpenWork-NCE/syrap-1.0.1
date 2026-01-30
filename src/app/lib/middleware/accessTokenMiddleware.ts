import { cookies } from 'next/headers';

export default async function accessTokenMiddleware(
  cb: (options: {
    accessToken?: string;
    authHeaders: Record<string, any>;
  }) => Promise<Response> | Response,
) {
  //get access token
  const accessTokenCookie = cookies().get(process.env.USER_SESSION_COOKIE_KEY!);

  const headers: Record<string, any> = {};

  if (accessTokenCookie) {
    headers.Authorization = `Bearer ${accessTokenCookie.value}`;
  }

  return cb({
    accessToken: accessTokenCookie?.value,
    authHeaders: headers,
  });
}
