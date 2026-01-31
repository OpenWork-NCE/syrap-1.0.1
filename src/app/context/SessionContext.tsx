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

interface Institution {
	id: string;
	name: string;
	slug: string;
	model: string;
	code: string;
}

interface SessionData {
	user: User;
	institution: Institution;
	authorizations: string[];
}

interface SessionContextType extends SessionData {
	isLoading: boolean;
	setUser: (user: User) => void;
	setInstitution: (institution: Institution) => void;
	setAuthorizations: (authorizations: string[]) => void;
	resetSession: () => void;
}

// Valeurs initiales
const initialUser: User = { id: "", name: "", email: "" };
const initialInstitution: Institution = { id: "", name: "", slug: "", model: "", code: "" };

const initialSession: SessionData = {
	user: initialUser,
	institution: initialInstitution,
	authorizations: [],
};

// Context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Fetch session data en un seul appel
async function fetchSession(): Promise<SessionData> {
	try {
		const response = await fetch("/api/cookies/session");
		if (!response.ok) {
			console.error("Failed to fetch session:", response.status);
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

	// Fetch session une seule fois au chargement
	useEffect(() => {
		let mounted = true;

		fetchSession().then((data) => {
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

	const setInstitution = useCallback((institution: Institution) => {
		setSession((prev) => ({ ...prev, institution }));
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
			setInstitution,
			setAuthorizations,
			resetSession,
		}),
		[session, isLoading, setUser, setInstitution, setAuthorizations, resetSession]
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
	const { user, setUser, resetSession } = useSession();
	return {
		user,
		setUser,
		resetUser: () => setUser(initialUser),
	};
};

export const useInstitution = () => {
	const { institution, setInstitution } = useSession();
	return {
		institution,
		setInstitution,
		resetInstitution: () => setInstitution(initialInstitution),
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
