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
	designation: z.string({ required_error: "La designation est requise." }),
	branchId: z.string({ required_error: "L'id nom de la filiere est requis." }),
	levelId: z.string({ required_error: "L'id nom du niveau est requis." }),
	institute_id: z.string({ required_error: "L'id de l'institut est requis." }),
});

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const bodyPayload = createSchema.parse(await requestJsonBody(request));
			console.log("Voici les inforamtions de creation : ", bodyPayload);
			const branch = await fetchJson<any>(
				backendUrl(`/api/institutes/salles`),
				{
					method: "POST",
					body: JSON.stringify({
						level_id: bodyPayload.levelId,
						branch_id: bodyPayload.branchId,
						institute_id: bodyPayload.institute_id,
						designation: bodyPayload.designation,
					}),
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
