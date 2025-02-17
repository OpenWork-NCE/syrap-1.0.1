"use client";

import {
	MantineReactTable,
	type MRT_ColumnDef,
	MRT_EditActionButtons,
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
} from "@tabler/icons-react";
import { useState } from "react";
import { EditCourseModal } from "./EditUEModal";
import type { Program } from "@/components/Syllabus/Syllabus";
import { useCustomTable } from "@/hooks/use-custom-table";

interface ProgramTableProps {
	program: Program;
	filteredPrograms: Program[];
	setFilteredPrograms: (filteredPrograms: Program[]) => void;
	onUpdate: (program: Program) => void;
	onDelete: (programId: string) => void;
}

export function ProgramTable({
	program,
	onUpdate,
	onDelete,
	setFilteredPrograms,
	filteredPrograms,
}: ProgramTableProps) {
	const [editingCourse, setEditingCourse] = useState<any>(null);

	const columns: MRT_ColumnDef<any>[] = [
		{
			accessorKey: "name",
			header: "Nom",
		},
		{
			accessorKey: "description",
			header: "Description",
		},
		{
			accessorKey: "nbr_hrs",
			header: "Heures",
		},
		{
			accessorKey: "credit",
			header: "Crédits",
		},
		{
			id: "actions",
			header: "Actions",
			Cell: ({ row }) => (
				<Group>
					<ActionIcon
						onClick={() => setEditingCourse(row.original)}
						variant="subtle"
						color="blue"
					>
						<IconEdit size={22} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							const updatedCourses = program.courses.filter(
								(c) => c.courseId !== row.original.courseId,
							);
							onUpdate({ ...program, courses: updatedCourses });
						}}
						variant="subtle"
						color="red"
					>
						<IconTrash size={22} />
					</ActionIcon>
				</Group>
			),
		},
	];

	// const onUpdate = (program: Program) => {
	// 	const updated = filteredPrograms.map((p) =>
	// 		p.id === program.id ? program : p,
	// 	);
	// 	setFilteredPrograms(updated);
	// };
	//
	// const onDelete = (id: number) => {
	// 	setFilteredPrograms(filteredPrograms.filter((p) => p.id !== id));
	// };

	const table = useMantineReactTable({
		columns,
		data: program.courses, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
		getRowId: (row) => row.id,
		enableColumnFilterModes: true,
		enableColumnOrdering: true,
		enableRowActions: false,
		enableRowSelection: false,
		initialState: {
			showColumnFilters: false,
			showGlobalFilter: false,
		},
		paginationDisplayMode: "pages",
		positionToolbarAlertBanner: "bottom",
		mantinePaginationProps: {
			radius: "xl",
			size: "lg",
		},
		// renderTopToolbarCustomActions={() => (
		// 	<Group>
		// 		<Text fw={500}>Programme {program.id}</Text>
		// 		<Button
		// 			variant="subtle"
		// 			color="red"
		// 			onClick={() => onDelete(program.id)}
		// 			leftSection={<IconTrash size={16} />}
		// 		>
		// 			Supprimer le programme
		// 		</Button>
		// 	</Group>
		// )}

		// renderRowActions: ({ row, table }) => (
		// 	<Flex gap="md">
		// 		<Tooltip label="Editer">
		// 			<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
		// 				<IconEdit />
		// 			</ActionIcon>
		// 		</Tooltip>
		// 		<Tooltip label="Supprimer">
		// 			<ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
		// 				<IconTrash />
		// 			</ActionIcon>
		// 		</Tooltip>
		// 	</Flex>
		// ),

		// renderDetailPanel: ({ row }) => (
		// 	<Box
		// 		style={{
		// 			display: "flex",
		// 			justifyContent: "flex-start",
		// 			alignItems: "center",
		// 			gap: "16px",
		// 			padding: "16px",
		// 			width: "100%",
		// 		}}
		// 	>
		// 		<Box style={{ width: "100%" }}>
		// 			<Title order={5}>{row.original.name}</Title>
		// 			<Divider pb={1} mb={10} />
		// 		</Box>
		// 	</Box>
		// ),

		renderTopToolbarCustomActions: ({ table }) => (
			<Stack>
				<Stack>
					<Title order={4}>Niveau : {program.branchName}</Title>
					<Title order={4}>Filière : {program.levelName}</Title>
				</Stack>
				<Flex gap={4}>
					<Group>
						<Tooltip label="Rafraichir des données">
							<Button
								variant="subtle"
								onClick={() => onDelete(program.id)}
								leftSection={<IconRefresh />}
							>
								Rafraichir des données
							</Button>
						</Tooltip>
						<Tooltip label="Supprimer le programme">
							<Button
								variant="subtle"
								color="red"
								onClick={() => onDelete(program.id)}
								leftSection={<IconTrash />}
							>
								Supprimer le programme
							</Button>
						</Tooltip>
					</Group>
				</Flex>
			</Stack>
		),
	});

	return (
		<Paper shadow={"md"} p={"md"}>
			<MantineReactTable table={table} />

			<EditCourseModal
				course={editingCourse}
				opened={!!editingCourse}
				onClose={() => setEditingCourse(null)}
				onSubmit={(updatedCourse) => {
					const updatedCourses = program.courses.map((c) =>
						c.courseId === updatedCourse.courseId ? updatedCourse : c,
					);
					onUpdate({ ...program, courses: updatedCourses });
					setEditingCourse(null);
				}}
			/>
		</Paper>
	);
}
