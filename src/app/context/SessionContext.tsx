"use client";

import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

// Types
interface User {
	id: string;
	name: string;
	email: string;
}

interface Organisation {
	id: string;
	name: string;
	slug: string;
	type: string; // CENADI, MINESUP, Université, IPES
}

interface SessionData {
	user: User;
	organisation: Organisation;
	authorizations: string[];
}

interface SessionContextType extends SessionData {
	isLoading: boolean;
	setUser: (user: User) => void;
	setOrganisation: (organisation: Organisation) => void;
	setAuthorizations: (authorizations: string[]) => void;
	refreshSession: () => Promise<void>;
	resetSession: () => void;
}

// Valeurs initiales
const initialUser: User = { id: "", name: "", email: "" };
const initialOrganisation: Organisation = { id: "", name: "", slug: "", type: "" };

const initialSession: SessionData = {
	user: initialUser,
	organisation: initialOrganisation,
	authorizations: [],
};

// Context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Fetch session data depuis les cookies
 * Utilise cache: 'no-store' pour toujours lire les cookies frais
 */
async function fetchSessionFromServer(): Promise<SessionData> {
	try {
		const response = await fetch("/api/cookies/session", {
			cache: "no-store",
			credentials: "include",
		});
		if (!response.ok) {
			return initialSession;
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching session:", error);
		return initialSession;
	}
}

// Provider component
export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [session, setSession] = useState<SessionData>(initialSession);
	const [isLoading, setIsLoading] = useState(true);

	// Fonction de rafraîchissement de la session (appelée après login/modification)
	const refreshSession = useCallback(async () => {
		setIsLoading(true);
		const data = await fetchSessionFromServer();
		setSession(data);
		setIsLoading(false);
	}, []);

	// Fetch session au chargement initial
	useEffect(() => {
		let mounted = true;

		fetchSessionFromServer().then((data) => {
			if (mounted) {
				setSession(data);
				setIsLoading(false);
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	// Setters mémorisés
	const setUser = useCallback((user: User) => {
		setSession((prev) => ({ ...prev, user }));
	}, []);

	const setOrganisation = useCallback((organisation: Organisation) => {
		setSession((prev) => ({ ...prev, organisation }));
	}, []);

	const setAuthorizations = useCallback((authorizations: string[]) => {
		setSession((prev) => ({ ...prev, authorizations }));
	}, []);

	const resetSession = useCallback(() => {
		setSession(initialSession);
	}, []);

	// Valeur du contexte mémorisée
	const contextValue = useMemo<SessionContextType>(
		() => ({
			...session,
			isLoading,
			setUser,
			setOrganisation,
			setAuthorizations,
			refreshSession,
			resetSession,
		}),
		[session, isLoading, setUser, setOrganisation, setAuthorizations, refreshSession, resetSession]
	);

	return (
		<SessionContext.Provider value={contextValue}>
			{children}
		</SessionContext.Provider>
	);
};

// Hook pour utiliser la session complète
export const useSession = (): SessionContextType => {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
};

// Hooks de compatibilité avec les anciens contextes
export const useUser = () => {
	const { user, setUser } = useSession();
	return {
		user,
		setUser,
		resetUser: () => setUser(initialUser),
	};
};

export const useOrganisation = () => {
	const { organisation, setOrganisation } = useSession();
	return {
		organisation,
		setOrganisation,
		resetOrganisation: () => setOrganisation(initialOrganisation),
	};
};

// Alias pour compatibilité (à supprimer plus tard)
// Retourne organisation sous le nom "institution" pour les anciens composants
export const useInstitution = () => {
	const { organisation, setOrganisation } = useSession();
	return {
		institution: organisation,
		setInstitution: setOrganisation,
		resetInstitution: () => setOrganisation(initialOrganisation),
	};
};

export const useAuthorizations = () => {
	const { authorizations, setAuthorizations } = useSession();
	return {
		authorizations,
		setAuthorizations,
		resetAuthorizations: () => setAuthorizations([]),
	};
};
