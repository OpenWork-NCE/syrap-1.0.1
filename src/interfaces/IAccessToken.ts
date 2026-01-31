import { Profile } from "@/types";

/**
 * Structure de l'organisation retournée par le backend
 * Types possibles: CENADI, MINESUP, Université, IPES
 */
export interface Organisation {
	type: string | null;
	id: number | null;
	slug: string | null;
	name: string | null;
}

/**
 * Réponse du endpoint /api/auth/login
 */
export default interface IAccessToken {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		created_at: string;
		organisation: Organisation;
		roles: Profile[];
	};
}
