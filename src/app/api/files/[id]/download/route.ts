import { NextResponse } from "next/server";
import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params: { id } }: { params: { id: string } }
) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      // First, get the file details to find the file ID
      const fileDetailsResponse = await fetch(
        backendUrl(`/api/documents/${id}`), 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          cache: "no-cache",
        }
      );
      
      if (!fileDetailsResponse.ok) {
        throw new Error(`Failed to fetch file details for ID ${id}`);
      }
      
      const fileDetails = await fileDetailsResponse.json();
      
      // Extract the first file from the files array
      if (!fileDetails.data.files || !fileDetails.data.files.length) {
        throw new Error("No file found in the document");
      }
      
      const file = fileDetails.data.files[0];
      const fileId = file.id;
      
      // Now use the file ID to get the actual download URL
      const downloadUrl = backendUrl(`/api/documents/${id}/files/${fileId}/download`);
      
      // Forward the request to the backend
      const response = await fetch(downloadUrl, {
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
      
      // Get content type and filename from response headers
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentDisposition = response.headers.get("content-disposition");
      let filename = file.name;
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
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
      console.error(`Error downloading file with ID ${id}:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}` }),
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