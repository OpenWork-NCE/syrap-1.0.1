import {
	IconNote,
	IconNotebook,
	IconSchool,
	IconUsers,
} from "@tabler/icons-react";
import { ThemedSection } from "@/components/ui/ThemeComponents";
import { StatsCard } from "@/components/StatsCard/StatsCard";
import classes from "./StatsView.module.css";

const data = [
	{
		title: "Universités",
		count: "20",
		icon: IconSchool,
		description: "Nombre total d'universités enregistrées",
	},
	{
		title: "IPES",
		count: "30",
		icon: IconNotebook,
		description: "Nombre total d'IPES enregistrés",
	},
	{
		title: "Programmes",
		count: "70",
		icon: IconNote,
		description: "Nombre total de programmes académiques",
	},
	{
		title: "Utilisateurs",
		count: "70",
		icon: IconUsers,
		description: "Nombre total d'utilisateurs actifs",
	},
] as const;

export function StatsView() {
	const stats = data.map((item) => (
		<StatsCard
			key={item.title}
			icon={item.icon}
			title={item.title}
			count={item.count}
			description={item.description}
		/>
	));

	return (
		<ThemedSection className={`${classes.container} theme-animate-fade`}>
			<div className={`${classes.grid} theme-animate-slide`}>{stats}</div>
		</ThemedSection>
	);
}
