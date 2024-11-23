import { Anchor, Stack, Text } from "@mantine/core";
import { ForgotPassword } from "@/components/Auth/ForgotPassword/ForgotPassword";

export default function Page() {
	return (
		<Stack
			style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
		>
			<Stack w={500}>
				<ForgotPassword />
			</Stack>
		</Stack>
	);
}
