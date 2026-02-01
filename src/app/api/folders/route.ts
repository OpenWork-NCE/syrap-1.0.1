import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, extractQueryParams, fetchJson } from "@/app/lib/utils";
import IPaginateResponse from "@/interfaces/IPaginateResponse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const queryParams = extractQueryParams(req);

			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/folders`, queryParams),
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				},
			);
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Error fetching folders:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to fetch folders",
					message: error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}
	});
}
