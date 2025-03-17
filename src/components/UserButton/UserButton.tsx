import {
	Avatar,
	Flex,
	UnstyledButton,
	type UnstyledButtonProps,
} from "@mantine/core";
import { ThemedText } from "@/components/ui/ThemeComponents";
import classes from "./UserButton.module.css";
import Link from "next/link";
import { IconSettings } from "@tabler/icons-react";

interface UserButtonProps extends UnstyledButtonProps {
	image: string;
	name: string;
	email: string;
}

export function UserButton({ image, name, email }: UserButtonProps) {
	return (
		<Link href="/profile" className={classes.link}>
			<UnstyledButton className={classes.user}>
				<Flex direction="row" gap={8} align="center">
					<Avatar src={image} radius="xl" />

					<div style={{ flex: 1 }}>
						<ThemedText size="sm" fw={500}>
							{name}
						</ThemedText>

						<ThemedText c="dimmed" size="xs">
							{email}
						</ThemedText>
					</div>

					<IconSettings size={16} className={classes.icon} />
				</Flex>
			</UnstyledButton>
		</Link>
	);
}
