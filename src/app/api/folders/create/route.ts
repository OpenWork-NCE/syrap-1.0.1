import { serializeError } from "serialize-error";
import { backendUrl, fetchJson, getClientIp, requestJsonBody } from "@/app/lib/utils";
import { z } from "zod";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";

export const dynamic = "force-dynamic";

const createSchema = z.object({
	name: z
		.string({ required_error: "Le nom du dossier est requis." })
		.min(1, "Le nom est requis")
		.max(255, "Le nom doit faire moins de 255 caractères"),
	description: z.string().optional().nullable(),
	parent_id: z.string().optional().nullable(),
	model: z.string().optional().nullable(),
	model_id: z.string().optional().nullable(),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));

			const result = await fetchJson<any>(backendUrl(`/api/folders`), {
				method: "POST",
				body: JSON.stringify(bodyPayload),
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
					...authHeaders,
				},
			});

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error creating folder:", error);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	});
}
