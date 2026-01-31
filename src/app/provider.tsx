"use client";

import { useMemo } from "react";
import { MantineProvider } from "@mantine/core";
import { themeCenadi, themeIpes, themeMinesup, themeUniversity } from "@/styles/theme";
import { ThemeProvider } from "@/components/ui/ThemeComponents";
import { useOrganisation } from "@/app/context/SessionContext";

/**
 * Mapping des types d'organisation vers les thèmes Mantine
 */
const ORGANISATION_THEMES = {
	MINESUP: themeMinesup,
	Université: themeUniversity,
	IPES: themeIpes,
	CENADI: themeCenadi,
} as const;

export function AppProvider({ children }: { children: React.ReactNode }) {
	const { organisation } = useOrganisation();

	// Thème basé sur le type d'organisation
	const theme = useMemo(() => {
		const type = organisation?.type as keyof typeof ORGANISATION_THEMES;
		return ORGANISATION_THEMES[type] || themeCenadi;
	}, [organisation?.type]);

	return (
		<MantineProvider theme={theme}>
			<ThemeProvider>
				{children}
			</ThemeProvider>
		</MantineProvider>
	);
}
