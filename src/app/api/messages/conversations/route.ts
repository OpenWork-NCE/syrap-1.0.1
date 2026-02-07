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
				subject: "Validation programme L2 Informatique",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_1",
						name: "Dr. Jean Fotso",
						email: "j.fotso@univ-yaounde1.cm",
						avatar: null,
						role: "Vice-Doyen",
						institution: { id: "inst_uy1", name: "Université de Yaoundé I", type: "university" },
					},
				],
				latest_message: {
					id: "msg_1_last",
					conversation_id: "1",
					sender_id: "other_1",
					sender: { id: "other_1", name: "Dr. Jean Fotso", email: "j.fotso@univ-yaounde1.cm" },
					body: "Merci de bien vouloir nous transmettre le rapport de rapprochement avant la commission de vendredi.",
					created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
				},
				unread_count: 2,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
			},
			{
				id: "2",
				subject: "Demande d'accréditation - Filière Génie Civil",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_2",
						name: "Marie-Claire Atangana",
						email: "mc.atangana@siantou.cm",
						avatar: null,
						role: "Directrice",
						institution: { id: "inst_siantou", name: "Institut Siantou", type: "ipes" },
					},
				],
				latest_message: {
					id: "msg_2_last",
					conversation_id: "2",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Votre dossier est complet. Nous procédons à l'évaluation des programmes soumis.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
				},
				unread_count: 0,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
			},
			{
				id: "3",
				subject: "Rapport de rapprochement UE Niveau 3",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_3",
						name: "Pierre Mbarga",
						email: "p.mbarga@minesup.cm",
						avatar: null,
						role: "Inspecteur Général",
						institution: { id: "inst_minesup", name: "MINESUP", type: "minesup" },
					},
				],
				latest_message: {
					id: "msg_3_last",
					conversation_id: "3",
					sender_id: "other_3",
					sender: { id: "other_3", name: "Pierre Mbarga", email: "p.mbarga@minesup.cm" },
					body: "Le rapport doit intégrer les écarts identifiés lors de la dernière inspection. Prière de le finaliser avant le 15.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
				},
				unread_count: 1,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
			},
			{
				id: "4",
				subject: "Mise à jour référentiel national BTS",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_4",
						name: "Françoise Eyenga",
						email: "f.eyenga@cenadi.cm",
						avatar: null,
						role: "Sous-Directrice Programmes",
						institution: { id: "inst_cenadi2", name: "CENADI", type: "cenadi" },
					},
				],
				latest_message: {
					id: "msg_4_last",
					conversation_id: "4",
					sender_id: "other_4",
					sender: { id: "other_4", name: "Françoise Eyenga", email: "f.eyenga@cenadi.cm" },
					body: "Les nouvelles UE du référentiel BTS Informatique Industrielle doivent être intégrées dans SYRAP d'ici la fin du mois.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
				},
				unread_count: 3,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			},
			{
				id: "5",
				subject: "Accréditation rejetée - documents manquants",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_5",
						name: "Thomas Nkoulou",
						email: "t.nkoulou@iuc-douala.cm",
						avatar: null,
						role: "Resp. Académique",
						institution: { id: "inst_iuc", name: "IUC Douala", type: "ipes" },
					},
				],
				latest_message: {
					id: "msg_5_last",
					conversation_id: "5",
					sender_id: currentUserId,
					sender: { id: currentUserId, name: "Moi", email: "moi@cenadi.cm" },
					body: "Nous restons en attente des pièces complémentaires pour finaliser l'évaluation de votre dossier.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
				},
				unread_count: 0,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
			},
			{
				id: "6",
				subject: "Réunion commission paritaire",
				type: "direct",
				participants: [
					{
						id: currentUserId,
						name: "Moi",
						email: "moi@cenadi.cm",
						avatar: null,
						role: "Chef de Service",
						institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
					},
					{
						id: "other_6",
						name: "Prof. Ahmadou Bello",
						email: "a.bello@univ-douala.cm",
						avatar: null,
						role: "Recteur",
						institution: { id: "inst_ud", name: "Université de Douala", type: "university" },
					},
				],
				latest_message: {
					id: "msg_6_last",
					conversation_id: "6",
					sender_id: "other_6",
					sender: { id: "other_6", name: "Prof. Ahmadou Bello", email: "a.bello@univ-douala.cm" },
					body: "La date du 20 février convient pour la commission. Je confirme ma participation.",
					created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
				},
				unread_count: 0,
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
				updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
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
			subject: body.subject || null,
			type: "direct",
			participants: [
				{
					id: currentUserId,
					name: "Moi",
					email: "moi@cenadi.cm",
					role: "Chef de Service",
					institution: { id: "inst_cenadi", name: "CENADI", type: "cenadi" },
				},
				{
					id: body.recipient_id,
					name: "Nouveau Contact",
					email: "contact@example.cm",
				},
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
