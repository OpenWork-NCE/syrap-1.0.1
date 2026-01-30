import { serializeError } from "serialize-error";
import {
	backendUrl,
	extractQueryParams,
	fetchJson,
	requestJsonBody,
} from "@/app/lib/utils";
import { z } from "zod";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import IPaginateResponse from "@/interfaces/IPaginateResponse";

export const dynamic = "force-dynamic";

const createSchema = z.object({
	salle_id: z.string({
		required_error:
			"L'identifiant de la dseuxieme salle de comparaison est requise.",
	}),
});

export async function POST(
	req: Request,
	{ params: { id } }: { params: { id: string } },
) {
	console.log("Je suis ici");
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			//query params
			const queryParams: { page: string; limit: string } =
				extractQueryParams(req);
			console.log("J'entre");
			const bodyPayload = createSchema.parse(await requestJsonBody(req));
			console.log("Voici le bodyPayload : ", bodyPayload);
			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/programmes/salles/comparer/${id}`, queryParams),
				{
					method: "POST",
					body: JSON.stringify(bodyPayload),
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				},
			);

			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify(error), { status: 500 });
		}
	});
}
