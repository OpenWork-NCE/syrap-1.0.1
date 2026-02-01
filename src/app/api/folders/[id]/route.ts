import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson, requestJsonBody, getClientIp } from "@/app/lib/utils";
import { serializeError } from "serialize-error";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(backendUrl(`/api/folders/${id}`), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
				cache: "no-cache",
			});
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(`Error fetching folder with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to fetch folder with ID ${id}` }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	});
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const body = await requestJsonBody(request);

			const response = await fetchJson<any>(backendUrl(`/api/folders/${id}`), {
				method: "PUT",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
					...authHeaders,
				},
			});
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(`Error updating folder with ID ${id}:`, error);
			return new Response(JSON.stringify(serializeError(error)), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	});
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(backendUrl(`/api/folders/${id}`), {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
			});
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(`Error deleting folder with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to delete folder with ID ${id}` }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	});
}
