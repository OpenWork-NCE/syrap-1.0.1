"use client";

import {
	MantineReactTable,
	type MRT_ColumnDef,
	useMantineReactTable,
} from "mantine-react-table";
import {
	ActionIcon,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
	Title,
	Tooltip,
	Modal,
	Badge,
	Tabs,
	Alert,
} from "@mantine/core";
import {
	IconDownload,
	IconEdit,
	IconFileTypeCsv,
	IconFileTypePdf,
	IconPlus,
	IconRefresh,
	IconTableExport,
	IconTrash,
	IconPrinter,
	IconAlertCircle,
	IconCalendar,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { EditCourseModal } from "./EditUEModal";
import type { Program, Course } from "@/components/Syllabus/Syllabus";
import { handleExportRowsAsPDF, handleExportAsCSV } from "@/app/lib/utils";
import { useDisclosure } from "@mantine/hooks";

interface ProgramTableProps {
	program: Program;
	university: string;
	year: string;
	filteredPrograms: Program[];
	setFilteredPrograms: (filteredPrograms: Program[]) => void;
	onUpdate: (program: Program) => void;
	onDelete: (programId: string) => void;
}

export function ProgramTable({
	program,
	onUpdate,
	onDelete,
	university,
	year,
	setFilteredPrograms,
	filteredPrograms,
}: ProgramTableProps) {
	const [editingCourse, setEditingCourse] = useState<Course | null>(null);
	const [
		deleteConfirmOpen,
		{ open: openDeleteConfirm, close: closeDeleteConfirm },
	] = useDisclosure(false);
	const [programToDelete, setProgramToDelete] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>("all");

	// Group courses by year
	const coursesByYear = useMemo(() => {
		console.log("Grouping courses by year for program:", program.id);
		const grouped: Record<string, Course[]> = {};

		// First, group courses by year
		program.courses.forEach((course) => {
			if (!grouped[course.year]) {
				grouped[course.year] = [];
			}
			grouped[course.year].push(course);
		});

		console.log("Grouped courses:", grouped);

		// Sort years in descending order
		return Object.entries(grouped)
			.sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
			.reduce(
				(acc, [year, courses]) => {
					acc[year] = courses;
					return acc;
				},
				{} as Record<string, Course[]>,
			);
	}, [program.courses]);

	// Get the active courses based on the selected tab
	const activeCourses = useMemo(() => {
		if (activeTab === "all") {
			// When showing all courses, sort them by year (most recent first)
			return [...program.courses].sort(
				(a, b) => parseInt(b.year) - parseInt(a.year),
			);
		}
		return coursesByYear[activeTab] || [];
	}, [activeTab, program.courses, coursesByYear]);

	const columns: MRT_ColumnDef<Course>[] = [
		{
			accessorKey: "name",
			header: "Nom",
			size: 200,
		},
		{
			accessorKey: "description",
			header: "Description",
			size: 300,
			Cell: ({ cell }) => <Text lineClamp={2}>{cell.getValue<string>()}</Text>,
		},
		{
			accessorKey: "nbr_hrs",
			header: "Heures",
			size: 100,
		},
		{
			accessorKey: "credit",
			header: "Crédits",
			size: 100,
		},
		{
			accessorKey: "year",
			header: "Année",
			size: 100,
			Cell: ({ cell }) => (
				<Badge color="blue" variant="light">
					{cell.getValue<string>()}
				</Badge>
			),
			sortingFn: "basic",
		},
		{
			id: "actions",
			header: "Actions",
			size: 120,
			Cell: ({ row }) => (
				<Group>
					<ActionIcon
						onClick={() => setEditingCourse(row.original)}
						variant="subtle"
						color="blue"
						title="Modifier cette UE"
					>
						<IconEdit size={24} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							const updatedCourses = program.courses.filter(
								(c) =>
									c.courseId !== row.original.courseId ||
									c.year !== row.original.year,
							);
							onUpdate({ ...program, courses: updatedCourses });
							// Reload page after deletion
							setTimeout(() => {
								window.location.reload();
							}, 1000);
						}}
						variant="subtle"
						color="red"
						title="Supprimer cette UE"
					>
						<IconTrash size={24} />
					</ActionIcon>
				</Group>
			),
		},
	];

	const handleExportData = () => {
		console.log("Exporting data for active tab:", activeTab);
		// Prepare data for export
		const exportData = activeCourses.map((course: Course) => ({
			Nom: course.name,
			Description: course.description,
			Heures: course.nbr_hrs,
			Credits: course.credit,
			Annee: course.year,
		}));

		console.log("Prepared export data:", exportData);

		// Export as CSV with year in filename if filtering by year
		const filename =
			activeTab !== "all"
				? `programme_${university.replace(/\s+/g, "_")}_${program.branchName.replace(/\s+/g, "_")}_${program.levelName.replace(/\s+/g, "_")}_${activeTab}`
				: `programme_${university.replace(/\s+/g, "_")}_${program.branchName.replace(/\s+/g, "_")}_${program.levelName.replace(/\s+/g, "_")}`;

		handleExportAsCSV(exportData, filename);
	};

	const handleExportPDF = () => {
		console.log("Exporting PDF for active tab:", activeTab);
		// Prepare headers and data for PDF export
		const headers = ["Nom", "Description", "Heures", "Crédits", "Année"];
		const data = activeCourses.map((course: Course) => [
			course.name,
			course.description,
			course.nbr_hrs,
			course.credit,
			course.year,
		]);

		console.log("Prepared PDF data:", { headers, data });

		// Export as PDF with program details and year in filename if filtering by year
		const title =
			activeTab !== "all"
				? `Programme: ${university} - ${program.branchName} - ${program.levelName} - Année ${activeTab}`
				: `Programme: ${university} - ${program.branchName} - ${program.levelName}`;

		const filename =
			activeTab !== "all"
				? `programme_${university.replace(/\s+/g, "_")}_${program.branchName.replace(/\s+/g, "_")}_${program.levelName.replace(/\s+/g, "_")}_${activeTab}`
				: `programme_${university.replace(/\s+/g, "_")}_${program.branchName.replace(/\s+/g, "_")}_${program.levelName.replace(/\s+/g, "_")}`;

		handleExportRowsAsPDF(headers, data, title, filename);
	};

	const handlePrint = () => {
		// Create a printable version with all program details
		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		// Determine if we're printing all years or just the active year
		const coursesToPrint =
			activeTab === "all"
				? coursesByYear // Print all years grouped
				: { [activeTab]: coursesByYear[activeTab] }; // Print only the active year

		const title =
			activeTab !== "all"
				? `Programme: ${university} - ${program.branchName} - ${program.levelName} - Année ${activeTab}`
				: `Programme: ${university} - ${program.branchName} - ${program.levelName}`;

		const html = `
			<html>
				<head>
					<title>${title}</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; }
						.header { text-align: center; margin-bottom: 20px; }
						.program-info { margin-bottom: 20px; }
						table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
						th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
						th { background-color: #f2f2f2; }
						.year-section { margin-top: 20px; margin-bottom: 30px; }
						.year-title { background-color: #f8f9fa; padding: 10px; font-weight: bold; border: 1px solid #ddd; }
						.summary { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
						.summary-table { width: auto; margin-top: 10px; }
						.summary-table th, .summary-table td { padding: 5px 15px; }
						@media print {
							button { display: none; }
							.page-break { page-break-after: always; }
						}
					</style>
				</head>
				<body>
					<div class="header">
						<h1>Programme de Formation</h1>
						<h2>${title}</h2>
					</div>
					<div class="program-info">
						<p><strong>Université:</strong> ${university}</p>
						<p><strong>Filière:</strong> ${program.branchName}</p>
						<p><strong>Niveau:</strong> ${program.levelName}</p>
						<p><strong>Total UEs:</strong> ${program.courses.length}</p>
					</div>

					${Object.entries(coursesToPrint)
						.map(
							([year, courses]) => `
						<div class="year-section">
							<div class="year-title">Année: ${year}</div>
							<table>
								<thead>
									<tr>
										<th>Nom</th>
										<th>Description</th>
										<th>Heures</th>
										<th>Crédits</th>
									</tr>
								</thead>
								<tbody>
									${courses
										.map(
											(course: Course) => `
										<tr>
											<td>${course.name}</td>
											<td>${course.description}</td>
											<td>${course.nbr_hrs}</td>
											<td>${course.credit}</td>
										</tr>
									`,
										)
										.join("")}
								</tbody>
							</table>
						</div>
					`,
						)
						.join("")}

					${
						activeTab === "all"
							? `
					<div class="summary">
						<h3>Résumé par année</h3>
						<table class="summary-table">
							<thead>
								<tr>
									<th>Année</th>
									<th>Nombre d'UEs</th>
									<th>Total Heures</th>
									<th>Total Crédits</th>
								</tr>
							</thead>
							<tbody>
								${Object.entries(coursesByYear)
									.map(([year, courses]) => {
										const totalHours = courses.reduce(
											(sum, course) => sum + Number(course.nbr_hrs),
											0,
										);
										const totalCredits = courses.reduce(
											(sum, course) => sum + Number(course.credit),
											0,
										);
										return `
											<tr>
												<td>${year}</td>
												<td>${courses.length}</td>
												<td>${totalHours}</td>
												<td>${totalCredits}</td>
											</tr>
											`;
									})
									.join("")}
								<tr style="font-weight: bold; background-color: #f2f2f2;">
									<td>Total</td>
									<td>${program.courses.length}</td>
									<td>${program.courses.reduce((sum, course) => sum + Number(course.nbr_hrs), 0)}</td>
									<td>${program.courses.reduce((sum, course) => sum + Number(course.credit), 0)}</td>
								</tr>
							</tbody>
						</table>
					</div>
					`
							: ""
					}

					<div style="margin-top: 30px; text-align: center;">
						<button onclick="window.print()">Imprimer</button>
					</div>
				</body>
			</html>
		`;

		printWindow.document.write(html);
		printWindow.document.close();
	};

	const handleDeleteConfirm = (programId: string) => {
		setProgramToDelete(programId);
		openDeleteConfirm();
	};

	const executeDelete = () => {
		if (programToDelete) {
			onDelete(programToDelete);
			closeDeleteConfirm();
			setProgramToDelete(null);
			// Reload page after program deletion
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		}
	};

	const table = useMantineReactTable({
		columns,
		data: activeCourses,
		getRowId: (row) => `${row.courseId}-${row.year}`,
		enableColumnFilterModes: true,
		enableColumnOrdering: true,
		enableRowActions: false,
		enableRowSelection: false,
		enableStickyHeader: true,
		initialState: {
			showColumnFilters: false,
			showGlobalFilter: true,
			density: "xs",
			sorting: [{ id: "year", desc: true }],
		},
		paginationDisplayMode: "pages",
		positionToolbarAlertBanner: "bottom",
		mantinePaginationProps: {
			radius: "xl",
			size: "lg",
		},
		renderTopToolbarCustomActions: () => null,
	});

	return (
		<>
			<Paper shadow="xs" p="md" withBorder radius="md">
				<Stack gap="md">
					<Group justify="space-between" align="flex-start">
						<Stack gap={5}>
							<Title order={3} fw={600}>
								{university}
							</Title>
							<Group gap="xs">
								<Text fw={500}>Filière :</Text>
								<Text>{program.branchName}</Text>
								<Divider orientation="vertical" />
								<Text fw={500}>Niveau :</Text>
								<Text>{program.levelName}</Text>
								<Divider orientation="vertical" />
								<Group gap={5}>
									<IconCalendar size={16} />
									<Text fw={500}>Année :</Text>
									<Text>{activeTab === "all" ? "Toutes" : activeTab}</Text>
								</Group>
							</Group>
						</Stack>
						<Group>
							<Menu shadow="md" width={200} position="bottom-end">
								<Menu.Target>
									<Button
										leftSection={<IconTableExport size={18} />}
										variant="light"
										size="sm"
									>
										Exporter
									</Button>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										leftSection={<IconFileTypePdf size={18} />}
										onClick={handleExportPDF}
									>
										Exporter en PDF
									</Menu.Item>
									<Menu.Item
										leftSection={<IconFileTypeCsv size={18} />}
										onClick={handleExportData}
									>
										Exporter en CSV
									</Menu.Item>
									<Menu.Item
										leftSection={<IconPrinter size={18} />}
										onClick={handlePrint}
									>
										Imprimer
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
							<Button
								variant="subtle"
								color="red"
								onClick={() => handleDeleteConfirm(program.id)}
								leftSection={<IconTrash size={18} />}
								size="sm"
							>
								Supprimer le programme
							</Button>
						</Group>
					</Group>

					<Group>
						<Badge size="lg" radius="sm" variant="light">
							{activeCourses.length} UE(s){" "}
							{activeTab !== "all" ? `pour l'année ${activeTab}` : "au total"}
						</Badge>
					</Group>

					<Tabs
						value={activeTab}
						onChange={(value) => setActiveTab(value || "all")}
					>
						<Tabs.List>
							<Tabs.Tab value="all" leftSection={<IconCalendar size={14} />}>
								Toutes les années ({program.courses.length})
							</Tabs.Tab>
							{Object.entries(coursesByYear).map(([year, courses]) => (
								<Tabs.Tab key={year} value={year}>
									{year} ({courses.length})
								</Tabs.Tab>
							))}
						</Tabs.List>
					</Tabs>

					<Box>
						<MantineReactTable table={table} />
					</Box>
				</Stack>
			</Paper>

			<EditCourseModal
				course={editingCourse}
				opened={!!editingCourse}
				onClose={() => setEditingCourse(null)}
				classroomId={program.classroomId}
				onSubmit={(updatedCourse) => {
					const updatedCourses = program.courses.map((c) =>
						c.courseId === updatedCourse.courseId ? updatedCourse : c,
					);
					onUpdate({ ...program, courses: updatedCourses });
					setEditingCourse(null);
				}}
			/>

			<Modal
				opened={deleteConfirmOpen}
				onClose={closeDeleteConfirm}
				title="Confirmer la suppression"
				centered
				padding="lg"
				radius="md"
			>
				<Stack>
					<Alert
						color="red"
						icon={<IconAlertCircle size={24} />}
						variant="light"
					>
						<Text fw={500} mb="xs">
							Êtes-vous sûr de vouloir supprimer ce programme ?
						</Text>
						<Text size="sm" c="dimmed">
							Cette action est irréversible et supprimera toutes les UEs
							associées à ce programme.
						</Text>
					</Alert>
					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeDeleteConfirm} size="sm">
							Annuler
						</Button>
						<Button color="red" onClick={executeDelete} size="sm">
							Supprimer
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
