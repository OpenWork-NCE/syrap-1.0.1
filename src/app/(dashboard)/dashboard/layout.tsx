"use client";

import { Suspense, useMemo } from "react";
import {
	AppShell,
	Burger,
	Text,
	Center,
	Loader,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { AdminHeader } from "@/components/Headers/AdminHeader";
import { GoodNavbar } from "@/components/GoodNavBar/GoodNavBar";
import { navLinks, adminNavLinks } from "@/config";
import { useAuthorizations } from "@/app/context/SessionContext";
import classes from "./layout.module.css";
import { AppProvider } from "@/app/provider";
import { ModalsProvider } from "@mantine/modals";

// Loader simple et élégant pour les transitions
function PageLoader() {
	return (
		<Center h="60vh">
			<Loader size="md" />
		</Center>
	);
}

// Gestionnaire d'erreurs global pour les notifications
function handleQueryError(error: Error) {
	const message = error.message.toLowerCase();

	// Erreurs réseau
	if (message.includes("network") || message.includes("fetch")) {
		notifications.show({
			color: "orange",
			title: "Problème de connexion",
			message: "Vérifiez votre connexion internet",
		});
		return;
	}

	// Erreurs d'authentification (silencieuses - gérées ailleurs)
	if (message.includes("401") || message.includes("unauthorized")) {
		return;
	}

	// Erreurs de permission
	if (message.includes("403") || message.includes("permission")) {
		notifications.show({
			color: "red",
			title: "Accès refusé",
			message: "Vous n'avez pas les permissions nécessaires",
		});
		return;
	}

	// Erreurs serveur
	if (message.includes("500") || message.includes("server")) {
		notifications.show({
			color: "red",
			title: "Erreur serveur",
			message: "Le serveur a rencontré un problème",
		});
		return;
	}
}

interface Props {
	children: React.ReactNode;
}

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleQueryError,
	}),
	mutationCache: new MutationCache({
		onError: handleQueryError,
	}),
	defaultOptions: {
		queries: {
			// Les données restent "fraîches" pendant 5 minutes
			staleTime: 5 * 60 * 1000,
			// Garde les données en cache 30 minutes
			gcTime: 30 * 60 * 1000,
			// Ne pas refetch au focus
			refetchOnWindowFocus: false,
			// Retry une seule fois
			retry: 1,
		},
	},
});

export default function DashboardLayout({ children }: Props) {
	const { authorizations } = useAuthorizations();
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	// Memoize nav items to prevent recalculation on every render
	const navItems = useMemo(() => navLinks(authorizations), [authorizations]);
	const adminNavItems = useMemo(() => adminNavLinks(authorizations), [authorizations]);

	return (
		<AppProvider>
			<ModalsProvider>
				<QueryClientProvider client={queryClient}>
				<AppShell
					header={{ height: 60 }}
					navbar={{
						width: 300,
						breakpoint: "sm",
						collapsed: { mobile: !opened },
					}}
					padding="lg"
					transitionDuration={200}
					transitionTimingFunction="ease-out"
					className={classes.appShell}
					layout="default"
				>
					<AppShell.Navbar className={classes.navbar}>
						<GoodNavbar data={navItems} adminData={adminNavItems} hidden={!opened} />
					</AppShell.Navbar>
					<AppShell.Header className={classes.header}>
						<AdminHeader
							burger={
								<Burger
									opened={opened}
									onClick={toggle}
									hiddenFrom="sm"
									size="sm"
									mr="xl"
								/>
							}
						/>
					</AppShell.Header>
					<AppShell.Main className={classes.main}>
						<Suspense fallback={<PageLoader />}>
							{children}
						</Suspense>
					</AppShell.Main>
					<AppShell.Footer className={classes.footer}>
						<Text w="full" size="sm" c="gray" ta="center">
							© {new Date().getFullYear()} IPES-SCpro. Tous droits réservés.
						</Text>
					</AppShell.Footer>
				</AppShell>
				</QueryClientProvider>
			</ModalsProvider>
		</AppProvider>
	);
}
