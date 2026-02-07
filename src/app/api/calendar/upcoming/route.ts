import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// GET - Événements à venir (pour le dashboard)
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const limit = searchParams.get("limit") || "5";

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl(`/api/calendar/upcoming?limit=${limit}`),
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				}
			);
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify(error), { status: 500 });
		}
	});
}
