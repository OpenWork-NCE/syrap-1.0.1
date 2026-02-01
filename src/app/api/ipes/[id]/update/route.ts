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

// Schema pour la mise à jour d'un IPES (tous les champs optionnels sauf name)
const updateSchema = z.object({
	name: z
		.string({ required_error: "Le nom de l'IPES est requis." })
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
				if (!val) return true; // Permet vide
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(val);
			},
			{
				message: "Format d'email invalide",
			},
		)
		.optional()
		.nullable(),
	arrondissement_id: z.string().optional().nullable(),
	user_id: z.string().optional().nullable(),
	university_id: z.string({
		required_error: "L'identifiant de l'université de tutelle est requis.",
	}),
	decret_creation: z.string().optional().nullable(),
	arrete_ouverture: z.string().optional().nullable(),
	promoteur: z.string().optional().nullable(),
});

export async function PUT(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const rawBody = await requestJsonBody(request);
			const parseResult = updateSchema.safeParse(rawBody);

			if (!parseResult.success) {
				return new Response(JSON.stringify({
					error: "Validation failed",
					details: parseResult.error.errors
				}), { status: 400 });
			}

			const bodyPayload = parseResult.data;
			const result = await fetchJson<any>(
				backendUrl(`/api/acteurs/ipes/${id}`),
				{
					method: "PUT",
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
