import { NextResponse } from "next/server";
import { mockFiles } from "@/types";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export async function PUT(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const data = await request.json();

			// Forward the request to the backend
			const response = await fetchJson<any>(backendUrl(`/api/files/${id}`), {
				method: "PUT",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
			});

			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			console.error(`Error updating file with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to update file with ID ${id}` }),
				{ status: 500 },
			);
		}
	});
}

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(backendUrl(`/api/files/${id}`), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
				cache: "no-cache",
			});
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			console.error(`Error fetching file with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to fetch file with ID ${id}` }),
				{
					status: 500,
				},
			);
		}
	});
}

export async function DELETE(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(backendUrl(`/api/files/${id}`), {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
			});
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			console.error(`Error deleting file with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to delete file with ID ${id}` }),
				{
					status: 500,
				},
			);
		}
	});
}
