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
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconCheck,
	IconDownload,
	IconEdit,
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
import { Cenadi } from "@/types";
import { getInstitutionName, handleExportAsCSV, handleExportRowsAsPDF, innerUrl } from "@/app/lib/utils";
import { useCreateCenadi, useUpdateCenadi, useDeleteCenadi } from "@/app/lib/actionHooks";

type CenadiApiResponse = {
	data: Array<Cenadi>;
	messages: Array<string>;
	success: string;
};

const useGetCenadis = () => {
	return useQuery<CenadiApiResponse>({
		queryKey: ["cenadis"],
		queryFn: () => fetch(innerUrl("/api/cenadis")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	const { authorizations } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	const columns = useMemo<MRT_ColumnDef<Cenadi>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "code",
				header: "Code",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.code,
					//remove any previous validation errors when cenadi focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							code: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
				},
			},
			{
				accessorKey: "name",
				header: "Intitulé",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.name,
					//remove any previous validation errors when cenadi focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							name: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
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

	const { data, isError, isFetching, isLoading, refetch } = useGetCenadis();

	const fetchedCenadis = data?.data ?? [];
	console.log("Voici les cenadis : ", fetchedCenadis);

	const { mutateAsync: createCenadi, isPending: isCreatingCenadi } = useCreateCenadi<Cenadi>();
	const { mutateAsync: updateCenadi, isPending: isUpdatingCenadi } = useUpdateCenadi<Cenadi>();
	const { mutateAsync: deleteCenadi, isPending: isDeletingCenadi } = useDeleteCenadi();

	const handleCreateCenadi: MRT_TableOptions<Cenadi>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateCenadi(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			console.log("Voici les valeurs : ", values);
			setValidationErrors(values);
			await createCenadi(values);
			exitCreatingMode();
		};

	const handleSaveCenadi: MRT_TableOptions<Cenadi>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateCenadi(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			console.log("Voici les valeurs de l'update : ", values);
			await updateCenadi({
				...values,
				id: row.original.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<Cenadi>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette Institution Cenadi ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteCenadi(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedCenadis,
		createDisplayMode: "row",
		editDisplayMode: "row",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Institutions CenadisTable",
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
		mantineCreateRowModalProps: {
			centered: true,
		},
		mantineEditRowModalProps: {
			centered: true,
		},
		onCreatingRowCancel: () => setValidationErrors({}),
		onCreatingRowSave: handleCreateCenadi,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveCenadi,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-cenadis")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvelle Institution Cenadi</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer l'Institution Cenadi</Title>
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
					<Title order={5}>{row.original.name}</Title>
					<Divider pb={1} mb={10} />
					<Box style={{ fontSize: "16px" }}>
						<Text size={"sm"}>
							Code de l'Institution Cenadi :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.code}</span>
						</Text>
						<Text size={"sm"}>
							Intitulé de l'Institution Cenadi :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Divider my={10} />
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{authorizations.includes("update-cenadis") && (
				<Tooltip label="Editer">
					<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
					</ActionIcon>
				</Tooltip>
				)}
				{authorizations.includes("delete-cenadis") && (
				<Tooltip label="Supprimer">
					<ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
						<IconTrash />
					</ActionIcon>
				</Tooltip>
				)}
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
					{authorizations.includes("create-cenadis") && (
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Institution Cenadi
					</Button>
					)}
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
									handleExportRowsAsPDF(["name", "code"], table.getPrePaginationRowModel().rows.map(row => [row.original.name, row.original.code]))
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() => handleExportRowsAsPDF(["name", "code"], table.getRowModel().rows.map(row => [row.original.name, row.original.code]))}
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
									handleExportRowsAsPDF(["name", "code"], table.getSelectedRowModel().rows.map(row => [row.original.name, row.original.code]))
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(fetchedCenadis.map(row => ({
									name: row.name,
									code: row.code,
								})))}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								//export all rows, including from the next page, (still respects filtering and sorting)
								onClick={() =>
									handleExportAsCSV(table.getPrePaginationRowModel().rows.map(row => ({
										name: row.original.name,
										code: row.original.code,
									})))
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter toute les lignes
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(table.getRowModel().rows.map(row => ({
									name: row.original.name,
									code: row.original.code,
								})))}
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
									handleExportAsCSV(table.getSelectedRowModel().rows.map(row => ({
										name: row.original.name,
										code: row.original.code,
									})))
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
			isSaving: isCreatingCenadi || isUpdatingCenadi || isDeletingCenadi,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

const queryClient = new QueryClient();

type CenadiProps = {
	authorizations: String[];
};

const CenadiTable = ({ authorizations }: CenadiProps) => (
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} />
	</QueryClientProvider>
);

export default CenadiTable;

const validateRequired = (value: string) =>
	!!value.length && value.length > 3 && value.length <= 100;
function validateCenadi(cenadi: Cenadi) {
	return {
		code: !validateRequired(cenadi.code)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
		name: !validateRequired(cenadi.name)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
	};
}
