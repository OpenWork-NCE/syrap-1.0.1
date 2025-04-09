import { NextResponse } from "next/server";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, extractQueryParams, fetchJson } from "@/app/lib/utils";
import IPaginateResponse from "@/interfaces/IPaginateResponse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			// Extract query params but don't use them if they cause problems
			const queryParams = extractQueryParams(req);
			
			// Remove specific params that might cause issues
			delete queryParams.search;
			delete queryParams.type;
			
			const response = await fetchJson<IPaginateResponse<any>>(
				backendUrl(`/api/documents`, queryParams),
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
						// "Authorization": req.headers.get("authorization") || "",
					},
					cache: "no-cache",
				},
			);
			return new Response(JSON.stringify(response), { 
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			});
		} catch (error) {
			console.error("Error fetching files:", error);
			return new Response(
				JSON.stringify({ 
					error: "Failed to fetch files", 
					message: error instanceof Error ? error.message : "Unknown error" 
				}), 
				{
					status: 500,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	});
}
