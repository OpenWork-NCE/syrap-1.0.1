import { serializeError } from 'serialize-error';
import { backendUrl, getClientIp } from '@/app/lib/utils';
import { z } from 'zod';
import accessTokenMiddleware from '@/app/lib/middleware/accessTokenMiddleware';

// Route segment configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Define the schema for validation
const createSchema = z.object({
  description: z.string({ required_error: 'La description est requise.' }),
  model: z.enum(['cenadi', 'minsup', 'institute'], { required_error: 'Le modèle est requis.' }),
  model_id: z.string({ required_error: "L'ID du modèle est requis." }),
  title: z.string({ required_error: 'Le titre est requis.' }),
});

export async function POST(req: Request) {
  return accessTokenMiddleware(async ({ authHeaders }) => {
    try {
      // Use the native FormData API
      const formData = await req.formData();
      
      // Extract form fields - exactly as shown in Insomnia
      const description = formData.get('description') as string;
      const model = formData.get('model') as string;
      const model_id = formData.get('model_id') as string;
      const title = formData.get('title') as string;
      
      // Extract file - as shown in Insomnia, a single file field
      const file = formData.get('file') as File;

      console.log('Form data received:', { description, model, model_id, title, file });
      
      if (!file) {
        console.log('Error: File is missing');
        return new Response(JSON.stringify({ error: 'Fichier manquant.' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Validate the data
      try {
        createSchema.parse({
          description,
          model,
          model_id,
          title
        });
      } catch (validationError) {
        console.log('Validation error:', validationError);
        return new Response(JSON.stringify({ error: validationError }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Create a new FormData to send to the backend - maintain same structure as Insomnia
      const backendFormData = new FormData();
      backendFormData.append('description', description);
      backendFormData.append('model', model);
      backendFormData.append('model_id', model_id);
      backendFormData.append('title', title);
      backendFormData.append('file', file); // Send as simple 'file', not 'files[]'

      console.log('Sending request to backend:', backendUrl('/documents'));
      
      // Send to backend
      const backendRes = await fetch(backendUrl('/api/documents'), {
        method: 'POST',
        body: backendFormData,
        headers: {
          ...authHeaders
          // Content-Type is automatically set by FormData
        }
      });
      
      // Check if the response is JSON before parsing
      const contentType = backendRes.headers.get('content-type');
      let responseJson;
      
      if (contentType && contentType.includes('application/json')) {
        responseJson = await backendRes.json();
      } else {
        // Handle non-JSON response
        const textResponse = await backendRes.text();
        responseJson = { 
          success: backendRes.ok, 
          status: backendRes.status,
          message: backendRes.ok ? 'File uploaded successfully' : 'Upload failed',
          responseText: textResponse // Include full response text for debugging
        };
      }
      
      console.log('Backend response:', responseJson);

      return new Response(JSON.stringify(responseJson), {
        status: backendRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error in file upload:', error);
      console.log('Full error details:', serializeError(error));
      return new Response(JSON.stringify(serializeError(error)), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}
