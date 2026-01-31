import { cookies } from "next/headers";
import { serializeError } from "serialize-error";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const cookieStore = cookies();

		// Lire tous les cookies en une seule fois
		const userCookie = cookieStore.get(process.env.USER_SESSION_USER_COOKIE_KEY!);
		const institutionCookie = cookieStore.get(process.env.USER_SESSION_INSTITUTE_KEY!);
		const authorizationsCookie = cookieStore.get(process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!);

		// Parser les valeurs
		const user = userCookie?.value
			? JSON.parse(userCookie.value)
			: { id: "", name: "", email: "" };

		const institution = institutionCookie?.value
			? JSON.parse(institutionCookie.value)
			: { id: "", name: "", slug: "", model: "", code: "" };

		const authorizations = authorizationsCookie?.value
			? JSON.parse(authorizationsCookie.value)
			: [];

		return Response.json({
			user,
			institution,
			authorizations,
		});
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
