import { SupportForm } from "@/components/Auth/SupportForm";
import { Anchor, Box, Stack, Text } from "@mantine/core";

export default function Page() {
	return (
		<Stack
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<Box w={700}>
				<SupportForm />
			</Box>
			<Text c="dimmed" size="sm" mt={5}>
				<Anchor size="sm" href="/login">
					Retourner à la page de connexion
				</Anchor>
			</Text>
		</Stack>
	);
}
