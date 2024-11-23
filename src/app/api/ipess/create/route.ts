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
		.string({ required_error: "Le nom de la filiere est requis." })
		.min(3, "Plus de trois caractères")
		.max(100, "Moins de 100 caractères."),
	code: z
		.string()
		.min(1, "Plus de trois caractères")
		.max(20, "Moins de 100 caractères.")
		.optional(),
	phone: z
		.string()
		.min(3, "Plus de trois caractères")
		.max(20, "Moins de 100 caractères.")
		.optional(),
	email: z
		.string()
		.refine(
			(val) => {
				// Custom regex for email validation
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(val);
			},
			{
				message: "Format d'email invalide",
			},
		)
		.optional(),
	arrondissement_id: z.string({
		required_error: "L'identifiant d'un arrondissement est requis.",
	}),
	user_id: z.string({
		required_error: "L'identifiant d'un utilisateur est requis.",
	}),
	cenadi_id: z.string({
		required_error: "L'identifiant de l'entité Cenadi est requis.",
	}),
	university_id: z.string({
		required_error: "L'identifiant de l'université de tutelle est requis.",
	}),
	decret_creation: z.string().optional(),
	arrete_ouverture: z.string().optional(),
	promoteur_id: z.string().optional(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			const branch = await fetchJson<any>(backendUrl(`/api/acteurs/ipes`), {
				method: "POST",
				body: JSON.stringify(bodyPayload),
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
					"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
					...authHeaders,
				},
			});
			return new Response(JSON.stringify(branch));
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
