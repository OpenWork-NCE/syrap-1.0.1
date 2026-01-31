"use client";

import { useMemo } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications, notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { themeCenadi, themeIpes, themeMinesup, themeUniversity } from "@/styles/theme";
import { ThemeProvider } from "@/components/ui/ThemeComponents";
import { SessionProvider, useOrganisation } from "@/app/context/SessionContext";

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

	// Erreurs de validation (422)
	if (message.includes("422") || message.includes("validation")) {
		notifications.show({
			color: "yellow",
			title: "Données invalides",
			message: "Veuillez vérifier les informations saisies",
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
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
	const { organisation } = useOrganisation();

	const theme = useMemo(() => {
		const type = organisation?.type as keyof typeof ORGANISATION_THEMES;
		return ORGANISATION_THEMES[type] || themeCenadi;
	}, [organisation?.type]);

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

/**
 * ClientProviders - Wrapper unique pour tous les providers clients
 *
 * Hiérarchie optimisée (de extérieur vers intérieur):
 * 1. SessionProvider - État de session (user, organisation, authorizations)
 * 2. MantineProvider - Thème UI basé sur l'organisation
 * 3. ThemeProvider - Variables CSS personnalisées
 * 4. ModalsProvider - Gestion des modales Mantine
 * 5. QueryClientProvider - Cache et état serveur React Query
 *
 * Avantages de cette architecture:
 * - Un seul QueryClient partagé dans toute l'app
 * - Cache préservé entre les navigations
 * - Réduction des re-renders inutiles
 * - Meilleure performance de navigation
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<ThemeWrapper>
				{children}
			</ThemeWrapper>
		</SessionProvider>
	);
}
