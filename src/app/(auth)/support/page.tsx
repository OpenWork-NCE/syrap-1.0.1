import { SupportForm } from "@/components/Auth/SupportForm";
import { Anchor, Box } from "@mantine/core";
import { ThemedFlex, ThemedText } from "@/components/ui/ThemeComponents";

export default function Page() {
	return (
		<ThemedFlex
			direction="column"
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<Box w={700}>
				<SupportForm />
			</Box>
			{/* <ThemedText c="dimmed" size="sm" mt={5}>
				<Anchor size="sm" href="/login" className="theme-link">
					Retourner à la page de connexion
				</Anchor>
			</ThemedText> */}
		</ThemedFlex>
	);
}
