import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconNote,
	IconNotebook,
	IconSchool,
	IconUsers,
} from "@tabler/icons-react";
import {
	Center,
	Group,
	Paper,
	RingProgress,
	SimpleGrid,
	Text,
	ThemeIcon,
} from "@mantine/core";

const data = [
	{
		label: "Universités",
		stats: "20",
		color: "teal",
		icon: <IconSchool size={72} />,
	},
	{
		label: "IPES",
		stats: "30",
		color: "blue",
		icon: <IconNotebook size={64} />,
	},
	{
		label: "Programmes",
		stats: "70",
		color: "red",
		icon: <IconNote size={64} />,
	},
	{
		label: "Utilisateurs",
		stats: "70",
		color: "red",
		icon: <IconUsers size={64} />,
	},
] as const;

export function StatsView() {
	const stats = data.map((stat) => {
		return (
			<Paper withBorder shadow={"md"} radius="md" p="md" key={stat.label}>
				<Group>
					<ThemeIcon variant="white" radius="xl" size="xl">
						{stat.icon}
					</ThemeIcon>

					<div>
						<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
							{stat.label}
						</Text>
						<Text fw={700} size="xl">
							{stat.stats}
						</Text>
					</div>
				</Group>
			</Paper>
		);
	});

	return <SimpleGrid cols={{ base: 1, sm: 3, md: 4 }}>{stats}</SimpleGrid>;
}
