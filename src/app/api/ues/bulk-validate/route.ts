import { serializeError } from "serialize-error";
import {
	backendUrl,
	getClientIp,
} from "@/app/lib/utils";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const body = await request.json();

			const response = await fetch(
				backendUrl("/api/programmes/ues/bulk-validate"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-user-ip": getClientIp(request),
						"x-user-agent": request.headers.get("user-agent")!,
						...authHeaders,
					},
					body: JSON.stringify(body),
				},
			);

			// Propager le statut du backend directement
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return new Response(JSON.stringify(errorData), {
					status: response.status,
				});
			}

			const data = await response.json().catch(() => null);
			return new Response(JSON.stringify(data), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
			});
		}
	});
}
