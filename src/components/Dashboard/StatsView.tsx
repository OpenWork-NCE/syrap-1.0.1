import {
	IconNote,
	IconNotebook,
	IconSchool,
	IconUsers,
	IconAlertCircle,
} from "@tabler/icons-react";
import { ThemedSection } from "@/components/ui/ThemeComponents";
import { StatsCard } from "@/components/StatsCard/StatsCard";
import classes from "./StatsView.module.css";
import { useEffect, useState } from "react";
import { innerUrl } from "@/app/lib/utils";
import { Alert, Skeleton } from "@mantine/core";

interface DashboardStats {
	universities_count: number;
	ipes_count: number;
	salles_count?: number;
	users_count: number;
}

export function StatsView() {
	const [stats, setStats] = useState<DashboardStats>({
		universities_count: 0,
		ipes_count: 0,
		salles_count: 0,
		users_count: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch(innerUrl("/api/dashboard"));
				if (!response.ok) {
					throw new Error("Failed to fetch dashboard stats");
				}
				const data = await response.json();
				setStats(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				console.error("Error fetching dashboard stats:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (error) {
		return (
			<ThemedSection className={`${classes.container} theme-animate-fade`}>
				<Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
					{error}
				</Alert>
			</ThemedSection>
		);
	}

	const statsData = [
		{
			title: "Universités",
			count: isLoading ? "-" : stats.universities_count.toString(),
			icon: IconSchool,
			description: "Nombre total d'universités enregistrées",
		},
		{
			title: "IPES",
			count: isLoading ? "-" : stats.ipes_count.toString(),
			icon: IconNotebook,
			description: "Nombre total d'IPES enregistrés",
		},
		{
			title: "Programmes",
			count: isLoading ? "-" : stats.salles_count?.toString() ?? "-",
			icon: IconNote,
			description: "Nombre total de programmes académiques",
		},
		{
			title: "Utilisateurs",
			count: isLoading ? "-" : stats.users_count.toString(),
			icon: IconUsers,
			description: "Nombre total d'utilisateurs actifs",
		},
	] as const;

	const statsCards = statsData.map((item) => (
		<div key={item.title} style={{ position: 'relative' }}>
			{isLoading && (
				<Skeleton
					visible={true}
					height="100%"
					width="100%"
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 1,
						borderRadius: '8px',
					}}
				/>
			)}
			<StatsCard
				icon={item.icon}
				title={item.title}
				count={item.count}
				description={item.description}
			/>
		</div>
	));

	return (
		<ThemedSection className={`${classes.container} theme-animate-fade`}>
			<div className={`${classes.grid} theme-animate-slide`}>{statsCards}</div>
		</ThemedSection>
	);
}
