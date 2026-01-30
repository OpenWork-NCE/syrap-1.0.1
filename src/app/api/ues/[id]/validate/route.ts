import { serializeError } from "serialize-error";
import {
	backendUrl,
	fetchJson,
	getClientIp,
} from "@/app/lib/utils";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(
				backendUrl(`/api/programmes/ues/validate/${id}`),
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
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
