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
		.string({ required_error: "L'intitulé du rôle est requis." })
		.min(3, "Plus de trois caractères")
		.max(100, "Moins de 100 caractères."),
	permissions: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			const parsedPermissions = bodyPayload.permissions?.map((permission) =>
				Number(permission),
			);
			const body = JSON.stringify({
				name: bodyPayload.name,
				permissions: parsedPermissions,
			});
			console.log("Voici le format de retour du body : ", body);
			const profile = await fetchJson<any>(
				backendUrl(`/api/authorisations/roles`),
				{
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/json",
						"x-user-ip": getClientIp(request),
						"x-user-agent": request.headers.get("user-agent")!,
						"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
						...authHeaders,
					},
				},
			);
			return new Response(JSON.stringify(profile));
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
