import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders, accessToken }) => {
		try {
			if (accessToken) {
				await fetchJson(backendUrl(`/api/auth/logout`), {
					method: "DELETE",
					cache: "no-cache",
					body: JSON.stringify({ accessToken: accessToken }),
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
				});
				cookies().delete(process.env.USER_SESSION_COOKIE_KEY!);
				cookies().delete(process.env.USER_SESSION_USER_COOKIE_KEY!);
				cookies().delete(process.env.USER_SESSION_INSTITUTE_KEY!);
				cookies().delete(process.env.USER_SESSION_PROFILES_COOKIE_KEY!);
				cookies().delete(process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!);
			}
			return new Response(undefined, { status: 204 });
		} catch (e) {
			return new Response(JSON.stringify(serializeError(e)), { status: 500 });
		}
	});
}
