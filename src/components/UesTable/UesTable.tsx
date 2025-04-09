"use client";

import { useMemo, useState } from "react";
import {
	MantineReactTable,
	useMantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFiltersState,
	// type MRT_PaginationState,
	type MRT_SortingState,
	type MRT_ColumnFilterFnsState,
	MRT_EditActionButtons,
	MRT_TableOptions,
	MRT_Row,
} from "mantine-react-table";
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
import { useCustomTable } from "@/hooks/use-custom-table";
import { PATH_SECTIONS } from "@/routes";
import { handleExportAsCSV, handleExportRowsAsPDF, innerUrl } from "@/app/lib/utils";

type Ue = {
	id: string;
	name: string;
	description: string;
	validate?: string;
	author?: {
		user_id: string;
	};
};

type UeApiResponse = {
	data: Array<Ue>;
};

interface Params {
	columnFilterFns: MRT_ColumnFilterFnsState;
	columnFilters: MRT_ColumnFiltersState;
	globalFilter: string;
	sorting: MRT_SortingState;
	// pagination: MRT_PaginationState;
}

const Section = (props: any) => {
	const { authorizations } = props;
	// console.log("UesAuthorizations : ", authorizations);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	//custom react-query hook
	const useGetUes = ({
		columnFilterFns,
		columnFilters,
		globalFilter,
		sorting,
		// pagination,
	}: Params) => {
		const select = !authorizations.includes("validate-ues")
			? (data: UeApiResponse) => {
					const filteredData = data.data.filter(
						(ue: Ue) => ue.validate !== null,
					);
					return { data: filteredData } as UeApiResponse;
				}
			: undefined;

		return useQuery<UeApiResponse>({
			// queryKey: ['ues', fetchURL.href], //refetch whenever the URL changes (columnFilters, globalFilter, sorting, pagination),
			queryKey: ["ues"], //refetch whenever the URL changes (columnFilters, globalFilter, sorting, pagination)
			queryFn: () => fetch(innerUrl("/api/ues")).then((res) => res.json()),
			select,
			placeholderData: keepPreviousData, //useful for paginated queries by keeping data from previous pages on screen while fetching the next page
			staleTime: 30_000, //don't refetch previously viewed pages until cache is more than 30 seconds old
		});
	};

	const columns = useMemo<MRT_ColumnDef<Ue>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "name",
				header: "Nom",
				enableEditing: (row: MRT_Row<any>) => row.original.validate !== null,
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.name,
					//remove any previous validation errors when user focuses on the input
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
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							description: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
				},
			},
			{
				accessorKey: "validate",
				header: "Status de Validation",
				enableEditing: false,
				accessorFn: (row: any) =>
					row.validate === null ? "Non encore validé" : "Validé",
			},
		],
		[validationErrors],
	);

	//Manage MRT state that we want to pass to our API
	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
		[],
	);
	const [columnFilterFns, setColumnFilterFns] = //filter modes
		useState<MRT_ColumnFilterFnsState>(
			Object.fromEntries(
				columns.map(({ accessorKey }) => [accessorKey, "contains"]),
			),
		); //default to "contains" for all columns
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	// const [pagination, setPagination] = useState<MRT_PaginationState>({
	// 	pageIndex: 0,
	// 	pageSize: 10,
	// });

	//call our custom react-query hook
	const { data, isError, isFetching, isLoading, refetch } = useGetUes({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	//this will depend on your API response shape
	// const fetchedUes = authorizations.includes("validate-ues")
	// 	? (data?.data ?? [])
	// 	: (data?.data?.filter((data) => data.validate == null) ?? []);
	const fetchedUes = data?.data ?? [];
	// const fetchedUes =
	// 	authorizations.length !== 0 && data?.data
	// 		? authorizations.includes("validate-ues")
	// 			? data?.data
	// 			: data?.data?.filter((data) => data.validate !== null)
	// 		: (data?.data ?? []);
	console.log("Voici les ues : ", fetchedUes);

	// const totalRowCount = data?.meta?.totalRowCount ?? 0;

	//call CREATE hook
	const { mutateAsync: createUe, isPending: isCreatingUe } = useCreateUe();
	//call UPDATE hook
	const { mutateAsync: updateUe, isPending: isUpdatingUe } = useUpdateUe();
	//call DELETE hook
	const { mutateAsync: deleteUe, isPending: isDeletingUe } = useDeleteUe();

	//CREATE action
	const handleCreateUe: MRT_TableOptions<Ue>["onCreatingRowSave"] = async ({
		values,
		exitCreatingMode,
	}) => {
		const newValidationErrors = validateUe(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors({});
		await createUe(values);
		exitCreatingMode();
	};

	//UPDATE action
	const handleSaveUe: MRT_TableOptions<Ue>["onEditingRowSave"] = async ({
		values,
		table,
		row,
	}) => {
		const newValidationErrors = validateUe(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors({});
		await updateUe({
			id: row.id,
			name: values.name,
			description: values.description,
		});
		table.setEditingRow(null); //exit editing mode
	};

	//DELETE action
	const openDeleteConfirmModal = (row: MRT_Row<Ue>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette UE ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteUe(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedUes,
		createDisplayMode: "row", //default ('row', and 'custom' are also available)
		editDisplayMode: "row", //default ('row', 'cell', 'table', and 'custom' are also available)
		mantineTableBodyRowProps: ({ row }) => ({
			style: {
				// Type-safe access to row.original with Person interface
				backgroundColor: row.original.validate === null ? "#cecece" : undefined,
			},
		}),

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des UEs",
		},
		// renderTopToolbarCustomActions: ({ table }) => (
		//
		// ),
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
		onCreatingRowSave: handleCreateUe,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveUe,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>
					{authorizations?.includes("create-ues")
						? "Nouvelle UE"
						: "Requette création UE"}
				</Title>
				{internalEditComponents}
				<Flex justify="flex-end" mt="xl">
					<MRT_EditActionButtons variant="text" table={table} row={row} />
				</Flex>
			</Stack>
		),
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>
					{row.original.validate == null ? "Valider l'UE" : "Editer l'UE"}
				</Title>
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
							Intitulé de l'UE :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Text size={"sm"}>
							Description :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.description}
							</span>
						</Text>
						<Text size={"sm"}>
							Validé ? :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.validate == null ? "Non" : "Oui"}
							</span>
						</Text>
						{/*<Divider my={10} />*/}
						{/*{row.original.validate == null && (*/}
						{/*	<Button*/}
						{/*		variant={"outline"}*/}
						{/*		leftSection={<IconCheck />}*/}
						{/*		onClick={() => {}}*/}
						{/*	>*/}
						{/*		Valider*/}
						{/*	</Button>*/}
						{/*)}*/}
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{authorizations.includes("update-ues") && (
					<Tooltip label={row.original.validate == null ? "Valider" : "Editer"}>
						<ActionIcon
							color={"green"}
							onClick={() => table.setEditingRow(row)}
						>
							{row.original.validate == null ? <IconCheck /> : <IconEdit />}
						</ActionIcon>
					</Tooltip>
				)}
				{authorizations.includes("delete-ues") && (
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
					<Button
						onClick={() => {
							table.setCreatingRow(true); //simplest way to open the create row modal with no default values
							//or you can pass in a row object to set default values with the `createRow` helper function
							// table.setCreatingRow(
							//   createRow(table, {
							//     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
							//   }),
							// );
						}}
						leftSection={<IconPlus />}
					>
						{authorizations.includes("validate-ues")
							? "Nouvelle UE"
							: "Requette création UE"}
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
									handleExportRowsAsPDF(
										["Intitulé", "Description"],
										table
											.getPrePaginationRowModel()
											.rows.map((row) => [
												row.original.name,
												row.original.description,
											]),
									)
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() =>
									handleExportRowsAsPDF(
										["Intitulé", "Description"],
										table
											.getRowModel()
											.rows.map((row) => [
												row.original.name,
												row.original.description,
											]),
									)
								}
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
									handleExportRowsAsPDF(
										["Intitulé", "Description"],
										table
											.getSelectedRowModel()
											.rows.map((row) => [
												row.original.name,
												row.original.description,
											]),
									)
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={() =>
									handleExportAsCSV(
										fetchedUes.map((row) => ({
											name: row.name,
											description: row.description,
										})),
									)
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								//export all rows, including from the next page, (still respects filtering and sorting)
								onClick={() =>
									handleExportAsCSV(
										table.getPrePaginationRowModel().rows.map((row) => ({
											name: row.original.name,
											description: row.original.description,
										})),
									)
								}
								leftSection={<IconFileTypeCsv />}
							>
								Exporter toute les lignes
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								onClick={() =>
									handleExportAsCSV(
										table.getRowModel().rows.map((row) => ({
											name: row.original.name,
											description: row.original.description,
										})),
									)
								}
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
									handleExportAsCSV(
										table.getSelectedRowModel().rows.map((row) => ({
											name: row.original.name,
											description: row.original.description,
										})),
									)
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
			isSaving: isCreatingUe || isUpdatingUe || isDeletingUe,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

//CREATE hook (post new ue to api)
function useCreateUe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ue: Ue) => {
			// Envoie de la requête API pour créer une nouvelle uee
			const response = await fetch(innerUrl("/api/ues/create"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(ue), // Envoyer les informations de la nouvelle uee au serveur
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'UE");
			}

			notifications.show({
				color: "teal",
				title: "Unité d'enseignement créee",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			// Retourner la réponse du serveur (optionnel)
			return await response.json();
		},
		//client side optimistic update
		onMutate: (newUeInfo: Ue) => {
			queryClient.setQueryData(["ues"], (prevUes: any) => {
				// Vérifier si prevUes est un tableau, sinon, initialisez-le comme un tableau vide
				const ueList = Array.isArray(prevUes) ? prevUes : [];
				return [
					...ueList,
					{
						...newUeInfo,
						id: (Math.random() + 1).toString(36).substring(7), // Créer un ID temporaire
					},
				] as Ue[];
			});
		},
		// Rafraîchissement des données après la mutation
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

//UPDATE hook (put ue in api)
function useUpdateUe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ue: Ue) => {
			// Envoie de la requête API pour mettre a jour une nouvelle uee
			const response = await fetch(
				innerUrl(`/api/ues/${ue.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(ue), // Envoyer les informations pour la modification de la uee
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de l'UE");
			}

			notifications.show({
				color: "green",
				title: "Unité d'enseignement mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			// Retourner la réponse du serveur (optionnel)
			return await response.json();
		},
		//client side optimistic update
		onMutate: (newUeInfo: Ue) => {
			queryClient.setQueryData(["ues"], (prevUes: any) => {
				const ueList = Array.isArray(prevUes) ? prevUes : [];

				return ueList.map((ue: Ue) =>
					ue.id === newUeInfo.id ? { ...ue, ...newUeInfo } : ue,
				);
			});
		},
		// Invalider le cache après la mutation pour obtenir les données actualisées
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

//DELETE hook (delete ue in api)
function useDeleteUe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ueId: string) => {
			// Envoi de la requête API pour supprimer la uee
			const response = await fetch(
				innerUrl(`/api/ues/${ueId}/delete`),
				{
					method: "DELETE", // DELETE pour signifier la suppression
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: ueId }), // Envoyer l'ID de la uee à supprimer
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression de l'UE");
			}

			notifications.show({
				color: "red",
				title: "Unité d'enseignement supprimée",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			// Retourner une confirmation (optionnel)
			return await response.json();
		},
		// Mise à jour optimiste côté client
		onMutate: (ueId: string) => {
			// Annuler toute requête en cours pour ne pas avoir des données en conflit
			queryClient.cancelQueries({ queryKey: ["ues"] });

			// Sauvegarder les données actuelles dans le cache pour un rollback éventuel
			const previousUees = queryClient.getQueryData(["ues"]);

			// Optimistiquement mettre à jour le cache
			queryClient.setQueryData(["ues"], (prevUees: any | undefined) => {
				return prevUees?.data?.filter((ue: Ue) => ue.id !== ueId);
			});

			// Retourner un contexte de rollback au cas où on aurait besoin d'annuler cette opération
			return { previousUees };
		},
		// Si la mutation échoue, restaurer les données précédentes
		onError: (err, ueId, context: any) => {
			if (context?.previousUees) {
				queryClient.setQueryData(["ues"], context.previousUees);
			}
		},
		// Rafraîchir les données après la suppression réussie
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

const queryClient = new QueryClient();

type UeProps = {
	authorizations: String[];
};

const UeTable = ({ authorizations }: UeProps) => (
	//Put this with your other react-query providers near root of your app
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} />
	</QueryClientProvider>
);

export default UeTable;

const validateRequired = (value: string) => !!value.length;
const validateNumberRequired = (value: number) => !!value;

function validateUe(ue: Ue) {
	return {
		// id: !validateNumberRequired(Number(ue.id)),
		name: !validateRequired(ue.name) ? "L'intitulé de l'UE est requise" : "",
		// description: !validateRequired(ue.description)
		//   ? "La description de l'UE est requise"
		//   : '',
	};
}
