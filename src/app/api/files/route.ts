import { NextResponse } from "next/server";
import { mockFiles, FileDocument } from "@/types";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, extractQueryParams, fetchJson } from "@/app/lib/utils";
import IPaginateResponse from "@/interfaces/IPaginateResponse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			// Extract query params
			const queryParams = extractQueryParams(req);

			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/files`, queryParams),
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				},
			);
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			console.error("Error fetching files:", error);
			return new Response(JSON.stringify({ error: "Failed to fetch files" }), {
				status: 500,
			});
		}
	});
}

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const data = await request.json();

			// Forward the request to the backend
			const response = await fetchJson<any>(backendUrl(`/api/files`), {
				method: "POST",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
					...authHeaders,
				},
			});

			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			console.error("Error creating file:", error);
			return new Response(JSON.stringify({ error: "Failed to create file" }), {
				status: 500,
			});
		}
	});
}
