import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params: { id } }: { params: { id: string } },
) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			// Use fetch directly instead of fetchJson to get the raw response
			const response = await fetch(backendUrl(`/api/files/${id}/download`), {
				method: "GET",
				headers: {
					...authHeaders,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to download file: ${response.statusText}`);
			}

			// Get the file content and headers
			const fileContent = await response.arrayBuffer();
			const contentType =
				response.headers.get("Content-Type") || "application/octet-stream";
			const contentDisposition =
				response.headers.get("Content-Disposition") || "";

			// Return the file as a response with appropriate headers
			return new Response(fileContent, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": contentDisposition,
				},
			});
		} catch (error) {
			console.error(`Error downloading file with ID ${id}:`, error);
			return new Response(
				JSON.stringify({ error: `Failed to download file with ID ${id}` }),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}
	});
}
