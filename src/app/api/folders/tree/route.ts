import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, extractQueryParams, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const queryParams = extractQueryParams(req);

			const response = await fetchJson<any>(
				backendUrl(`/api/folders/tree`, queryParams),
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
			console.error("Error fetching folder tree:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to fetch folder tree",
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
