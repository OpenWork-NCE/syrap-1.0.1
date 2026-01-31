"use client";

import { useMemo } from "react";
import { MantineProvider } from "@mantine/core";
import { themeCenadi, themeIpes, themeMinesup } from "@/styles/theme";
import { ThemeProvider } from "@/components/ui/ThemeComponents";
import { useInstitution } from "@/app/context/SessionContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
	const { institution } = useInstitution();

	// Memoize theme to prevent re-renders when institution hasn't changed
	const theme = useMemo(() => {
		const model = institution?.model || "";
		if (model.includes("Minesup")) {
			return themeMinesup;
		}
		if (model.includes("University") || model.includes("Ipes")) {
			return themeIpes;
		}
		return themeCenadi;
	}, [institution?.model]);

	return (
		<MantineProvider theme={theme}>
			<ThemeProvider>
				{children}
			</ThemeProvider>
		</MantineProvider>
	);
}
