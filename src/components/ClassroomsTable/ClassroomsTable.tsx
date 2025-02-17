"use client";

import { useMemo, useState } from "react";
import {
	MantineReactTable,
	useMantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFiltersState,
	type MRT_PaginationState,
	type MRT_SortingState,
	type MRT_ColumnFilterFnsState,
	MRT_EditActionButtons,
	MRT_TableOptions,
	MRT_Row,
} from "mantine-react-table";
import { useCustomTable } from "@/hooks/use-custom-table";
import {
	ActionIcon,
	Box,
	Button,
	Divider,
	Flex,
	Menu,
	Stack,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconCheck,
	IconDownload,
	IconEdit,
	IconEye,
	IconFileTypeCsv,
	IconFileTypePdf,
	IconPlus,
	IconRefresh,
	IconTableExport,
	IconTrash,
} from "@tabler/icons-react";
import {
	QueryClient,
	QueryClientProvider,
	keepPreviousData,
	useQuery,
	useQueryClient,
	useMutation,
} from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { notifications } from "@mantine/notifications";
import { FormattedClassroom, Classroom, Branch, Level } from "@/types";
import { useRouter } from "next/navigation";
import CustomCreateRowModal from "@/components/ClassroomsTable/CreateModal";
import { PATH_SECTIONS } from "@/routes";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

type ClassroomApiResponse = {
	data: Array<Classroom>;
	messages: Array<string>;
	success: string;
};

type BranchApiResponse = {
	data: Array<Branch>;
	messages: Array<string>;
	success: string;
};

type LevelApiResponse = {
	data: Array<Level>;
	messages: Array<string>;
	success: string;
};

interface Params {
	columnFilterFns: MRT_ColumnFilterFnsState;
	columnFilters: MRT_ColumnFiltersState;
	globalFilter: string;
	sorting: MRT_SortingState;
	instituteId: string;
	institute: string;
	// pagination: MRT_PaginationState;
}
//custom react-query hook
const useGetClassrooms = ({ institute, instituteId }: Params) => {
	const fetchURL = new URL(
		institute === "Ipes"
			? `/api/ipess/${instituteId}/classrooms`
			: `/api/universities/${instituteId}/classrooms`,
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<Classroom[]>({
		queryKey: ["classrooms"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetLevels = () => {
	const fetchURL = new URL(
		"/api/levels",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<LevelApiResponse>({
		queryKey: ["levels"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetBranches = () => {
	const fetchURL = new URL(
		"/api/branches",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<BranchApiResponse>({
		queryKey: ["branches"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

type SectionProps = {
	institute: "Ipes" | "University";
	instituteId: string;
};

const Section = (props: SectionProps) => {
	const { institute, instituteId } = props;
	// const [fetchedClassrooms, setFetchedClassroooms] = useState<Classroom[]>([]);
	// const [formattedClassrooms, setFormattedClassrooms] = useState<
	// 	FormattedClassroom[]
	// >([]);
	const { push } = useRouter();
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});
	function formatClassroom(classroom: Classroom): FormattedClassroom {
		return {
			id: classroom.id,
			designation: classroom.designation,
			levelId: classroom.filiere?.id,
			levelName: classroom.niveau?.name,
			levelDescription: classroom.niveau?.description,
			branchId: classroom.filiere?.id,
			branchName: classroom.filiere?.name,
			branchDescription: classroom.filiere?.description,
		};
	}

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetLevels();

	const fetchedLevels = lData?.data ?? [];
	console.log("Intelligence de jeu levels : ", fetchedLevels);

	const {
		data: bData,
		isError: bIsError,
		isFetching: bIsFetching,
		isLoading: bIsLoading,
		refetch: bRefresh,
	} = useGetBranches();

	const fetchedBranches = bData?.data ?? [];
	console.log("Intelligence de jeu branches : ", fetchedBranches);

	const handleExportRows = (rows: MRT_Row<FormattedClassroom>[]) => {
		const doc = new jsPDF("portrait", "pt", "A4");
		const pageWidth = doc.internal.pageSize.getWidth();
		const logoUrl = "/thumbnail.png"; // Path to your logo

		// French Column (Left)
		const frenchText = `
	    REPUBLIQUE DU CAMEROUN
	           Paix – Travail – Patrie
	            -------------------------
	      MINISTERE DES FINANCES
	            -------------------------
	       SECRETARIAT GENERAL
	            ------------------------
	        CENTRE NATIONAL DE
	         DEVELOPPEMENT DE
	             L’INFORMATIQUE
	             -------------------------
	  `;

		// English Column (Right)
		const englishText = `
	        REPUBLIC OF CAMEROON
	         Peace – Work – Fatherland
	                -------------------------
	           MINISTRY OF FINANCE
	                -------------------------
	          GENERAL SECRETARIAT
	                -------------------------
	        NATIONAL CENTRE FOR THE
	      DEVELOPMENT OF COMPUTER
	                         SERVICES
	            ------------------------------------
	  `;

		// Add Header with 3 columns
		doc.setFontSize(10);

		// Column 1: French text
		doc.text(frenchText, 40, 50); // Positioned on the left side

		// Column 2: Logo
		doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 40, 60, 60); // Centered logo

		// Column 3: English text
		doc.text(englishText, pageWidth - 250, 50); // Positioned on the right side

		// Draw a line separating the header from the rest of the content
		// doc.setLineWidth(0.5);
		// doc.line(30, 170, pageWidth - 30, 170); // Line under the header

		// doc.setLineWidth(0.5);
		// doc.line(30, 60, 180, 60); // Draw a line under the header

		// doc.text();
		const tableData = rows.map((row) => Object.values(row.original));
		const tableHeaders = columns.map((c) => c.header);

		autoTable(doc, {
			startY: 200, // Start after the header
			head: [tableHeaders],
			body: [
				[
					"designation",
					"levelName",
					"levelDescription",
					"branchName",
					"branchDescription",
				],
			],
		});

		doc.save("syrap-classrooms.pdf");
	};

	const handleExportRowsAsCSV = (rows: MRT_Row<FormattedClassroom>[]) => {
		const rowData = rows.map((row) => ({
			designation: row.original.id,
			levelName: row.original.levelName,
			levelDescription: row.original.levelDescription,
			branchName: row.original.branchName,
			branchDescription: row.original.branchDescription,
		}));
		const csv = generateCsv(csvConfig)(rowData);
		download(csvConfig)(csv);
	};

	const handleExportDataAsCSV = () => {
		const allData = formattedClassrooms.map((row: any) => ({
			designation: row.original.id,
			levelName: row.original.levelName,
			levelDescription: row.original.levelDescription,
			branchName: row.original.branchName,
			branchDescription: row.original.branchDescription,
		}));
		const csv = generateCsv(csvConfig)(allData);
		download(csvConfig)(csv);
	};

	const columns = useMemo<MRT_ColumnDef<FormattedClassroom>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "designation",
				header: "Intitulé",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.designqtion,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							designation: undefined,
						}),
				},
			},
			{
				accessorKey: "branchId",
				accessorFn: (row) => row.branchName,
				header: "Filière",
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedBranches.map((branch) => ({
						value: String(branch.id),
						label: branch.name,
					})),
				},
			},
			{
				accessorKey: "levelId",
				accessorFn: (row) => row.levelName,
				header: "Niveau",
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedLevels.map((level) => ({
						value: String(level.id),
						label: level.name,
					})),
				},
			},
		],
		[validationErrors],
	);

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
		[],
	);
	const [columnFilterFns, setColumnFilterFns] =
		useState<MRT_ColumnFilterFnsState>(
			Object.fromEntries(
				columns.map(({ accessorKey }) => [accessorKey, "contains"]),
			),
		);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	// const [pagination, setPagination] = useState<MRT_PaginationState>({
	// 	pageIndex: 0,
	// 	pageSize: 10,
	// });

	const { data, isError, isFetching, isLoading, refetch } = useGetClassrooms({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
		instituteId,
		institute,
	});

	const formattedClassrooms = useMemo(() => {
		// console.log("Voici les informations concernant les classrooms : ", data);
		// if (data === undefined || data.length === 0) {
		// 	return [] as unknown as FormattedClassroom[];
		// } else {
		// 	return data.map(formatClassroom);
		// }
		if (!data || !Array.isArray(data)) {
			return [] as FormattedClassroom[];
		}
		return data.map(formatClassroom);
	}, [data]);
	console.log("Voici les classrooms : ", data);
	console.log("Voici les classrooms que j'ai recu : ", formattedClassrooms);

	const { mutateAsync: createClassroom, isPending: isCreatingClassroom } =
		useCreateClassroom();
	const { mutateAsync: updateClassroom, isPending: isUpdatingClassroom } =
		useUpdateClassroom();
	const { mutateAsync: deleteClassroom, isPending: isDeletingClassroom } =
		useDeleteClassroom();

	const handleCreateClassroom: MRT_TableOptions<FormattedClassroom>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateClassroom(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			console.log(
				"Voici les valeurs en question asadasdasdasdasdasdsadsadas sadsadasda: ",
				values,
			);
			await createClassroom({
				...values,
				institute_id: instituteId,
			});
			exitCreatingMode();
		};

	const handleSaveClassroom: MRT_TableOptions<FormattedClassroom>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateClassroom(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			await updateClassroom({
				...values,
				institute_id: instituteId,
				id: row.original.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<FormattedClassroom>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette Salle ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.designation}? Cette
					action est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteClassroom(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: formattedClassrooms,
		createDisplayMode: "modal",
		editDisplayMode: "modal",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Salles",
		},
		getRowId: (row) => row.id,
		mantineToolbarAlertBannerProps: isError
			? {
					color: "red",
					children: "Erreur de chargement des données",
				}
			: undefined,
		mantineTableContainerProps: {
			style: {
				minHeight: "auto",
			},
		},
		onCreatingRowCancel: () => setValidationErrors({}),
		onCreatingRowSave: handleCreateClassroom,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveClassroom,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			return (
				<Stack>
					<Title order={3}>Nouvelle Salle</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer la Salle</Title>
				{internalEditComponents}

				<Flex justify="flex-end" mt="xl">
					<MRT_EditActionButtons variant="text" table={table} row={row} />
				</Flex>
			</Stack>
		),

		renderDetailPanel: ({ row }) => (
			<Box
				style={{
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					gap: "16px",
					padding: "16px",
					width: "100%",
				}}
			>
				<Box style={{ width: "100%" }}>
					<Title order={5} pb={10}>
						{row.original.designation}
					</Title>
					<Box style={{ fontSize: "16px" }}>
						<Text size={"sm"}>
							Intitulé de la filière :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.branchName}
							</span>
						</Text>
						<Text size={"sm"}>
							Description de la filière :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.branchDescription}
							</span>
						</Text>
						<Text size={"sm"}>
							Intitulé du niveau :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.levelName}
							</span>
						</Text>
						<Text size={"sm"}>
							Description du niveau :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.levelDescription}
							</span>
						</Text>
						<Divider pb={1} mb={10} />
						<Button
							variant={"outline"}
							leftSection={<IconEye />}
							onClick={() => {
								push(PATH_SECTIONS.universities.syllabus);
							}}
						>
							Aller aux programmes de la salle
						</Button>
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				<Tooltip label="Editer">
					<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Supprimer">
					<ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
						<IconTrash />
					</ActionIcon>
				</Tooltip>
			</Flex>
		),

		renderTopToolbarCustomActions: ({ table }) => (
			<>
				<Flex gap={4} justify={"flex-end"} align={"center"}>
					<Tooltip label="Rafraichir des données">
						<ActionIcon onClick={() => refetch()}>
							<IconRefresh />
						</ActionIcon>
					</Tooltip>
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Salle
					</Button>
					<Menu
						shadow={"md"}
						// width={130}
						trigger="hover"
						openDelay={100}
						closeDelay={400}
					>
						<Menu.Target>
							<Button
								leftSection={<IconTableExport />}
								rightSection={<IconDownload size={14} />}
								variant={"filled"}
							>
								Exporter
							</Button>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Label>Format PDF</Menu.Label>
							<Menu.Item
								//export all rows, including from the next page, (still respects filtering and sorting)
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								leftSection={<IconFileTypePdf />}
								onClick={() =>
									handleExportRows(table.getPrePaginationRowModel().rows)
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() => handleExportRows(table.getRowModel().rows)}
							>
								Exporter la page
							</Menu.Item>
							<Menu.Item
								disabled={
									!table.getIsSomeRowsSelected() &&
									!table.getIsAllRowsSelected()
								}
								//only export selected rows
								leftSection={<IconFileTypePdf />}
								onClick={() =>
									handleExportRows(table.getSelectedRowModel().rows)
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={handleExportDataAsCSV}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								//export all rows, including from the next page, (still respects filtering and sorting)
								onClick={() =>
									handleExportRowsAsCSV(table.getPrePaginationRowModel().rows)
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter toute les lignes
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								onClick={() => handleExportRowsAsCSV(table.getRowModel().rows)}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter toutes la pages
							</Menu.Item>
							<Menu.Item
								disabled={
									!table.getIsSomeRowsSelected() &&
									!table.getIsAllRowsSelected()
								}
								//only export selected rows
								onClick={() =>
									handleExportRowsAsCSV(table.getSelectedRowModel().rows)
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter la selection
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Flex>
			</>
		),
		state: {
			columnFilterFns,
			columnFilters,
			globalFilter,
			// pagination,
			isLoading: isLoading,
			isSaving:
				isCreatingClassroom || isUpdatingClassroom || isDeletingClassroom,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateClassroom() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (classroom: FormattedClassroom) => {
			const response = await fetch(
				"http://localhost:3000/api/classrooms/create",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(classroom),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de la Salle");
			}

			notifications.show({
				color: "teal",
				title: "Salle crééé",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newClassroomInfo: FormattedClassroom) => {
			queryClient.setQueryData(["classrooms"], (prevClassrooms: any) => {
				const classroomList = Array.isArray(prevClassrooms)
					? prevClassrooms
					: [];
				return [
					...classroomList,
					{
						...newClassroomInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as FormattedClassroom[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
		},
	});
}

function useUpdateClassroom() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (classroom: FormattedClassroom) => {
			const response = await fetch(
				`http://localhost:3000/api/classrooms/${classroom.id}/update`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(classroom),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de la Salle");
			}

			notifications.show({
				color: "green",
				title: "Salle mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newClassroomInfo: FormattedClassroom) => {
			queryClient.setQueryData(["classrooms"], (prevClassrooms: any) => {
				const classroomList = Array.isArray(prevClassrooms)
					? prevClassrooms
					: [];

				return classroomList.map((classroom: Classroom) =>
					classroom.id === newClassroomInfo.id
						? { ...classroom, ...newClassroomInfo }
						: classroom,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
		},
	});
}

function useDeleteClassroom() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (classroomId: string) => {
			const response = await fetch(
				`http://localhost:3000/api/classrooms/${classroomId}/delete`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: classroomId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression de la Salle");
			}

			notifications.show({
				color: "red",
				title: "Salle supprimée",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (classroomId: string) => {
			queryClient.cancelQueries({ queryKey: ["classrooms"] });

			const previousClassrooms = queryClient.getQueryData(["classrooms"]);

			queryClient.setQueryData(
				["classrooms"],
				(prevClassrooms: any | undefined) => {
					return prevClassrooms?.data?.filter(
						(classroom: FormattedClassroom) => classroom.id !== classroomId,
					);
				},
			);

			return { previousClassrooms };
		},
		onError: (err, classroomId, context: any) => {
			if (context?.previousClassrooms) {
				queryClient.setQueryData(["classrooms"], context.previousClassrooms);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
		},
	});
}

const queryClient = new QueryClient();

type ClassroomProps = {
	institute: "Ipes" | "University";
	instituteId: string;
};

const ClassroomTable = ({ institute, instituteId }: ClassroomProps) => (
	<QueryClientProvider client={queryClient}>
		<Section institute={institute} instituteId={instituteId} />
	</QueryClientProvider>
);

export default ClassroomTable;

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
	!!email.length &&
	email
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);

function validateClassroom(classrooms: FormattedClassroom) {
	return {
		designation: !validateRequired(classrooms.designation)
			? "Un intitulé pour la salle est requis"
			: "",
	};
}
