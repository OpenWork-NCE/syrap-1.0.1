import { cookies } from "next/headers";
import { serializeError } from "serialize-error";
import { User } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const currentUser = cookies().get(
			process.env.USER_SESSION_USER_COOKIE_KEY!,
		);

		if (currentUser)
			return new Response(currentUser.value, {
				status: 200,
			});
		else
			return new Response(
				JSON.stringify({ id: "", name: "", email: "" } as User),
				{ status: 200 },
			);
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
