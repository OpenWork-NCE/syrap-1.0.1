import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// GET - Nombre de notifications non lues
export async function GET(req: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl("/api/notifications/unread-count"),
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
			return new Response(JSON.stringify({ unread_count: 0 }), { status: 200 });
		}
	});
}
