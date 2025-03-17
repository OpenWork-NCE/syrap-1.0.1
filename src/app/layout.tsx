"use client";

import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import "@/styles/global.css";
import "@/styles/theme.css";

import {
	ColorSchemeScript,
	DirectionProvider,
	MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { interFont } from "@/styles/fonts";
import { themeCenadi, themeMinesup, themeIpes } from "@/styles/theme";
import { AppProvider } from "./provider";
import { useEffect, useState } from "react";
import { internalApiUrl } from "@/app/lib/utils";
import { InstitutionProvider } from "@/app/context/InstitutionContext";
import { AuthorizationsProvider } from "@/app/context/AuthorizationsContext";
import { UserProvider } from "@/app/context/UserContext";
import { Institution } from "@/types";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [institution, setInstitution] = useState({
		id: "",
		name: "",
		slug: "",
		code: "",
	} as Institution);

	useEffect(() => {
		async function fetchInstitution() {
			const response = await fetch(
				internalApiUrl(`/api/cookies/userinstitution`),
			);
			const data = await response.json();
			setInstitution(data);
		}
		fetchInstitution();
	}, []);
	return (
		<html lang="en-US" className={interFont.variable}>
			<head>
				<ColorSchemeScript />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body className={interFont.className}>
				{/*<DirectionProvider>*/}
				<MantineProvider
					theme={
						institution
							? institution.slug?.includes("Ipes")
								? themeIpes
								: institution.slug?.includes("Minsup")
									? themeMinesup
									: themeCenadi
							: themeCenadi
					}
				>
					{/*<Notifications position={"bottom-right"} zIndex={2000} />*/}
					<ModalsProvider>
						<AppProvider>
							<InstitutionProvider>
								<AuthorizationsProvider>
									<UserProvider>{children}</UserProvider>
								</AuthorizationsProvider>
							</InstitutionProvider>
						</AppProvider>
					</ModalsProvider>
				</MantineProvider>
				{/*</DirectionProvider>*/}
			</body>
		</html>
	);
}
