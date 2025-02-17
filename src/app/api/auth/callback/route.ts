import { extractQueryParams } from '@/app/lib/utils';
import { response } from 'express';
import moment from 'moment';
import { cookies } from 'next/headers';
import { serializeError } from 'serialize-error';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    //get search params
    const searchParams = extractQueryParams(request);

    //local callback url
    let _callback_url = searchParams._callback_url;

    // save the callback url in cookie if present
    if (process.env.USER_AUTH_CALLBACK_URL_COOKIE_KEY && _callback_url) {
      cookies().set(
        process.env.USER_AUTH_CALLBACK_URL_COOKIE_KEY,
        _callback_url,
        {
          path: '/',
          httpOnly: true,
          sameSite: true,
          expires: moment().add(15, 'minutes').toDate(),
        },
      );
    } else {
      _callback_url = cookies().get(
        process.env.USER_AUTH_CALLBACK_URL_COOKIE_KEY!,
      )?.value;
    }

    return new Response(JSON.stringify({ callbackUrl: _callback_url }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify(serializeError(error)), { status: 500 });
  }
}
