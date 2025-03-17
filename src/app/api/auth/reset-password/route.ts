import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resetPasswordSchema = z.object({
	token: z.string({ required_error: "Le token est requis." }),
	password: z
		.string({ required_error: "Le mot de passe est requis." })
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(request: Request) {
	try {
		const bodyPayload = resetPasswordSchema.parse(
			await requestJsonBody(request),
		);

		// Call the backend API to reset the password
		await fetchJson(backendUrl(`/api/auth/reset-password`), {
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
		console.error("Reset password error:", error);
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
