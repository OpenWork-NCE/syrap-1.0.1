import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyTokenSchema = z.object({
	token: z.string({ required_error: "Le token est requis." }),
});

export async function POST(request: Request) {
	try {
		const bodyPayload = verifyTokenSchema.parse(await requestJsonBody(request));

		// Call the backend API to verify the reset token
		await fetchJson(backendUrl(`/api/auth/verify-reset-token`), {
			method: "POST",
			body: JSON.stringify(bodyPayload),
			headers: {
				"Content-Type": "application/json",
				"x-user-ip": getClientIp(request),
				"x-user-agent": request.headers.get("user-agent")!,
			},
		});

		return new Response(JSON.stringify({ valid: true }), { status: 200 });
	} catch (error) {
		console.error("Verify reset token error:", error);
		return new Response(JSON.stringify({ valid: false }), { status: 400 });
	}
}
