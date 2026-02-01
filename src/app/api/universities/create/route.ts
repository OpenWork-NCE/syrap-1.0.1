import { serializeError } from "serialize-error";
import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import { z } from "zod";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";

export const dynamic = "force-dynamic";

// Schema pour la création d'une université
const createSchema = z.object({
	name: z
		.string({ required_error: "Le nom de l'université est requis." })
		.min(3, "Plus de trois caractères")
		.max(100, "Moins de 100 caractères."),
	code: z
		.string()
		.max(20, "Moins de 20 caractères.")
		.optional()
		.nullable(),
	phone: z
		.string()
		.max(20, "Moins de 20 caractères.")
		.optional()
		.nullable(),
	email: z
		.string()
		.refine(
			(val) => {
				if (!val) return true;
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(val);
			},
			{
				message: "Format d'email invalide",
			},
		)
		.optional()
		.nullable(),
	description: z.string().optional().nullable(),
	arrondissement_id: z.string().optional().nullable(),
	user_id: z.string().optional().nullable(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			const result = await fetchJson<any>(
				backendUrl(`/api/acteurs/universities`),
				{
					method: "POST",
					body: JSON.stringify(bodyPayload),
					headers: {
						"Content-Type": "application/json",
						"x-user-ip": getClientIp(request),
						"x-user-agent": request.headers.get("user-agent")!,
						"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
						...authHeaders,
					},
				},
			);
			return new Response(JSON.stringify(result));
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
