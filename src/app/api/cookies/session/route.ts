import { cookies } from "next/headers";
import { serializeError } from "serialize-error";

export const dynamic = "force-dynamic";

/**
 * Mapping pour convertir les anciens noms de modèles vers les types lisibles
 * Gère la compatibilité descendante avec les anciens cookies
 */
const MODEL_TO_TYPE_MAP: Record<string, string> = {
	// Noms complets des classes Laravel
	"App\\Models\\Cenadi": "CENADI",
	"App\\Models\\Minsup": "MINESUP",
	"App\\Models\\Institute": "Institut", // Sera affiné en Université/IPES par le backend
	// Noms courts (au cas où)
	"cenadi": "CENADI",
	"minsup": "MINESUP",
	"institute": "Institut",
	"university": "Université",
	"ipes": "IPES",
};

/**
 * Normalise les données d'organisation pour gérer les anciens et nouveaux formats
 */
function normalizeOrganisation(rawData: unknown): {
	id: string;
	name: string;
	slug: string;
	type: string;
} {
	const defaultOrg = { id: "", name: "", slug: "", type: "" };

	if (!rawData || typeof rawData !== "object") {
		return defaultOrg;
	}

	const data = rawData as Record<string, unknown>;

	// Déterminer le type: utiliser 'type' si présent, sinon convertir 'model'
	let type = "";
	if (typeof data.type === "string" && data.type) {
		type = data.type;
	} else if (typeof data.model === "string" && data.model) {
		// Compatibilité descendante: convertir l'ancien format 'model'
		type = MODEL_TO_TYPE_MAP[data.model] || "";
	}

	return {
		id: String(data.id ?? ""),
		name: String(data.name ?? ""),
		slug: String(data.slug ?? ""),
		type,
	};
}

export async function GET() {
	try {
		const cookieStore = cookies();

		// Lire tous les cookies en une seule fois
		const userCookie = cookieStore.get(process.env.USER_SESSION_USER_COOKIE_KEY!);
		const organisationCookie = cookieStore.get(process.env.USER_SESSION_INSTITUTE_KEY!);
		const authorizationsCookie = cookieStore.get(process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!);

		// Parser les valeurs
		const user = userCookie?.value
			? JSON.parse(userCookie.value)
			: { id: "", name: "", email: "" };

		// Normaliser l'organisation (gère les anciens et nouveaux formats)
		const rawOrganisation = organisationCookie?.value
			? JSON.parse(organisationCookie.value)
			: null;
		const organisation = normalizeOrganisation(rawOrganisation);

		const authorizations = authorizationsCookie?.value
			? JSON.parse(authorizationsCookie.value)
			: [];

		return Response.json({
			user,
			organisation,
			authorizations,
		});
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
