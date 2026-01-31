import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-react-table/styles.css";
import "@/styles/global.css";
import "@/styles/theme.css";

import type { Metadata, Viewport } from "next";
import { ColorSchemeScript } from "@mantine/core";
import { interFont } from "@/styles/fonts";
import { ClientProviders } from "./client-providers";

/**
 * Métadonnées de l'application (SEO)
 */
export const metadata: Metadata = {
	title: {
		default: "IPES-SCpro | Système de Gestion",
		template: "%s | IPES-SCpro",
	},
	description: "Système de Rapprochement Automatique des Programmes - Gestion des IPES au Cameroun",
	keywords: ["IPES", "SYRAP", "CENADI", "MINESUP", "éducation", "Cameroun"],
};

/**
 * Configuration du viewport
 */
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	minimumScale: 1,
	userScalable: false,
};

/**
 * Root Layout - Server Component
 *
 * Ce layout est un Server Component pour permettre:
 * - Le SSR des pages enfants
 * - L'optimisation des métadonnées côté serveur
 * - La génération statique où possible
 *
 * Les providers clients sont encapsulés dans ClientProviders
 */
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr" className={interFont.variable} suppressHydrationWarning>
			<head>
				<ColorSchemeScript defaultColorScheme="light" />
				<link rel="icon" href="/favicon.jpeg" type="image/jpeg" />
				<link rel="apple-touch-icon" href="/favicon.jpeg" />
			</head>
			<body className={interFont.className}>
				<ClientProviders>
					{children}
				</ClientProviders>
			</body>
		</html>
	);
}
