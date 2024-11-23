import { cookies } from "next/headers";
import { serializeError } from "serialize-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const currentUserAuthorizations = cookies().get(
			process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!,
		);

		if (currentUserAuthorizations)
			return new Response(currentUserAuthorizations.value, {
				status: 200,
			});
		else return new Response(JSON.stringify([]), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
