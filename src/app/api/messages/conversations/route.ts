import accessTokenMiddleware from "@/app/lib/middleware/accessTokenMiddleware";
import { backendUrl, fetchJson } from "@/app/lib/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Mock data pour le développement
const USE_MOCK = true;

// Fonction pour obtenir l'ID utilisateur depuis les cookies
async function getCurrentUserId(): Promise<string> {
	try {
		const cookieStore = await cookies();
		const userCookieKey = process.env.USER_SESSION_USER_COOKIE_KEY || "user-auth.session-user";
		const userCookie = cookieStore.get(userCookieKey);

		if (userCookie?.value) {
			const userData = JSON.parse(userCookie.value);
			return String(userData.id || "1");
		}
		return "1";
	} catch {
		return "1";
	}
}

// GET - Liste des conversations
export async function GET(req: Request) {
	if (USE_MOCK) {
		const currentUserId = await getCurrentUserId();

		const mockConversations = [
			{
				id: "1",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm", avatar: null },
					{ id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm", avatar: null },
				],
				latest_message: {
					id: "10",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "Bonjour, avez-vous pu valider les programmes de la filière Génie Informatique ?",
					created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
				},
				unread_count: 2,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
			},
			{
				id: "2",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm", avatar: null },
					{ id: "other_2", name: "Marie Claire", email: "m.claire@ipes-example.cm", avatar: null },
				],
				latest_message: {
					id: "20",
					conversation_id: "2",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Les documents ont été validés. Merci pour votre collaboration.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
				},
				unread_count: 0,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			},
			{
				id: "3",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm", avatar: null },
					{ id: "other_3", name: "Pierre Martin", email: "p.martin@minesup.cm", avatar: null },
				],
				latest_message: {
					id: "30",
					conversation_id: "3",
					sender_id: "other_3",
					sender: { id: "other_3", name: "Pierre Martin", email: "p.martin@minesup.cm" },
					body: "Pouvez-vous me transmettre le rapport de rapprochement des UE pour le niveau 3 ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
				},
				unread_count: 1,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
			},
		];

		return new Response(
			JSON.stringify({
				data: mockConversations,
				current_page: 1,
				last_page: 1,
				per_page: 20,
				total: mockConversations.length,
			}),
			{ status: 200 }
		);
	}

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl("/api/messages/conversations"),
				{
					headers: {
						method: "GET",
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

// POST - Créer une conversation
export async function POST(req: Request) {
	const body = await req.json();

	if (USE_MOCK) {
		const currentUserId = await getCurrentUserId();

		const newConversation = {
			id: String(Date.now()),
			subject: null,
			type: "direct",
			participants: [
				{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
				{ id: body.recipient_id, name: "Nouveau Contact", email: "contact@example.cm" },
			],
			latest_message: {
				id: String(Date.now()),
				conversation_id: String(Date.now()),
				sender_id: currentUserId,
				sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
				body: body.message,
				created_at: new Date().toISOString(),
			},
			unread_count: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		return new Response(
			JSON.stringify({
				conversation: newConversation,
				message: newConversation.latest_message,
			}),
			{ status: 201 }
		);
	}

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl("/api/messages/conversations"),
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
