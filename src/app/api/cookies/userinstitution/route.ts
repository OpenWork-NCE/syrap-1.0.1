import { cookies } from "next/headers";
import { serializeError } from "serialize-error";
import { Institution } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const currentUserInstitution = cookies().get(
			process.env.USER_SESSION_INSTITUTE_KEY!,
		);

		if (currentUserInstitution)
			return new Response(currentUserInstitution.value, {
				status: 200,
			});
		else
			return new Response(
				JSON.stringify({ id: "", name: "", slug: "", code: "" } as Institution),
				{ status: 200 },
			);
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
