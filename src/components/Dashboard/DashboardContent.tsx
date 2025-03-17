"use client";

import { Container, Flex, Tabs } from "@mantine/core";
import { IconActivity, IconHomeStats } from "@tabler/icons-react";
import { StatsView } from "@/components/Dashboard/StatsView";
import { LogViewer } from "@/components/LogViewer/LogViewer";
import { ThemedPaper } from "@/components/ui/ThemeComponents";
import classes from "./DashboardContent.module.css";

export default function DashboardContent() {
	return (
		<>
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
		</>
	);
}
