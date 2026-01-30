import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders, accessToken }) => {
		try {
			const cookieStore = cookies();

			if (accessToken) {
				try {
					await fetchJson(backendUrl(`/api/auth/logout`), {
						method: "DELETE",
						cache: "no-cache",
						body: JSON.stringify({ accessToken: accessToken }),
						headers: {
							"Content-Type": "application/json",
							...authHeaders,
						},
					});
				} catch (backendError) {
					// Ignorer les erreurs du backend (token déjà expiré, etc.)
					console.warn("Backend logout error (ignored):", backendError);
				}
			}

			// Toujours supprimer les cookies locaux, même si le backend échoue
			cookieStore.delete(process.env.USER_SESSION_COOKIE_KEY!);
			cookieStore.delete(process.env.USER_SESSION_USER_COOKIE_KEY!);
			cookieStore.delete(process.env.USER_SESSION_INSTITUTE_KEY!);
			cookieStore.delete(process.env.USER_SESSION_PROFILES_COOKIE_KEY!);
			cookieStore.delete(process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!);

			return new Response(undefined, { status: 204 });
		} catch (e) {
			console.error("Logout error:", e);
			return new Response(JSON.stringify(serializeError(e)), { status: 500 });
		}
	});
}
