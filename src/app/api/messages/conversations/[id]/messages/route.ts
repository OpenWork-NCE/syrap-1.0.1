import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Mock data pour le développement
const USE_MOCK = true;

// Fonction pour obtenir les données utilisateur depuis les cookies
async function getCurrentUser(): Promise<{ id: string; name: string; email: string }> {
	try {
		const cookieStore = await cookies();
		const userCookieKey = process.env.USER_SESSION_USER_COOKIE_KEY || "user-auth.session-user";
		const userCookie = cookieStore.get(userCookieKey);

		if (userCookie?.value) {
			const userData = JSON.parse(userCookie.value);
			return {
				id: String(userData.id || "1"),
				name: userData.name || "Utilisateur",
				email: userData.email || "user@example.com",
			};
		}
		return { id: "1", name: "Utilisateur", email: "user@example.com" };
	} catch {
		return { id: "1", name: "Utilisateur", email: "user@example.com" };
	}
}

// POST - Envoyer un message
export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const body = await req.json();

	if (USE_MOCK) {
		const currentUser = await getCurrentUser();

		const newMessage = {
			id: String(Date.now()),
			conversation_id: id,
			sender_id: currentUser.id,
			sender: currentUser,
			body: body.body,
			attachments: body.attachments || [],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		return new Response(JSON.stringify(newMessage), { status: 201 });
	}

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl(`/api/messages/conversations/${id}/messages`),
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
