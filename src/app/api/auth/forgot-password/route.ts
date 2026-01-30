import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { z } from "zod";

export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
	email: z
		.string({ required_error: "Une adresse mail est requise." })
		.email("L'adresse mail doit être valide."),
});

export async function POST(request: Request) {
	try {
		const bodyPayload = forgotPasswordSchema.parse(
			await requestJsonBody(request),
		);

		// Call the backend API to send a password reset email
		await fetchJson(backendUrl(`/api/auth/forgot-password`), {
			method: "POST",
			body: JSON.stringify(bodyPayload),
			headers: {
				"Content-Type": "application/json",
				"x-user-ip": getClientIp(request),
				"x-user-agent": request.headers.get("user-agent")!,
			},
		});

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error("Forgot password error:", error);
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
