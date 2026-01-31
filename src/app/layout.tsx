"use client";

import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import "@/styles/global.css";
import "@/styles/theme.css";

import { ColorSchemeScript } from "@mantine/core";
import { interFont } from "@/styles/fonts";
import { AppProvider } from "./provider";
import { SessionProvider } from "@/app/context/SessionContext";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en-US" className={interFont.variable}>
			<head>
				<ColorSchemeScript />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
				<link rel="icon" href="/favicon.jpeg" type="image/jpeg" />
				<link rel="apple-touch-icon" href="/favicon.jpeg" />
			</head>
			<body className={interFont.className}>
				{/* SessionProvider: charge user, organisation et authorizations */}
				<SessionProvider>
					{/* AppProvider: applique le thème dynamique + MantineProvider */}
					<AppProvider>
						{children}
					</AppProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
