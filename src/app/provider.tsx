"use client";

import { Loader, MantineProvider, Box } from "@mantine/core";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { themeCenadi, themeIpes, themeMinesup } from "@/styles/theme";
import { ThemedTitle, ThemeProvider } from "@/components/ui/ThemeComponents";
import { useState, useEffect } from "react";
import { Institution } from "@/types";
import { internalApiUrl } from "./lib/utils";

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [institution, setInstitution] = useState<Institution>()
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchInstitution() {
			setIsLoading(true);
			const response = await fetch(
				internalApiUrl(`/api/cookies/userinstitution`),
			);
			const data = await response.json();
			setInstitution(data);
			setIsLoading(false);
		}
		fetchInstitution();
	}, []);
	console.log("Institution inside the provider : ", institution);
	
	return isLoading ? (
		<Box style={{display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			minHeight: "600px",
			width: "100%",
		}}>
			<Loader size="xl" variant="dots" />
			<ThemedTitle order={4} mt="md">
				Veillez patienter ...
			</ThemedTitle>
		</Box>
	) : (
		<MantineProvider theme={(institution?.model)?.includes("Minesup") ? themeMinesup : ((institution?.model)?.includes("University") || (institution?.model)?.includes("Ipes")) ? themeIpes : themeCenadi}>
			<ThemeProvider>
					{children}
					{/* <ReactQueryDevtools initialIsOpen={false} /> */}
			</ThemeProvider>
		</MantineProvider>
	);
}
