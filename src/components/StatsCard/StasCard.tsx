import {
	ThemeIcon,
	Progress,
	Text,
	Group,
	Badge,
	Paper,
	rem,
} from "@mantine/core";
import { IconSwimming } from "@tabler/icons-react";
import classes from "./StatsCard.module.css";

interface props {
	icon: React.FC<any>;
	title: string;
	count: number;
}

export function StatsCard({ icon: Icon, title, count }: props) {
	return (
		<Paper radius="md" withBorder className={classes.card} mt={20}>
			<ThemeIcon className={classes.icon} size={72} radius={72}>
				<Icon style={{ width: rem(40), height: rem(40) }} stroke={1.5} />
			</ThemeIcon>

			<Text ta="center" fw={700} className={classes.title}>
				{title}
			</Text>
			<Text c="dimmed" ta="center" fz="xl">
				{count}
			</Text>
		</Paper>
	);
}
