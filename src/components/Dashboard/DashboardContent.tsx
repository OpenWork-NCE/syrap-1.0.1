"use client";

import { useState } from "react";
import { Group, SegmentedControl, Tabs, Box, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { IconActivity, IconHomeStats, IconLayoutDashboard, IconSparkles } from "@tabler/icons-react";
import { StatsView } from "@/components/Dashboard/StatsView";
import { CollaborativeDashboard } from "@/components/Dashboard/CollaborativeDashboard";
import { LogViewer } from "@/components/LogViewer/LogViewer";
import { ThemedPaper } from "@/components/ui/ThemeComponents";
import classes from "./DashboardContent.module.css";

export default function DashboardContent() {
	const [dashboardView, setDashboardView] = useState<string>("new");

	return (
		<>
			{/* Dashboard View Selector */}
			<Group justify="flex-end" mb="md" className={classes.viewSelector}>
				<Group gap="xs">
					<Text size="sm" c="dimmed" fw={500}>
						Vue :
					</Text>
					<SegmentedControl
						value={dashboardView}
						onChange={setDashboardView}
						size="sm"
						radius="xl"
						data={[
							{
								value: "new",
								label: (
									<Group gap={6} wrap="nowrap">
										<IconSparkles size={14} />
										<span>Collaboratif</span>
									</Group>
								),
							},
							{
								value: "classic",
								label: (
									<Group gap={6} wrap="nowrap">
										<IconLayoutDashboard size={14} />
										<span>Classique</span>
									</Group>
								),
							},
						]}
						className={classes.segmentedControl}
					/>
				</Group>
			</Group>

			{/* Collaborative Dashboard (New Design) */}
			{dashboardView === "new" && <CollaborativeDashboard />}

			{/* Classic Dashboard (Original Design) */}
			{dashboardView === "classic" && (
				<Tabs defaultValue="stats" className={classes.tabs}>
					<Tabs.List className={classes.tabsList}>
						<Tabs.Tab
							value="stats"
							leftSection={<IconHomeStats size={16} />}
							className={classes.tabsTab}
						>
							Vue d'ensemble
						</Tabs.Tab>
						<Tabs.Tab
							value="activity"
							leftSection={<IconActivity size={16} />}
							className={classes.tabsTab}
						>
							Activité recente
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="stats" py={"lg"} className={classes.tabsPanel}>
						<StatsView />
					</Tabs.Panel>

					<Tabs.Panel value="activity" py={"lg"} className={classes.tabsPanel}>
						<ThemedPaper
							shadow={"md"}
							withBorder={true}
							p={2}
							radius={"md"}
							className={`${classes.activityPanel} theme-card`}
						>
							<LogViewer />
						</ThemedPaper>
					</Tabs.Panel>
				</Tabs>
			)}
		</>
	);
}
