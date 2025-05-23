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

const createSchema = z.object({
	name: z
		.string({ required_error: "Le nom de l'université est requis." })
		.min(3, "Plus de trois caractères")
		.max(100, "Moins de 100 caractères."),
	code: z
		.string({ required_error: "Le code de l'université est requise." })
		.max(20, "Moins de 100 caractères."),
	phone: z.string().max(20, "Moins de 100 caractères.").optional(),
	email: z.string().optional(),
	description: z.string().optional(),
	arrondissement_id: z.string(),
	user_id: z.string(),
	cenadi_id: z.string(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			console.log("Voici les données en partance : ", bodyPayload);
			const branch = await fetchJson<any>(
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
			return new Response(JSON.stringify(branch));
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
