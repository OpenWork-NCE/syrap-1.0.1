import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// POST - Marquer une conversation comme lue
export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl(`/api/messages/conversations/${id}/read`),
				{
					method: "POST",
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
