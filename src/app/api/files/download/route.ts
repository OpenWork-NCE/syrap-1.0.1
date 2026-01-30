import { NextResponse } from "next/server";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { extractQueryParams } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			// Get the file URL from the query parameters
			const queryParams = extractQueryParams(request);
			// Support multiple parameter names for backward compatibility
			const fileUrl = queryParams.download_url || queryParams.url || queryParams.file_url || '';
			
			if (!fileUrl) {
				throw new Error("No file URL provided");
			}
			
			// Forward the request to the actual file URL
			const response = await fetch(fileUrl, {
				method: "GET",
				headers: {
					...authHeaders,
				},
			});
			
			if (!response.ok) {
				throw new Error(`Failed to download file: ${response.statusText}`);
			}
			
			// Get the file data as arrayBuffer
			const fileData = await response.arrayBuffer();
			
			// Get content type from response headers
			const contentType = response.headers.get("content-type") || "application/octet-stream";
			
			// Try to extract filename from URL
			let filename = "download";
			try {
				const urlObj = new URL(fileUrl);
				const pathSegments = urlObj.pathname.split("/");
				const lastSegment = pathSegments[pathSegments.length - 1];
				if (lastSegment && lastSegment.includes(".")) {
					filename = lastSegment;
				}
			} catch (e) {
				console.error("Error extracting filename from URL:", e);
			}
			
			// Return the file with appropriate headers
			return new Response(fileData, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": `attachment; filename="${filename}"`,
				},
			});
		} catch (error) {
			console.error("Error downloading file:", error);
			return new Response(
				JSON.stringify({ 
					error: "Failed to download file", 
					message: error instanceof Error ? error.message : "Unknown error" 
				}), 
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}
	});
} 