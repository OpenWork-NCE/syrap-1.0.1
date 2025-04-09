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
import { Branch } from "@/types";
import {handleExportAsCSV, handleExportRowsAsPDF, innerUrl} from "@/app/lib/utils";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

type BranchApiResponse = {
	data: Array<Branch>;
	messages: Array<string>;
	success: string;
};

type LevelApiResponse = {
	data: Array<Branch>;
	messages: Array<string>;
	success: string;
};

interface Params {
	columnFilterFns: MRT_ColumnFilterFnsState;
	columnFilters: MRT_ColumnFiltersState;
	globalFilter: string;
	sorting: MRT_SortingState;
	// pagination: MRT_PaginationState;
}

const useGetBranches = () => {
	return useQuery<BranchApiResponse>({
		queryKey: ["branches"],
		queryFn: () => fetch(innerUrl("/api/branches")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	const { authorizations } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	const columns = useMemo<MRT_ColumnDef<Branch>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "name",
				header: "Intitulé",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.name,
					//remove any previous validation errors when branch focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							name: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
				},
			},
			{
				accessorKey: "description",
				header: "Description",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.description,
					//remove any previous validation errors when branch focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							description: undefined,
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

	const { data, isError, isFetching, isLoading, refetch } = useGetBranches();

	const fetchedBranches = data?.data ?? [];
	console.log("Voici les branches : ", fetchedBranches);

	const { mutateAsync: createBranch, isPending: isCreatingBranch } =
		useCreateBranch();
	const { mutateAsync: updateBranch, isPending: isUpdatingBranch } =
		useUpdateBranch();
	const { mutateAsync: deleteBranch, isPending: isDeletingBranch } =
		useDeleteBranch();

	const handleCreateBranch: MRT_TableOptions<Branch>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateBranch(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			console.log("Voici les valeurs : ", values);
			setValidationErrors(values);
			await createBranch(values);
			exitCreatingMode();
		};

	const handleSaveBranch: MRT_TableOptions<Branch>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateBranch(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			console.log("Voici les valeurs de l'update : ", values);
			await updateBranch({
				...values,
				id: row.original.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<Branch>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette filière ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteBranch(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedBranches,
		createDisplayMode: "row",
		editDisplayMode: "row",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Filière",
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
		onCreatingRowSave: handleCreateBranch,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveBranch,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-branches")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvelle Filière</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer les filière</Title>
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
							Intitulé de la filière :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Text size={"sm"}>
							Description de la filière :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.description}
							</span>
						</Text>
						<Divider my={10} />
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{/*{branches.includes("update-branches") && (*/}
				<Tooltip label="Editer">
					<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
					</ActionIcon>
				</Tooltip>
				{/*)}*/}
				{/*{branches.includes("delete-branches") && (*/}
				<Tooltip label="Supprimer">
					<ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
						<IconTrash />
					</ActionIcon>
				</Tooltip>
				{/*)}*/}
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
					{/*{branches.includes("create-branches") && (*/}
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Filière
					</Button>
					{/*)}*/}
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
									handleExportRowsAsPDF(["Intitulé", "Description"], table.getPrePaginationRowModel().rows.map((row) => [row.original.name, row.original.description]))
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() => handleExportRowsAsPDF(["Intitulé", "Description"], table.getRowModel().rows.map((row) => [row.original.name, row.original.description]))}
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
									handleExportRowsAsPDF(["Intitulé", "Description"], table.getSelectedRowModel().rows.map((row) => [row.original.name, row.original.description]))
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(fetchedBranches.map((row) => ({
									name: row.name,
									description: row.description,
								})))}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								//export all rows, including from the next page, (still respects filtering and sorting)
								onClick={() =>
									handleExportAsCSV(table.getPrePaginationRowModel().rows.map((row) => ({
										name: row.original.name,
										description: row.original.description,
									})))
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter toute les lignes
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(table.getRowModel().rows.map((row) => ({
									name: row.original.name,
									description: row.original.description,
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
									handleExportAsCSV(table.getSelectedRowModel().rows.map((row) => ({
										name: row.original.name,
										description: row.original.description,
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
			isSaving: isCreatingBranch || isUpdatingBranch || isDeletingBranch,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateBranch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (branch: Branch) => {
			const response = await fetch(
				innerUrl("/api/branches/create"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(branch),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de la filière");
			}

			notifications.show({
				color: "teal",
				title: "Filière créee",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newBranchInfo: Branch) => {
			queryClient.setQueryData(["branches"], (prevBranches: any) => {
				const branchList = Array.isArray(prevBranches) ? prevBranches : [];
				return [
					...branchList,
					{
						...newBranchInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as Branch[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["branches"] });
		},
	});
}

function useUpdateBranch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (branch: Branch) => {
			const response = await fetch(
				innerUrl(`/api/branches/${branch.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(branch),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de la filière");
			}

			notifications.show({
				color: "green",
				title: "Filière mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newBranchInfo: Branch) => {
			queryClient.setQueryData(["branches"], (prevBranches: any) => {
				const branchList = Array.isArray(prevBranches) ? prevBranches : [];

				return branchList.map((branch: Branch) =>
					branch.id === newBranchInfo.id
						? { ...branch, ...newBranchInfo }
						: branch,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["branches"] });
		},
	});
}

function useDeleteBranch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (branchId: string) => {
			const response = await fetch(
				innerUrl(`/api/branches/${branchId}/delete`),
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: branchId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression du rôle");
			}

			notifications.show({
				color: "red",
				title: "Filière supprimée",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (branchId: string) => {
			queryClient.cancelQueries({ queryKey: ["branches"] });

			const previousBranches = queryClient.getQueryData(["branches"]);

			queryClient.setQueryData(
				["branches"],
				(prevBranches: any | undefined) => {
					return prevBranches?.data?.filter(
						(branch: Branch) => branch.id !== branchId,
					);
				},
			);

			return { previousBranches };
		},
		onError: (err, branchId, context: any) => {
			if (context?.previousBranches) {
				queryClient.setQueryData(["branches"], context.previousBranches);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["branches"] });
		},
	});
}

const queryClient = new QueryClient();

type BranchProps = {
	authorizations: String[];
};

const BranchTable = ({ authorizations }: BranchProps) => (
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} />
	</QueryClientProvider>
);

export default BranchTable;

const validateRequired = (value: string) =>
	!!value.length && value.length > 3 && value.length <= 100;
function validateBranch(branch: Branch) {
	return {
		name: !validateRequired(branch.name)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
	};
}
