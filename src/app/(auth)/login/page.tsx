import { LoginForm } from "@/components/Auth/LoginForm";
import { Anchor } from "@mantine/core";
import { ThemedText, ThemedFlex } from "@/components/ui/ThemeComponents";

export default function Login() {
	return (
		<ThemedFlex
			direction="column"
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<ThemedFlex direction="column" w={400}>
				<LoginForm />
			</ThemedFlex>
			{/* <ThemedText c="dimmed" size="sm" mt={5}>
				Don&apos;t have an account?{" "}
				<Anchor size="sm" href="/support" className="theme-link">
					Contacter l'administration
				</Anchor>
			</ThemedText> */}
		</ThemedFlex>
	);
}
