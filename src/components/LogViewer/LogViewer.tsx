"use client";

import { useState, useEffect, useMemo } from "react";
import {
	Table,
	Group,
	TextInput,
	Select,
	ActionIcon,
	Badge,
	Text,
	Box,
	Pagination,
	SegmentedControl,
} from "@mantine/core";
import { IconSearch, IconSettings, IconRefresh } from "@tabler/icons-react";
import { getLogCounts } from "./fake-data";
import { LogEntry, LogCounts } from "@/types";

const ITEMS_PER_PAGE = 25;
const TOTAL_LOGS = 10000;

export function LogViewer() {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [selectedType, setSelectedType] = useState<string>("all");
	const [sortBy, setSortBy] = useState<keyof LogEntry>("timestamp");
	const [sortDesc, setSortDesc] = useState(true);
	const [onRefresh, setOnRefresh] = useState(false);

	// Initialize and refresh logs
	useEffect(() => {
		const initLogs = async () => {
			try {
				const fetchURL = new URL(
					"/api/logs",
					process.env.NODE_ENV === "production"
						? process.env.NEXT_PUBLIC_APP_URL
						: "http://localhost:3000",
				);
				const logs = await fetch(fetchURL).then((res) => res.json());
				const data: LogEntry[] = await logs.data;
				setLogs(data);
			} catch (error) {
				console.error("Error fetching logs : ", error);
			}
		};

		initLogs();

		setOnRefresh(false);
	}, [onRefresh]);

	// Trigger refresh
	const handleRefresh = () => {
		setOnRefresh(true);
	};

	// Calculate log counts
	const counts = useMemo(() => getLogCounts(logs), [logs]);

	// Filter and sort logs
	const filteredLogs = useMemo(() => {
		return logs
			.filter((log) => {
				const matchesSearch = search
					? log.description.toLowerCase().includes(search.toLowerCase()) ||
						log.level.toLowerCase().includes(search.toLowerCase())
					: true;

				const matchesType =
					selectedType === "all" ? true : log.level === selectedType;

				return matchesSearch && matchesType;
			})
			.sort((a, b) => {
				const modifier = sortDesc ? -1 : 1;
				return (a[sortBy] > b[sortBy] ? 1 : -1) * modifier;
			});
	}, [logs, search, selectedType, sortBy, sortDesc]);

	// Pagination
	const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
	const paginatedLogs = filteredLogs.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE,
	);

	const getLevelColor = (level: string) => {
		switch (level) {
			case "error":
				return "red";
			case "warning":
				return "yellow";
			case "info":
				return "blue";
			case "debug":
				return "gray";
			default:
				return "gray";
		}
	};

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [search, selectedType]);

	return (
		<Box p="md">
			{/* Header with counts */}
			<Group mb="md">
				{Object.entries(counts).map(([level, count]) => (
					<Badge
						key={level}
						size="lg"
						variant="light"
						color={getLevelColor(level)}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}: {count}
					</Badge>
				))}
			</Group>

			{/* Search and Filter Controls */}
			<Group mb="md" align="flex-end">
				<TextInput
					placeholder="Search... RegEx welcome!"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					leftSection={<IconSearch size={16} />}
					style={{ flex: 1 }}
				/>
				<SegmentedControl
					value={selectedType}
					onChange={setSelectedType}
					data={[
						{ label: "All", value: "all" },
						{ label: "Error", value: "error" },
						{ label: "Warning", value: "warning" },
						{ label: "Info", value: "info" },
						{ label: "Debug", value: "debug" },
					]}
				/>
				<Group>
					<ActionIcon variant="subtle" onClick={handleRefresh}>
						<IconRefresh size={20} />
					</ActionIcon>
				</Group>
			</Group>

			{/* Log table */}
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Level</Table.Th>
						<Table.Th>Time</Table.Th>
						<Table.Th>Type</Table.Th>
						<Table.Th>Description</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{paginatedLogs.map((log) => (
						<Table.Tr key={log.id}>
							<Table.Td>
								<Badge color={getLevelColor(log.level)} variant="dot">
									{log.level}
								</Badge>
							</Table.Td>
							<Table.Td>{new Date(log.created_at).toLocaleString()}</Table.Td>
							<Table.Td>{log.log_type}</Table.Td>
							<Table.Td style={{ fontFamily: "monospace" }}>
								{log.description}
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>

			{/* Pagination */}
			<Group justify="space-between" mt="md">
				<Text size="sm" c="dimmed">
					Showing {(page - 1) * ITEMS_PER_PAGE + 1} -{" "}
					{Math.min(page * ITEMS_PER_PAGE, filteredLogs.length)} of{" "}
					{filteredLogs.length}
				</Text>
				<Pagination
					value={page}
					onChange={setPage}
					total={totalPages}
					siblings={1}
					boundaries={1}
				/>
			</Group>
		</Box>
	);
}
