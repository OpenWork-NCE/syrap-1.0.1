import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson, requestJsonBody, getClientIp } from "@/app/lib/utils";
import { serializeError } from "serialize-error";
import { z } from "zod";

export const dynamic = "force-dynamic";

const moveSchema = z.object({
	folder_id: z.string().nullable(),
});

export async function POST(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const body = moveSchema.parse(await requestJsonBody(request));

			const response = await fetchJson<any>(
				backendUrl(`/api/documents/${id}/move`),
				{
					method: "POST",
					body: JSON.stringify(body),
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
			console.error(`Error moving document ${id}:`, error);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	});
}
