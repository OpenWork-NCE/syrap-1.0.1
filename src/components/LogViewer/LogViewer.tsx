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
	Modal,
	Button,
	Stack,
	Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
	IconSearch,
	IconSettings,
	IconRefresh,
	IconTableExport,
} from "@tabler/icons-react";
import { LogEntry, LogCounts } from "@/types";
import { ThemedText, ThemedTitle } from "@/components/ui/ThemeComponents";
import classes from "./LogViewer.module.css";
import { innerUrl } from "@/app/lib/utils";

const ITEMS_PER_PAGE = 25;
const TOTAL_LOGS = 10000;

function getLogCounts(logs: LogEntry[]) {
	return logs.reduce(
		(acc, log) => {
			acc[log.level]++;
			return acc;
		},
		{
			error: 0,
			warning: 0,
			info: 0,
			debug: 0,
		},
	);
}

export function LogViewer() {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [selectedType, setSelectedType] = useState<string>("all");
	const [sortBy, setSortBy] = useState<keyof LogEntry>("timestamp");
	const [sortDesc, setSortDesc] = useState(true);
	const [onRefresh, setOnRefresh] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [exportFileName, setExportFileName] = useState("logs");
	const [exportAll, setExportAll] = useState(true);
	const [exportDateRange, setExportDateRange] = useState<
		[Date | null, Date | null]
	>([null, null]);

	// Initialize and refresh logs
	useEffect(() => {
		const initLogs = async () => {
			try {
				const logs = await fetch(innerUrl("/api/logs")).then((res) => res.json());
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

	const handleExportLogsAsPDF = () => {
		const doc = new jsPDF();
		const tableColumn = ["Level", "Time", "Type", "Description"];
		const tableRows: string[][] = [];

		const logsToExport = exportAll
			? logs
			: logs.filter((log) => {
					const logDate = new Date(log.created_at);
					return (
						exportDateRange[0] &&
						exportDateRange[1] &&
						logDate >= exportDateRange[0] &&
						logDate <= exportDateRange[1]
					);
				});

		logsToExport.forEach((log) => {
			const logData = [
				log.level,
				new Date(log.created_at).toLocaleString(),
				log.log_type,
				log.description,
			];
			tableRows.push(logData);
		});

		autoTable(doc, {
			head: [tableColumn],
			body: tableRows,
		});

		doc.save(`${exportFileName}.pdf`);
	};

	const handleExportLogsAsCSV = () => {
		const logsToExport = exportAll
			? logs
			: logs.filter((log) => {
					const logDate = new Date(log.created_at);
					return (
						exportDateRange[0] &&
						exportDateRange[1] &&
						logDate >= exportDateRange[0] &&
						logDate <= exportDateRange[1]
					);
				});

		const csvContent =
			"data:text/csv;charset=utf-8," +
			["Level,Time,Type,Description"]
				.concat(
					logsToExport.map(
						(log) =>
							`${log.level},${new Date(log.created_at).toLocaleString()},${log.log_type},${log.description}`,
					),
				)
				.join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `${exportFileName}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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
		<Box p="md" className={classes.container}>
			{/* Header with counts */}
			<Group mb="md">
				{Object.entries(counts).map(([level, count]) => (
					<Badge
						key={level}
						size="lg"
						variant="light"
						color={getLevelColor(level)}
						className={`${classes.badge} theme-badge theme-badge-${level === "error" ? "error" : level === "warning" ? "warning" : level === "info" ? "primary" : "default"}`}
					>
						{level.charAt(0).toUpperCase() + level.slice(1)}: {count}
					</Badge>
				))}
			</Group>

			{/* Search and Filter Controls */}
			<Group className={classes.controls}>
				<TextInput
					placeholder="Rechercher !"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					leftSection={<IconSearch size={16} />}
					className={`${classes.searchInput} theme-input`}
				/>
				<div className={classes.filterGroup}>
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
				</div>
				<div className={classes.actionGroup}>
					<ActionIcon
						variant="subtle"
						onClick={handleRefresh}
						className="theme-button"
					>
						<IconRefresh size={20} />
					</ActionIcon>
					<ActionIcon
						variant="subtle"
						onClick={() => setExportModalOpen(true)}
						className="theme-button"
					>
						<IconTableExport size={20} />
					</ActionIcon>
				</div>
			</Group>

			{/* Log table */}
			<div
				className={`${classes.tableContainer} theme-table-container theme-scrollbar`}
			>
				<Table striped highlightOnHover className="theme-table">
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
									<Badge color={getLevelColor(log.level)}>{log.level}</Badge>
								</Table.Td>
								<Table.Td>{new Date(log.created_at).toLocaleString()}</Table.Td>
								<Table.Td>{log.log_type}</Table.Td>
								<Table.Td>{log.description}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</div>

			{/* Pagination */}
			<Group justify="center" mt="md" className={classes.pagination}>
				<Pagination
					total={totalPages}
					value={page}
					onChange={setPage}
					withEdges
				/>
				<ThemedText size="sm" c="dimmed">
					Showing {(page - 1) * ITEMS_PER_PAGE + 1} -{" "}
					{Math.min(page * ITEMS_PER_PAGE, filteredLogs.length)} of{" "}
					{filteredLogs.length} logs
				</ThemedText>
			</Group>

			{/* Export Modal */}
			<Modal
				opened={exportModalOpen}
				onClose={() => setExportModalOpen(false)}
				title={<ThemedTitle order={4}>Export Logs</ThemedTitle>}
				centered
			>
				<Stack>
					<TextInput
						label="File Name"
						value={exportFileName}
						onChange={(e) => setExportFileName(e.target.value)}
					/>
					<SegmentedControl
						value={exportAll ? "all" : "range"}
						onChange={(value) => setExportAll(value === "all")}
						data={[
							{ label: "All Logs", value: "all" },
							{ label: "Date Range", value: "range" },
						]}
					/>
					{!exportAll && (
						<DatePickerInput
							type="range"
							label="Date Range"
							value={exportDateRange}
							onChange={setExportDateRange}
						/>
					)}
					<Group grow>
						<Button onClick={handleExportLogsAsPDF}>Export as PDF</Button>
						<Button onClick={handleExportLogsAsCSV}>Export as CSV</Button>
					</Group>
				</Stack>
			</Modal>
		</Box>
	);
}
