import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, extractQueryParams, fetchJson } from "@/app/lib/utils";
import IPaginateResponse from "@/interfaces/IPaginateResponse";
import { compileNonPath } from "next/dist/shared/lib/router/utils/prepare-destination";

export const dynamic = "force-dynamic";

export async function GET(
	req: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			//query params
			const queryParams: { page: string; limit: string } =
				extractQueryParams(req);

			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/acteurs/ipes/${id}/salles`, queryParams),
				{
					headers: {
						method: "GET",
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
