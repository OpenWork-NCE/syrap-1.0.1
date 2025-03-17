"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { themeCenadi } from "@/styles/theme";
import { ThemeProvider } from "@/components/ui/ThemeComponents";

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<MantineProvider theme={themeCenadi} defaultColorScheme="auto">
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					{children}
					{/* <ReactQueryDevtools initialIsOpen={false} /> */}
				</QueryClientProvider>
			</ThemeProvider>
		</MantineProvider>
	);
}
