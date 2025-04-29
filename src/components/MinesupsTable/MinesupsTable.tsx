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
import { Minesup } from "@/types";
import { getInstitutionName, innerUrl } from "@/app/lib/utils";
import { handleExportAsCSV, handleExportRowsAsPDF } from "@/app/lib/utils";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

type MinesupApiResponse = {
	data: Array<Minesup>;
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

const useGetMinesups = () => {
	return useQuery<MinesupApiResponse>({
		queryKey: ["minesups"],
		queryFn: () => fetch(innerUrl("/api/minesups")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	const { authorizations } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	const columns = useMemo<MRT_ColumnDef<Minesup>[]>(
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
					//remove any previous validation errors when minesup focuses on the input
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
					//remove any previous validation errors when minesup focuses on the input
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

	const { data, isError, isFetching, isLoading, refetch } = useGetMinesups();

	const fetchedMinesups = data?.data ?? [];
	console.log("Voici les minesups : ", fetchedMinesups);

	const { mutateAsync: createMinesup, isPending: isCreatingMinesup } =
		useCreateMinesup();
	const { mutateAsync: updateMinesup, isPending: isUpdatingMinesup } =
		useUpdateMinesup();
	const { mutateAsync: deleteMinesup, isPending: isDeletingMinesup } =
		useDeleteMinesup();

	const handleCreateMinesup: MRT_TableOptions<Minesup>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateMinesup(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			console.log("Voici les valeurs : ", values);
			setValidationErrors(values);
			await createMinesup(values);
			exitCreatingMode();
		};

	const handleSaveMinesup: MRT_TableOptions<Minesup>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateMinesup(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			console.log("Voici les valeurs de l'update : ", values);
			await updateMinesup({
				...values,
				id: row.original.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<Minesup>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette Institution Minesup ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteMinesup(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedMinesups,
		createDisplayMode: "row",
		editDisplayMode: "row",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Institutions MinesupsTable",
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
		onCreatingRowSave: handleCreateMinesup,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveMinesup,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-minesups")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvelle Institution Minesup</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer l'Institution Minesup</Title>
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
							Code de l'Institution Minesup :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.code}</span>
						</Text>
						<Text size={"sm"}>
							Intitulé de l'Institution Minesup :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Divider my={10} />
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{authorizations.includes("update-minesups") && (
				<Tooltip label="Editer">
					<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
					</ActionIcon>
				</Tooltip>
				)}
				{authorizations.includes("delete-minesups") && (
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
					{/*{minesups.includes("create-minesups") && (*/}
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Institution Minesup
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
								onClick={() => handleExportAsCSV(fetchedMinesups.map(row => ({
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
			isSaving: isCreatingMinesup || isUpdatingMinesup || isDeletingMinesup,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateMinesup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (minesup: Minesup) => {
			const response = await fetch(
				innerUrl("/api/minesups/create"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(minesup),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'Institution Minesup");
			}

			notifications.show({
				color: "teal",
				title: "Institution Minesup créee",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newMinesupInfo: Minesup) => {
			queryClient.setQueryData(["minesups"], (prevMinesups: any) => {
				const minesupList = Array.isArray(prevMinesups) ? prevMinesups : [];
				return [
					...minesupList,
					{
						...newMinesupInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as Minesup[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["minesups"] });
		},
	});
}

function useUpdateMinesup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (minesup: Minesup) => {
			const response = await fetch(
				innerUrl(`/api/minesups/${minesup.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(minesup),
				},
			);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la mise à jour de l'Institution Minesup",
				);
			}

			notifications.show({
				color: "green",
				title: "Institution Minesup mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newMinesupInfo: Minesup) => {
			queryClient.setQueryData(["minesups"], (prevMinesups: any) => {
				const minesupList = Array.isArray(prevMinesups) ? prevMinesups : [];

				return minesupList.map((minesup: Minesup) =>
					minesup.id === newMinesupInfo.id
						? { ...minesup, ...newMinesupInfo }
						: minesup,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["minesups"] });
		},
	});
}

function useDeleteMinesup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (minesupId: string) => {
			const response = await fetch(
				innerUrl(`/api/minesups/${minesupId}/delete`),
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: minesupId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression du rôle");
			}

			notifications.show({
				color: "red",
				title: "Institution Minesup supprimée",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (minesupId: string) => {
			queryClient.cancelQueries({ queryKey: ["minesups"] });

			const previousMinesups = queryClient.getQueryData(["minesups"]);

			queryClient.setQueryData(
				["minesups"],
				(prevMinesups: any | undefined) => {
					return prevMinesups?.data?.filter(
						(minesup: Minesup) => minesup.id !== minesupId,
					);
				},
			);

			return { previousMinesups };
		},
		onError: (err, minesupId, context: any) => {
			if (context?.previousMinesups) {
				queryClient.setQueryData(["minesups"], context.previousMinesups);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["minesups"] });
		},
	});
}

const queryClient = new QueryClient();

type MinesupProps = {
	authorizations: String[];
};

const MinesupTable = ({ authorizations }: MinesupProps) => (
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} />
	</QueryClientProvider>
);

export default MinesupTable;

const validateRequired = (value: string) =>
	!!value.length && value.length > 3 && value.length <= 100;
function validateMinesup(minesup: Minesup) {
	return {
		code: !validateRequired(minesup.code)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
		name: !validateRequired(minesup.name)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
	};
}
