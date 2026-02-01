import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// Mock data pour le développement
const USE_MOCK = true;

// GET - Récupérer le nombre de messages non lus
export async function GET(req: Request) {
	if (USE_MOCK) {
		// Simule 3 messages non lus (cohérent avec les mock conversations)
		return new Response(
			JSON.stringify({ unread_count: 3 }),
			{ status: 200 }
		);
	}

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl("/api/messages/unread-count"),
				{
					headers: {
						method: "GET",
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				}
			);
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify({ unread_count: 0 }), { status: 200 });
		}
	});
}
