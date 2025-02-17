"use client";

import { Container, Flex, Paper, Tabs } from "@mantine/core";
import { IconActivity, IconHomeStats } from "@tabler/icons-react";
import { StatsView } from "@/components/Dashboard/StatsView";
import { LogViewer } from "@/components/LogViewer/LogViewer";

export default function DashboardContent() {
	return (
		<>
			<Tabs defaultValue="stats">
				<Tabs.List>
					<Tabs.Tab value="stats" leftSection={<IconHomeStats size={16} />}>
						Vue d'ensemble
					</Tabs.Tab>
					<Tabs.Tab value="activity" leftSection={<IconActivity size={16} />}>
						Activité recente
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="stats" py={"lg"}>
					<StatsView />
				</Tabs.Panel>

				<Tabs.Panel value="activity" py={"lg"}>
					<Paper shadow={"md"} withBorder={true} p={2} radius={"md"}>
						<LogViewer />
					</Paper>
				</Tabs.Panel>
			</Tabs>
		</>
	);
}
