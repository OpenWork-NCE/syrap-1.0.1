import { serializeError } from "serialize-error";
import {
	backendUrl,
	extractQueryParams,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import { z } from "zod";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import IPaginateResponse from "@/interfaces/IPaginateResponse";

export const dynamic = "force-dynamic";

const createSchema = z.object({
	ue: z
		.string({ required_error: "Lidentifiant de l'ue est requis." })
		.max(20, "Moins de 20 caractères."),
	year: z
		.string({ required_error: "Lidentifiant de l'ue est requis." })
		.length(4, "Doit etre de 4 caractères."),
	credit: z
		.string({ required_error: "Le nombre de credits est requis" })
		.max(4, "Moins de 4 caractères"),
	nbr_hrs: z.string({
		required_error: "Le nombre d'heures pour l'UE est requis.",
	}),
});

export async function PUT(
	req: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			//query params
			const queryParams: { page: string; limit: string } =
				extractQueryParams(req);
			const bodyPayload = createSchema.parse(await requestJsonBody(req));
			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/programmes/salles/${id}`, queryParams),
				{
					method: "PUT",
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
