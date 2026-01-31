import { cookies } from "next/headers";
import { backendUrl, getClientIp } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;

	try {
		// Récupérer le token d'authentification
		const cookieStore = cookies();
		const cookieKey = process.env.USER_SESSION_COOKIE_KEY;

		if (!cookieKey) {
			console.error("[API Validate] USER_SESSION_COOKIE_KEY non défini");
			return new Response(
				JSON.stringify({ error: "Configuration serveur manquante" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		const accessTokenCookie = cookieStore.get(cookieKey);
		const authHeaders: Record<string, string> = {};

		if (accessTokenCookie?.value) {
			authHeaders.Authorization = `Bearer ${accessTokenCookie.value}`;
		} else {
			console.warn("[API Validate] Pas de token d'authentification");
		}

		const url = backendUrl(`/api/programmes/ues/validate/${id}`);
		console.log(`[API Validate] Appel backend: ${url}`);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-user-ip": getClientIp(request),
				"x-user-agent": request.headers.get("user-agent") || "",
				...authHeaders,
			},
		});

		console.log(`[API Validate] Réponse backend: ${response.status}`);

		// Succès sans contenu (204)
		if (response.status === 204) {
			return new Response(null, { status: 204 });
		}

		// Erreur du backend - propager le statut exact
		if (!response.ok) {
			let errorData = { message: `Erreur ${response.status}` };
			try {
				const text = await response.text();
				if (text) {
					errorData = JSON.parse(text);
				}
			} catch (e) {
				console.error("[API Validate] Erreur parsing réponse:", e);
			}

			console.error("[API Validate] Erreur backend:", response.status, errorData);

			return new Response(JSON.stringify(errorData), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Succès avec contenu
		const text = await response.text();
		return new Response(text || "null", {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});

	} catch (error) {
		// Erreur JavaScript (réseau, parsing, etc.)
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;

		console.error("[API Validate] Exception:", errorMessage);
		if (errorStack) {
			console.error("[API Validate] Stack:", errorStack);
		}

		return new Response(
			JSON.stringify({
				error: "Erreur interne du serveur",
				message: errorMessage,
				type: error instanceof Error ? error.constructor.name : typeof error,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
