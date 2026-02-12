import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// GET - Récupérer les notifications paginées
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const page = searchParams.get("page") || "1";
	const perPage = searchParams.get("per_page") || "20";

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl(`/api/notifications?page=${page}&per_page=${perPage}`),
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
			return new Response(
				JSON.stringify({ data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } }),
				{ status: 200 },
			);
		}
	});
}
