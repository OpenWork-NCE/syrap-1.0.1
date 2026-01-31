"use client";

import { useEffect } from "react";
import {
	Button,
	Container,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
	Paper,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconRefresh,
	IconWifi,
	IconLock,
	IconServer,
} from "@tabler/icons-react";

// Détecte le type d'erreur
function getErrorType(error: Error) {
	const message = error.message.toLowerCase();

	if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) {
		return {
			type: "network",
			title: "Problème de connexion",
			description: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
			icon: IconWifi,
			color: "orange",
		};
	}

	if (message.includes("401") || message.includes("403") || message.includes("unauthorized") || message.includes("permission")) {
		return {
			type: "permission",
			title: "Accès non autorisé",
			description: "Vous n'avez pas les permissions pour accéder à cette ressource.",
			icon: IconLock,
			color: "red",
		};
	}

	if (message.includes("500") || message.includes("server")) {
		return {
			type: "server",
			title: "Erreur serveur",
			description: "Le serveur a rencontré un problème. Veuillez réessayer.",
			icon: IconServer,
			color: "red",
		};
	}

	return {
		type: "unknown",
		title: "Une erreur est survenue",
		description: "Quelque chose s'est mal passé. Veuillez réessayer.",
		icon: IconAlertTriangle,
		color: "gray",
	};
}

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const errorInfo = getErrorType(error);
	const Icon = errorInfo.icon;

	useEffect(() => {
		// Log l'erreur pour le monitoring (Sentry, etc.)
		console.error("Dashboard error:", error);
	}, [error]);

	return (
		<Container size="sm" py="xl">
			<Paper p="xl" radius="md" withBorder>
				<Stack align="center" gap="lg">
					<ThemeIcon size={80} radius="xl" color={errorInfo.color} variant="light">
						<Icon size={40} />
					</ThemeIcon>

					<Stack align="center" gap="xs">
						<Title order={2} ta="center">
							{errorInfo.title}
						</Title>
						<Text c="dimmed" ta="center" maw={400}>
							{errorInfo.description}
						</Text>
					</Stack>

					<Group>
						<Button
							variant="light"
							leftSection={<IconRefresh size={16} />}
							onClick={reset}
						>
							Réessayer
						</Button>
						<Button
							variant="subtle"
							onClick={() => window.location.href = "/dashboard"}
						>
							Retour au tableau de bord
						</Button>
					</Group>

					{process.env.NODE_ENV === "development" && (
						<Text size="xs" c="dimmed" ta="center" style={{ fontFamily: "monospace" }}>
							{error.message}
						</Text>
					)}
				</Stack>
			</Paper>
		</Container>
	);
}
