import { LoginForm } from "@/components/Auth/LoginForm";
import { Anchor, Stack, Text } from "@mantine/core";

export default function Login() {
	return (
		<Stack
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<Stack w={400}>
				<LoginForm />
			</Stack>
			<Text c="dimmed" size="sm" mt={5}>
				Don&apos;t have an account?{" "}
				<Anchor size="sm" href="/support">
					Contacter l'administration
				</Anchor>
			</Text>
		</Stack>
	);
}
