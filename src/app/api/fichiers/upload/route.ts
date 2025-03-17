import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, getClientIp } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			// Get the form data from the request
			const formData = await request.formData();

			// Forward the request to the backend
			const response = await fetch(backendUrl("/api/fichiers/upload"), {
				method: "POST",
				body: formData, // Pass the form data directly
				headers: {
					// Don't set Content-Type as it will be set automatically with the boundary
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent") || "",
					"x-user-auth": request.headers.get("x-auto-auth") ?? "false",
					...authHeaders,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to upload file");
			}

			const result = await response.json();
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Error uploading file:", error);
			return new Response(
				JSON.stringify({
					error:
						error instanceof Error ? error.message : "Failed to upload file",
				}),
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
