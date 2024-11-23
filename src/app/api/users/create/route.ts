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
	email: z.string().refine(
		(val) => {
			// Custom regex for email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(val);
		},
		{
			message: "Format d'email invalide",
		},
	),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.regex(
			/[A-Z]/,
			"Le mot de passe doit contenir au moins une lettre majuscule",
		)
		.regex(
			/[a-z]/,
			"Le mot de passe doit contenir au moins une lettre minuscule",
		)
		.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
		.regex(
			/[\W_]/,
			"Le mot de passe doit contenir au moins un caractère spécial (ex. @, !, #, etc.)",
		),
	Roles: z.array(z.string()).optional(),
	model_id: z.string(),
	model: z.string(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			const parsedRoles = bodyPayload.Roles?.map((roles) => Number(roles));
			const body = JSON.stringify({
				name: bodyPayload.name,
				email: bodyPayload.email,
				password: bodyPayload.password,
				roles: parsedRoles,
				model_id: Number(bodyPayload.model_id),
				model: bodyPayload.model,
			});
			console.log("Voici le format de retour du body : ", body);
			const branch = await fetchJson<any>(backendUrl(`/api/users`), {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
					"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
					...authHeaders,
				},
			});

			if (!branch.ok) {
				console.log("Voici l'erreur et le type : ", branch);
			}
			return new Response(JSON.stringify(branch));
			console.log("Tout s'est bien passé");
		} catch (error) {
			console.log("Une soucis : ", error, " le status de l'erreur : ", error);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
