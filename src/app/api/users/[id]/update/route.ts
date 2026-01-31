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

// Schéma de mise à jour - tous les champs sont optionnels sauf name et email
const updateSchema = z.object({
	name: z
		.string({ required_error: "Le nom est requis." })
		.min(3, "Plus de trois caractères")
		.max(100, "Moins de 100 caractères."),
	email: z.string().refine(
		(val) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(val);
		},
		{
			message: "Format d'email invalide",
		},
	),
	// Password optionnel pour la mise à jour
	password: z
		.string()
		.optional()
		.refine(
			(val) => {
				// Si vide ou undefined, c'est OK (pas de changement)
				if (!val || val.length === 0) return true;
				// Sinon, valider le format
				return val.length >= 8;
			},
			{ message: "Le mot de passe doit contenir au moins 8 caractères" },
		),
	roles: z.array(z.string()).optional(),
	Roles: z.array(z.string()).optional(),
	model_id: z.string().optional(),
	model: z.string().optional(),
});

export async function PUT(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = updateSchema.parse(await requestJsonBody(request));

			// Construire le body avec seulement les champs présents
			const bodyData: Record<string, any> = {
				name: bodyPayload.name,
				email: bodyPayload.email,
			};

			// Ajouter password seulement s'il est fourni et non vide
			if (bodyPayload.password && bodyPayload.password.length > 0) {
				bodyData.password = bodyPayload.password;
			}

			// Ajouter roles si fourni
			const roles = bodyPayload.roles || bodyPayload.Roles;
			if (roles && roles.length > 0) {
				bodyData.roles = roles.map((role) => Number(role));
			}

			// Ajouter model si fourni (pour changer l'organisation)
			if (bodyPayload.model) {
				bodyData.model = bodyPayload.model;
			}

			// Ajouter model_id si fourni
			if (bodyPayload.model_id) {
				bodyData.model_id = Number(bodyPayload.model_id);
			}

			const body = JSON.stringify(bodyData);
			console.log("Update user body:", body);

			const user = await fetchJson<any>(backendUrl(`/api/users/${id}`), {
				method: "PUT",
				body,
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
					"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
					...authHeaders,
				},
			});
			return new Response(JSON.stringify(user));
		} catch (error) {
			console.error("Error updating user:", error);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
