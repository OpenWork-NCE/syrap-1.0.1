import { Stack } from "@mantine/core";
import { ThemedFlex } from "@/components/ui/ThemeComponents";
import { ForgotPassword } from "@/components/Auth/ForgotPassword/ForgotPassword";

export default function Page() {
	return (
		<ThemedFlex
			direction="column"
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<ThemedFlex direction="column" w={500}>
				<ForgotPassword />
			</ThemedFlex>
		</ThemedFlex>
	);
}
