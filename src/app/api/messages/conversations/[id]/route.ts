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

function buildParticipant(id: string, name: string, email: string, role: string, institution: { id: string; name: string; type: string }) {
	return { id, name, email, avatar: null, role, institution };
}

// GET - Récupérer une conversation avec ses messages
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	if (USE_MOCK) {
		const currentUserId = await getCurrentUserId();

		const me = buildParticipant(currentUserId, "Moi", "moi@cenadi.cm", "Chef de Service", { id: "inst_cenadi", name: "CENADI", type: "cenadi" });

		const participants: Record<string, ReturnType<typeof buildParticipant>> = {
			other_1: buildParticipant("other_1", "Dr. Jean Fotso", "j.fotso@univ-yaounde1.cm", "Vice-Doyen", { id: "inst_uy1", name: "Université de Yaoundé I", type: "university" }),
			other_2: buildParticipant("other_2", "Marie-Claire Atangana", "mc.atangana@siantou.cm", "Directrice", { id: "inst_siantou", name: "Institut Siantou", type: "ipes" }),
			other_3: buildParticipant("other_3", "Pierre Mbarga", "p.mbarga@minesup.cm", "Inspecteur Général", { id: "inst_minesup", name: "MINESUP", type: "minesup" }),
			other_4: buildParticipant("other_4", "Françoise Eyenga", "f.eyenga@cenadi.cm", "Sous-Directrice Programmes", { id: "inst_cenadi2", name: "CENADI", type: "cenadi" }),
			other_5: buildParticipant("other_5", "Thomas Nkoulou", "t.nkoulou@iuc-douala.cm", "Resp. Académique", { id: "inst_iuc", name: "IUC Douala", type: "ipes" }),
			other_6: buildParticipant("other_6", "Prof. Ahmadou Bello", "a.bello@univ-douala.cm", "Recteur", { id: "inst_ud", name: "Université de Douala", type: "university" }),
		};

		const sender = (p: ReturnType<typeof buildParticipant>) => ({ id: p.id, name: p.name, email: p.email });

		const mockConversations: Record<string, any> = {
			"1": {
				id: "1",
				subject: "Validation programme L2 Informatique",
				type: "direct",
				participants: [me, participants.other_1],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
			},
			"2": {
				id: "2",
				subject: "Demande d'accréditation - Filière Génie Civil",
				type: "direct",
				participants: [me, participants.other_2],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
			},
			"3": {
				id: "3",
				subject: "Rapport de rapprochement UE Niveau 3",
				type: "direct",
				participants: [me, participants.other_3],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
			},
			"4": {
				id: "4",
				subject: "Mise à jour référentiel national BTS",
				type: "direct",
				participants: [me, participants.other_4],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
			},
			"5": {
				id: "5",
				subject: "Accréditation rejetée - documents manquants",
				type: "direct",
				participants: [me, participants.other_5],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
			},
			"6": {
				id: "6",
				subject: "Réunion commission paritaire",
				type: "direct",
				participants: [me, participants.other_6],
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
			},
		};

		const DAY = 1000 * 60 * 60 * 24;
		const HOUR = 1000 * 60 * 60;
		const MIN = 1000 * 60;

		const mockMessages: Record<string, any[]> = {
			"1": [
				{
					id: "1_1", conversation_id: "1", sender_id: "other_1",
					sender: sender(participants.other_1),
					body: "Bonjour,\n\nDans le cadre de la validation des programmes de Licence 2 Informatique, nous souhaiterions obtenir le rapport de rapprochement entre les UE proposées par les IPES sous notre tutelle et le référentiel national.\n\nCordialement,\nDr. Jean Fotso",
					created_at: new Date(Date.now() - 3 * DAY).toISOString(),
				},
				{
					id: "1_2", conversation_id: "1", sender_id: currentUserId,
					sender: sender(me),
					body: "Bonjour Dr. Fotso,\n\nNous avons bien reçu votre demande. Le rapport de rapprochement est en cours de finalisation. Nous avons identifié des écarts sur 4 UE entre les programmes de l'Institut Siantou et le référentiel de l'Université de Yaoundé I.\n\nNous vous tiendrons informé de l'avancement.",
					created_at: new Date(Date.now() - 3 * DAY + 2 * HOUR).toISOString(),
				},
				{
					id: "1_3", conversation_id: "1", sender_id: "other_1",
					sender: sender(participants.other_1),
					body: "Merci pour ce retour. Pourriez-vous préciser quelles UE présentent des écarts ? Cela nous permettrait d'anticiper les ajustements nécessaires avant la prochaine commission pédagogique.",
					created_at: new Date(Date.now() - 2 * DAY).toISOString(),
				},
				{
					id: "1_4", conversation_id: "1", sender_id: currentUserId,
					sender: sender(me),
					body: "Les UE concernées sont :\n- Algorithmique avancée (écart de 15h sur le volume horaire)\n- Bases de données (contenus divergents sur la partie NoSQL)\n- Réseaux informatiques (TP non conformes au référentiel)\n- Projet tutoré (modalités d'évaluation différentes)\n\nLe détail complet sera disponible dans le rapport.",
					created_at: new Date(Date.now() - 2 * DAY + 45 * MIN).toISOString(),
				},
				{
					id: "1_5", conversation_id: "1", sender_id: "other_1",
					sender: sender(participants.other_1),
					body: "Merci de bien vouloir nous transmettre le rapport de rapprochement avant la commission de vendredi.",
					created_at: new Date(Date.now() - 25 * MIN).toISOString(),
				},
			],
			"2": [
				{
					id: "2_1", conversation_id: "2", sender_id: "other_2",
					sender: sender(participants.other_2),
					body: "Bonjour,\n\nL'Institut Siantou souhaite soumettre une demande d'accréditation pour l'ouverture de la filière Génie Civil (Licence et Master). Nous avons constitué le dossier conformément aux exigences du MINESUP.\n\nMerci de nous indiquer la procédure à suivre via la plateforme SYRAP.",
					created_at: new Date(Date.now() - 7 * DAY).toISOString(),
				},
				{
					id: "2_2", conversation_id: "2", sender_id: currentUserId,
					sender: sender(me),
					body: "Bonjour Mme Atangana,\n\nPour la demande d'accréditation, veuillez déposer les documents suivants dans la section « Accréditations » de SYRAP :\n1. Maquette pédagogique détaillée par niveau\n2. Liste des enseignants avec leurs qualifications\n3. Descriptifs des UE avec volumes horaires\n4. Convention avec l'université de tutelle\n\nNous procéderons à l'évaluation dès réception du dossier complet.",
					created_at: new Date(Date.now() - 7 * DAY + 3 * HOUR).toISOString(),
				},
				{
					id: "2_3", conversation_id: "2", sender_id: "other_2",
					sender: sender(participants.other_2),
					body: "Les documents ont été téléversés dans SYRAP. Le dossier est référencé sous le numéro ACC-2025-GC-047. Nous restons disponibles pour toute information complémentaire.",
					created_at: new Date(Date.now() - 5 * DAY).toISOString(),
				},
				{
					id: "2_4", conversation_id: "2", sender_id: currentUserId,
					sender: sender(me),
					body: "Votre dossier est complet. Nous procédons à l'évaluation des programmes soumis.",
					created_at: new Date(Date.now() - 4 * HOUR).toISOString(),
				},
			],
			"3": [
				{
					id: "3_1", conversation_id: "3", sender_id: "other_3",
					sender: sender(participants.other_3),
					body: "Bonjour,\n\nSuite à l'inspection des IPES de la région du Centre, je souhaite obtenir le rapport de rapprochement des UE de Niveau 3 pour les filières Informatique et Télécommunications.\n\nCe rapport est attendu pour le prochain Conseil d'Administration du MINESUP.",
					created_at: new Date(Date.now() - 12 * DAY).toISOString(),
				},
				{
					id: "3_2", conversation_id: "3", sender_id: currentUserId,
					sender: sender(me),
					body: "Bonjour M. l'Inspecteur Général,\n\nNous préparons le rapport consolidé. Les données de rapprochement ont été extraites de SYRAP pour 12 IPES de la région du Centre. Nous finalisons l'analyse comparative avec les référentiels nationaux.",
					created_at: new Date(Date.now() - 12 * DAY + 5 * HOUR).toISOString(),
				},
				{
					id: "3_3", conversation_id: "3", sender_id: "other_3",
					sender: sender(participants.other_3),
					body: "Le rapport doit intégrer les écarts identifiés lors de la dernière inspection. Prière de le finaliser avant le 15.",
					created_at: new Date(Date.now() - DAY).toISOString(),
				},
			],
			"4": [
				{
					id: "4_1", conversation_id: "4", sender_id: "other_4",
					sender: sender(participants.other_4),
					body: "Bonjour,\n\nLe comité de révision a validé les modifications du référentiel national BTS. Les filières concernées sont :\n- BTS Informatique Industrielle\n- BTS Génie Logiciel\n- BTS Réseaux et Télécommunications\n\nLes nouvelles maquettes doivent être intégrées dans SYRAP pour la prochaine campagne de rapprochement.",
					created_at: new Date(Date.now() - 5 * DAY).toISOString(),
				},
				{
					id: "4_2", conversation_id: "4", sender_id: currentUserId,
					sender: sender(me),
					body: "Bien reçu. Nous avons planifié l'intégration des nouvelles UE pour la semaine prochaine. Le service technique prépare la mise à jour de la base de données.",
					created_at: new Date(Date.now() - 5 * DAY + 4 * HOUR).toISOString(),
				},
				{
					id: "4_3", conversation_id: "4", sender_id: "other_4",
					sender: sender(participants.other_4),
					body: "Attention, certaines UE ont changé de code. Voici la correspondance :\n- INF301 → INI301 (Systèmes embarqués)\n- INF302 → INI302 (Automatisme)\n- GL201 → GL211 (Génie logiciel avancé)\n\nMerci d'en tenir compte lors de la migration.",
					created_at: new Date(Date.now() - 3 * DAY).toISOString(),
				},
				{
					id: "4_4", conversation_id: "4", sender_id: currentUserId,
					sender: sender(me),
					body: "Noté. Nous mettrons en place une table de correspondance pour assurer la traçabilité des modifications.",
					created_at: new Date(Date.now() - 3 * DAY + HOUR).toISOString(),
				},
				{
					id: "4_5", conversation_id: "4", sender_id: "other_4",
					sender: sender(participants.other_4),
					body: "Les nouvelles UE du référentiel BTS Informatique Industrielle doivent être intégrées dans SYRAP d'ici la fin du mois.",
					created_at: new Date(Date.now() - 2 * HOUR).toISOString(),
				},
			],
			"5": [
				{
					id: "5_1", conversation_id: "5", sender_id: "other_5",
					sender: sender(participants.other_5),
					body: "Bonjour,\n\nNous avons reçu la notification de rejet de notre demande d'accréditation pour la filière Comptabilité-Finance. Pourriez-vous nous préciser les documents manquants ?",
					created_at: new Date(Date.now() - 14 * DAY).toISOString(),
				},
				{
					id: "5_2", conversation_id: "5", sender_id: currentUserId,
					sender: sender(me),
					body: "Bonjour M. Nkoulou,\n\nAprès examen de votre dossier (réf. ACC-2025-CF-031), les pièces suivantes sont manquantes :\n1. Convention de partenariat avec l'université de tutelle (Université de Douala)\n2. Descriptifs détaillés des UE de Niveau 3\n3. PV du conseil pédagogique validant la maquette\n\nVeuillez compléter votre dossier dans SYRAP.",
					created_at: new Date(Date.now() - 14 * DAY + 6 * HOUR).toISOString(),
				},
				{
					id: "5_3", conversation_id: "5", sender_id: "other_5",
					sender: sender(participants.other_5),
					body: "Nous vous remercions pour ces précisions. La convention avec l'Université de Douala est en cours de signature. Nous soumettrons les documents complémentaires dès que possible.",
					created_at: new Date(Date.now() - 10 * DAY).toISOString(),
				},
				{
					id: "5_4", conversation_id: "5", sender_id: currentUserId,
					sender: sender(me),
					body: "Nous restons en attente des pièces complémentaires pour finaliser l'évaluation de votre dossier.",
					created_at: new Date(Date.now() - 2 * DAY).toISOString(),
				},
			],
			"6": [
				{
					id: "6_1", conversation_id: "6", sender_id: currentUserId,
					sender: sender(me),
					body: "Monsieur le Recteur,\n\nDans le cadre de la commission paritaire CENADI-Universités, nous souhaitons organiser une réunion pour examiner les résultats du rapprochement des programmes du premier semestre 2025.\n\nSeriez-vous disponible la semaine du 17 février ?",
					created_at: new Date(Date.now() - 20 * DAY).toISOString(),
				},
				{
					id: "6_2", conversation_id: "6", sender_id: "other_6",
					sender: sender(participants.other_6),
					body: "Bonjour,\n\nJe vous remercie pour cette initiative. L'Université de Douala est pleinement engagée dans le processus de rapprochement. Nous avons constaté des progrès significatifs dans l'alignement des programmes de nos IPES partenaires.\n\nJe propose le jeudi 20 février à 10h dans nos locaux.",
					created_at: new Date(Date.now() - 18 * DAY).toISOString(),
				},
				{
					id: "6_3", conversation_id: "6", sender_id: currentUserId,
					sender: sender(me),
					body: "Le 20 février à 10h nous convient. Nous préparerons un rapport synthétique des rapprochements effectués sur SYRAP pour les IPES de la région du Littoral.\n\nOrdre du jour proposé :\n1. Bilan des rapprochements S1 2025\n2. Identification des écarts récurrents\n3. Recommandations pour l'harmonisation\n4. Calendrier de la prochaine campagne",
					created_at: new Date(Date.now() - 15 * DAY).toISOString(),
				},
				{
					id: "6_4", conversation_id: "6", sender_id: "other_6",
					sender: sender(participants.other_6),
					body: "La date du 20 février convient pour la commission. Je confirme ma participation.",
					created_at: new Date(Date.now() - 3 * DAY).toISOString(),
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
