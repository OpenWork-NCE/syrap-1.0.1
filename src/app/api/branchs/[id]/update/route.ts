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
	description: z.string().optional(),
});

export async function PUT(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			const branch = await fetchJson<any>(
				backendUrl(`/api/institutes/branchs/${id}`),
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
			return new Response(JSON.stringify(branch));
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
