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

// GET - Récupérer une conversation avec ses messages
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	if (USE_MOCK) {
		// Obtenir l'ID de l'utilisateur actuel
		const currentUserId = await getCurrentUserId();

		// Générer des messages mock avec l'ID réel de l'utilisateur
		const mockConversations: Record<string, any> = {
			"1": {
				id: "1",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					{ id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
				],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
			},
			"2": {
				id: "2",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					{ id: "other_2", name: "Marie Claire", email: "m.claire@ipes-example.cm" },
				],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
			},
			"3": {
				id: "3",
				subject: null,
				type: "direct",
				participants: [
					{ id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					{ id: "other_3", name: "Pierre Martin", email: "p.martin@minesup.cm" },
				],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
			},
		};

		const mockMessages: Record<string, any[]> = {
			"1": [
				{
					id: "1",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "Bonjour, j'espère que vous allez bien.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
				},
				{
					id: "2",
					conversation_id: "1",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Bonjour Jean, oui très bien merci ! Comment puis-je vous aider ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5).toISOString(),
				},
				{
					id: "3",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "Je voulais savoir où en est la validation des programmes de Génie Informatique pour le niveau 3.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
				},
				{
					id: "4",
					conversation_id: "1",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Les programmes sont en cours de révision. Nous avons identifié quelques écarts avec le programme de tutelle de l'Université de Yaoundé I.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 30).toISOString(),
				},
				{
					id: "5",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "D'accord, pouvez-vous me transmettre le rapport de rapprochement ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
				},
				{
					id: "6",
					conversation_id: "1",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Bien sûr, je vous l'envoie dès que possible. Il sera également disponible dans la section Documents.",
					created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
				},
				{
					id: "7",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "Parfait, merci beaucoup !",
					created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
				},
				{
					id: "8",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Jean Dupont", email: "jean.dupont@univ-yaounde1.cm" },
					body: "Bonjour, avez-vous pu valider les programmes de la filière Génie Informatique ?",
					created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
				},
			],
			"2": [
				{
					id: "11",
					conversation_id: "2",
					sender_id: "other_2",
					sender: { id: "other_2", name: "Marie Claire", email: "m.claire@ipes-example.cm" },
					body: "Bonjour, je vous contacte au sujet de la mise à jour de nos programmes.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
				},
				{
					id: "12",
					conversation_id: "2",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Bonjour Marie, merci de nous contacter. Quels documents avez-vous à nous soumettre ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15).toISOString(),
				},
				{
					id: "13",
					conversation_id: "2",
					sender_id: "other_2",
					sender: { id: "other_2", name: "Marie Claire", email: "m.claire@ipes-example.cm" },
					body: "J'ai téléversé les programmes mis à jour dans la section Documents. Pouvez-vous les valider ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
				},
				{
					id: "14",
					conversation_id: "2",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Les documents ont été validés. Merci pour votre collaboration.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
				},
			],
			"3": [
				{
					id: "21",
					conversation_id: "3",
					sender_id: "other_3",
					sender: { id: "other_3", name: "Pierre Martin", email: "p.martin@minesup.cm" },
					body: "Bonjour, j'aurais besoin d'informations sur les IPES de la région du Centre.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
				},
				{
					id: "22",
					conversation_id: "3",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Bien sûr, que souhaitez-vous savoir exactement ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 30).toISOString(),
				},
				{
					id: "23",
					conversation_id: "3",
					sender_id: "other_3",
					sender: { id: "other_3", name: "Pierre Martin", email: "p.martin@minesup.cm" },
					body: "Pouvez-vous me transmettre le rapport de rapprochement des UE pour le niveau 3 ?",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
				},
			],
		};

		const conversation = mockConversations[id];
		const messages = mockMessages[id] || [];

		if (!conversation) {
			return new Response(
				JSON.stringify({ error: "Conversation non trouvée" }),
				{ status: 404 }
			);
		}

		return new Response(
			JSON.stringify({
				conversation,
				messages: {
					data: messages,
					current_page: 1,
					last_page: 1,
					per_page: 50,
					total: messages.length,
				},
			}),
			{ status: 200 }
		);
	}

	return accessTokenMiddleware(async ({ authHeaders }) => {
		try {
			const response = await fetchJson(
				backendUrl(`/api/messages/conversations/${id}`),
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
