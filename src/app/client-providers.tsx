"use client";

import { useMemo } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications, notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { themeCenadi, themeIpes, themeMinesup, themeUniversity } from "@/styles/theme";
import { ThemeProvider } from "@/components/ui/ThemeComponents";
import { SessionProvider, useOrganisation } from "@/app/context/SessionContext";
import { createContext, useContext } from "react";

/**
 * Mapping des types d'organisation vers les thèmes Mantine
 */
const ORGANISATION_THEMES = {
	MINESUP: themeMinesup,
	Université: themeUniversity,
	IPES: themeIpes,
	CENADI: themeCenadi,
} as const;

/**
 * Context pour le type d'organisation initial (SSR)
 * Permet d'éviter le flash de thème au chargement
 */
const InitialOrgTypeContext = createContext<string>("");

/**
 * Gestionnaire d'erreurs global pour React Query
 * Affiche des notifications contextuelles selon le type d'erreur
 */
function handleQueryError(error: Error) {
	const message = error.message.toLowerCase();

	// Erreurs réseau
	if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) {
		notifications.show({
			color: "orange",
			title: "Problème de connexion",
			message: "Vérifiez votre connexion internet",
		});
		return;
	}

	// Erreurs d'authentification (silencieuses - gérées par le middleware)
	if (message.includes("401") || message.includes("unauthorized") || message.includes("unauthenticated")) {
		return;
	}

	// Erreurs de permission
	if (message.includes("403") || message.includes("permission") || message.includes("forbidden")) {
		notifications.show({
			color: "red",
			title: "Accès refusé",
			message: "Vous n'avez pas les permissions nécessaires",
		});
		return;
	}

	// Erreurs de validation (422 uniquement - pas le mot "validation" qui peut apparaître dans d'autres contextes)
	if (message.includes("422") || message.includes("validation error") || message.includes("unprocessable")) {
		notifications.show({
			color: "yellow",
			title: "Données invalides",
			message: "Veuillez vérifier les informations saisies",
		});
		return;
	}

	// Erreurs 404 (ressource non trouvée)
	if (message.includes("404") || message.includes("not found")) {
		notifications.show({
			color: "orange",
			title: "Ressource introuvable",
			message: "L'élément demandé n'existe pas ou a été supprimé",
		});
		return;
	}

	// Erreurs serveur
	if (message.includes("500") || message.includes("server") || message.includes("internal")) {
		notifications.show({
			color: "red",
			title: "Erreur serveur",
			message: "Le serveur a rencontré un problème. Réessayez plus tard.",
		});
		return;
	}
}

/**
 * Configuration du QueryClient
 * - staleTime: 5 min (données considérées fraîches)
 * - gcTime: 30 min (durée en cache)
 * - retry: 1 (une seule tentative en cas d'échec)
 */
const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleQueryError,
	}),
	mutationCache: new MutationCache({
		onError: handleQueryError,
	}),
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

/**
 * Provider interne pour le thème dynamique
 * Doit être enfant de SessionProvider pour accéder à useOrganisation
 *
 * Stratégie de chargement du thème (sans flash):
 * 1. Au premier rendu SSR, utilise initialOrgType lu des cookies côté serveur
 * 2. Après hydratation, utilise le type de la session React
 * 3. Priorité: session > initial (cookies) > défaut (CENADI)
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
	const { organisation } = useOrganisation();
	const initialOrgType = useContext(InitialOrgTypeContext);

	// Priorité: type de session (après chargement) > type initial (SSR/cookies)
	const orgType = organisation?.type || initialOrgType;

	const theme = useMemo(() => {
		const type = orgType as keyof typeof ORGANISATION_THEMES;
		return ORGANISATION_THEMES[type] || themeCenadi;
	}, [orgType]);

	return (
		<MantineProvider theme={theme}>
			<ThemeProvider>
				<Notifications position="top-right" zIndex={1000} />
				<ModalsProvider>
					<QueryClientProvider client={queryClient}>
						{children}
					</QueryClientProvider>
				</ModalsProvider>
			</ThemeProvider>
		</MantineProvider>
	);
}

interface ClientProvidersProps {
	children: React.ReactNode;
	/** Type d'organisation lu depuis les cookies côté serveur */
	initialOrgType?: string;
}

/**
 * ClientProviders - Wrapper unique pour tous les providers clients
 *
 * Hiérarchie optimisée (de extérieur vers intérieur):
 * 1. InitialOrgTypeContext - Type initial pour éviter le flash de thème
 * 2. SessionProvider - État de session (user, organisation, authorizations)
 * 3. MantineProvider - Thème UI basé sur l'organisation
 * 4. ThemeProvider - Variables CSS personnalisées
 * 5. ModalsProvider - Gestion des modales Mantine
 * 6. QueryClientProvider - Cache et état serveur React Query
 *
 * Avantages de cette architecture:
 * - Thème appliqué instantanément grâce à la lecture SSR des cookies
 * - Un seul QueryClient partagé dans toute l'app
 * - Cache préservé entre les navigations
 * - Réduction des re-renders inutiles
 * - Meilleure performance de navigation
 */
export function ClientProviders({ children, initialOrgType = "" }: ClientProvidersProps) {
	return (
		<InitialOrgTypeContext.Provider value={initialOrgType}>
			<SessionProvider>
				<ThemeWrapper>
					{children}
				</ThemeWrapper>
			</SessionProvider>
		</InitialOrgTypeContext.Provider>
	);
}
