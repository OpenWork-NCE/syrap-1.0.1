import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

// GET - Liste des événements du calendrier
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const params = new URLSearchParams();

			// Passer les filtres au backend
			if (searchParams.get("type")) params.append("type", searchParams.get("type")!);
			if (searchParams.get("source")) params.append("source", searchParams.get("source")!);
			if (searchParams.get("start_date")) params.append("start_date", searchParams.get("start_date")!);
			if (searchParams.get("end_date")) params.append("end_date", searchParams.get("end_date")!);
			if (searchParams.get("upcoming")) params.append("upcoming", searchParams.get("upcoming")!);

			const queryString = params.toString() ? `?${params.toString()}` : "";

			const response = await fetchJson(
				backendUrl(`/api/calendar/events${queryString}`),
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					cache: "no-cache",
				}
			);
			return new Response(JSON.stringify(response), { status: 200 });
		} catch (error) {
			return new Response(JSON.stringify(error), { status: 500 });
		}
	});
}

// POST - Créer un événement
export async function POST(req: Request) {
	const body = await req.json();

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl("/api/calendar/events"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...authHeaders,
					},
					body: JSON.stringify(body),
					cache: "no-cache",
				}
			);
			return new Response(JSON.stringify(response), { status: 201 });
		} catch (error) {
			return new Response(JSON.stringify(error), { status: 500 });
		}
	});
}
