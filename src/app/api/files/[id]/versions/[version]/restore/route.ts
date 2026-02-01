import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson, getClientIp } from "@/app/lib/utils";
import { serializeError } from "serialize-error";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	{ params }: { params: { id: string; version: string } },
) {
	const { id, version } = params;
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(
				backendUrl(`/api/documents/${id}/versions/${version}/restore`),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-user-ip": getClientIp(request),
						"x-user-agent": request.headers.get("user-agent")!,
						...authHeaders,
					},
				},
			);
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(
				`Error restoring version ${version} for document ${id}:`,
				error,
			);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	});
}
