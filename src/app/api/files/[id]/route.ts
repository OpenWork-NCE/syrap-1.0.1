import { NextResponse } from "next/server";
import { mockFiles } from "@/types";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson<any>(backendUrl(`/api/documents/${id}`), {
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
			const response = await fetchJson<any>(backendUrl(`/api/documents/${id}`), {
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
