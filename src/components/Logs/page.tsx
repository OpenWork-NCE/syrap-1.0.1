import React, { useState, useEffect } from "react";
import {
	MantineProvider,
	AppShell,
	Table,
	Text,
	ScrollArea,
	Group,
	Button,
	Loader,
	Container,
	Badge,
	ActionIcon,
	Paper,
	Box,
	Flex,
} from "@mantine/core";
import { MRT_Table, useMantineReactTable } from "mantine-react-table";
import { IconDownload, IconRefresh } from "@tabler/icons-react";
import { LogViewer } from "@/components/LogViewer/LogViewer";

// Exemple de données pour les fichiers de logs (à gauche)
const logFiles = [
	{ name: "laravel.log", size: "4.58 MB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
	{ name: "laravel-2022-08-23.log", size: "128.15 KB" },
	{ name: "laravel-2022-07-28.log", size: "104.80 MB" },
	{ name: "laravel-2022-07-24.log", size: "1.09 MB" },
	{ name: "laravel-2022-06-15.log", size: "42.57 KB" },
];

// Exemple de données pour les logs (à droite)
const logData = [
	{
		level: "Error",
		time: "2022-08-25 11:23:07",
		env: "local",
		description: 'Command "composer" is not defined',
	},
	{
		level: "Warning",
		time: "2022-08-25 11:17:41",
		env: "local",
		description: "Example warning log entry",
	},
	{
		level: "Info",
		time: "2022-08-25 11:17:41",
		env: "local",
		description: "Example info log entry",
	},
	{
		level: "Debug",
		time: "2022-08-25 11:17:41",
		env: "local",
		description: "Example debug log entry",
	},
];

function Logs() {
	const [logs, setLogs] = useState(logData);
	const [loading, setLoading] = useState(false);

	// Actualisation automatique des logs
	useEffect(() => {
		const interval = setInterval(() => {
			setLoading(true);
			// Simuler l'actualisation des logs
			setTimeout(() => {
				setLogs((prevLogs) => [
					...prevLogs,
					{
						level: "Info",
						time: new Date().toISOString(),
						env: "local",
						description: "New log entry",
					},
				]);
				setLoading(false);
			}, 1000);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	// Configuration du tableau Mantine React Table
	const table = useMantineReactTable({
		columns: [
			{ accessorKey: "level", header: "Level" },
			{ accessorKey: "time", header: "Time" },
			{ accessorKey: "env", header: "Env" },
			{ accessorKey: "description", header: "Description" },
		],
		data: logs,
		initialState: { density: "xs" },
	});

	return (
		<Container fluid>
			<Flex style={{ maxHeight: "80vh", width: "100%" }}>
				{/* Premier ScrollArea - 30% */}
				<ScrollArea
					style={{
						flex: "0 0 25%",
						marginRight: "16px",
						border: "1px solid #e0e0e0",
						borderRadius: "8px",
					}}
				>
					<Paper p={"sm"}>
						<Text mb="md">Fichiers de Logs</Text>
						{logFiles.map((file) => (
							<Group
								key={file.name}
								// position="apart"
								px="xs"
								style={{ borderBottom: "1px solid #eee" }}
							>
								<Flex
									justify="space-between"
									align="center"
									style={{ width: "100%", padding: "" }}
								>
									<Box
										style={{
											textAlign: "left",
											padding: "2px",
											borderRadius: "16px",
										}}
									>
										<Text>{file.name}</Text>
									</Box>
									<Box
										style={{
											textAlign: "right",
											padding: "6px",
											borderRadius: "16px",
										}}
									>
										<Group gap="xs">
											<Badge color="gray">{file.size}</Badge>
											<Button size="xs" variant="outline">
												<IconDownload size={16} />
											</Button>
										</Group>
									</Box>
								</Flex>
							</Group>
						))}
					</Paper>
				</ScrollArea>

				{/* Deuxième ScrollArea - 70% */}
				<ScrollArea
					style={{
						flex: "1",
						border: "1px solid #e0e0e0",
						borderRadius: "8px",
					}}
				>
					<Paper p={"sm"}>
						<LogViewer />
					</Paper>
				</ScrollArea>
			</Flex>
		</Container>
	);
}

export default Logs;
