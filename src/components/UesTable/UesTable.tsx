"use client";

import { useMemo, useState } from "react";
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFiltersState,
	type MRT_SortingState,
	type MRT_ColumnFilterFnsState,
	MRT_EditActionButtons,
	MRT_TableOptions,
	MRT_Row,
} from "mantine-react-table";
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	Menu,
	Stack,
	Text,
	Title,
	Tooltip,
	rem,
} from "@mantine/core";
import {
	IconCalendar,
	IconCheck,
	IconChecks,
	IconClock,
	IconDownload,
	IconEdit,
	IconEye,
	IconFileTypeCsv,
	IconFileTypePdf,
	IconMoodEmpty,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconTableExport,
	IconTrash,
	IconTrashX,
} from "@tabler/icons-react";
import {
	keepPreviousData,
	useQuery,
	useQueryClient,
	useMutation,
} from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useCustomTable } from "@/hooks/use-custom-table";
import { PATH_SECTIONS } from "@/routes";
import { handleExportAsCSV, handleExportRowsAsPDF, innerUrl } from "@/app/lib/utils";

type Ue = {
	id: string;
	name: string;
	slug: string;
	description: string;
	validate?: any;
	author?: {
		user_id: string;
	};
	created?: string;
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
	const { authorizations, filterStatus = "all" } = props;
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
				header: "ID",
				enableEditing: false,
				size: 50,
			},
			{
				accessorKey: "name",
				header: "Intitulé",
				enableEditing: (row: MRT_Row<any>) => row.original.validate !== null,
				size: 150,
				minSize: 120,
				Cell: ({ row }) => (
					<Text fw={500} size="sm">
						{row.original.name}
					</Text>
				),
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.name,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							name: undefined,
						}),
				},
			},
			{
				accessorKey: "description",
				header: "Description",
				size: 300,
				minSize: 200,
				Cell: ({ row }) => (
					<Text size="sm" c="dimmed" lineClamp={2}>
						{row.original.description || "—"}
					</Text>
				),
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.description,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							description: undefined,
						}),
				},
			},
			{
				accessorKey: "created",
				header: "Créée le",
				enableEditing: false,
				size: 110,
				Cell: ({ row }) => {
					const date = row.original.created;
					if (!date) return <Text size="sm" c="dimmed">—</Text>;
					const formatted = new Date(date).toLocaleDateString("fr-FR", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					});
					return (
						<Group gap={4}>
							<IconCalendar size={14} color="gray" />
							<Text size="sm" c="dimmed">{formatted}</Text>
						</Group>
					);
				},
			},
			{
				accessorKey: "validate",
				header: "Statut",
				enableEditing: false,
				size: 100,
				Cell: ({ row }) => (
					<Badge
						variant="light"
						color={row.original.validate === null ? "orange" : "green"}
						size="sm"
						radius="sm"
						leftSection={
							row.original.validate === null ? (
								<IconClock size={12} />
							) : (
								<IconCheck size={12} />
							)
						}
					>
						{row.original.validate === null ? "En attente" : "Validée"}
					</Badge>
				),
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
	const allUes = data?.data ?? [];

	// Apply filter based on filterStatus prop
	const fetchedUes = useMemo(() => {
		if (filterStatus === "validated") {
			return allUes.filter((ue: Ue) => ue.validate !== null);
		}
		if (filterStatus === "pending") {
			return allUes.filter((ue: Ue) => ue.validate === null);
		}
		return allUes;
	}, [allUes, filterStatus]);
	// const totalRowCount = data?.meta?.totalRowCount ?? 0;

	//call CREATE hook
	const { mutateAsync: createUe, isPending: isCreatingUe } = useCreateUe();
	//call UPDATE hook
	const { mutateAsync: updateUe, isPending: isUpdatingUe } = useUpdateUe();
	//call DELETE hook
	const { mutateAsync: deleteUe, isPending: isDeletingUe } = useDeleteUe();
	//call VALIDATE hook
	const { mutateAsync: validateUeAction, isPending: isValidatingUe } = useValidateUe();
	//call BULK VALIDATE hook
	const { mutateAsync: bulkValidateUes, isPending: isBulkValidating } = useBulkValidateUes();
	//call BULK DELETE hook
	const { mutateAsync: bulkDeleteUes, isPending: isBulkDeleting } = useBulkDeleteUes();

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
			slug: row.original.slug,
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
		createDisplayMode: "row",
		editDisplayMode: "row",
		enableRowSelection: true,
		enableColumnOrdering: true,
		enableGlobalFilter: true,
		enableDensityToggle: false,
		enableRowNumbers: false, // Désactive la colonne #
		manualFiltering: false, // Active le filtrage client-side pour la recherche
		onGlobalFilterChange: setGlobalFilter, // Permet à la recherche de fonctionner
		displayColumnDefOptions: {
			"mrt-row-actions": {
				size: 200, // Plus de place pour les boutons explicites
			},
		},
		initialState: {
			columnVisibility: { id: false },
			density: "xs",
		},
		mantineTableBodyRowProps: ({ row }) => ({
			style: {
				backgroundColor: row.original.validate === null
					? "var(--mantine-color-orange-0)"
					: undefined,
				borderLeft: row.original.validate === null
					? "3px solid var(--mantine-color-orange-5)"
					: "3px solid transparent",
			},
		}),
		mantineSearchTextInputProps: {
			placeholder: "Rechercher par nom ou description...",
			leftSection: <IconSearch size={16} />,
		},
		renderEmptyRowsFallback: () => (
			<Stack align="center" justify="center" py={40} gap="md">
				<IconMoodEmpty size={48} color="gray" stroke={1.5} />
				<Text size="lg" fw={500} c="dimmed">
					Aucune UE trouvée
				</Text>
				<Text size="sm" c="dimmed" ta="center" maw={300}>
					{filterStatus === "validated"
						? "Aucune UE validée pour le moment"
						: filterStatus === "pending"
						? "Aucune UE en attente de validation"
						: "Commencez par créer une nouvelle unité d'enseignement"}
				</Text>
			</Stack>
		),
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

		renderRowActions: ({ row, table }) => (
			<Flex gap="xs">
				{/* Bouton Valider - visible uniquement si l'UE n'est pas validée */}
				{authorizations.includes("validate-ues") && row.original.validate == null && (
					<Button
						size="compact-xs"
						color="green"
						variant="light"
						leftSection={<IconCheck size={14} />}
						loading={isValidatingUe}
						onClick={() => validateUeAction(row.original.id)}
					>
						Valider
					</Button>
				)}
				{/* Bouton Editer - visible uniquement si l'UE est validée */}
				{authorizations.includes("update-ues") && row.original.validate != null && (
					<Button
						size="compact-xs"
						color="blue"
						variant="light"
						leftSection={<IconEdit size={14} />}
						onClick={() => table.setEditingRow(row)}
					>
						Éditer
					</Button>
				)}
				{authorizations.includes("delete-ues") && (
					<Tooltip label="Supprimer">
						<ActionIcon color="red" variant="light" onClick={() => openDeleteConfirmModal(row)}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</Flex>
		),

		renderTopToolbarCustomActions: ({ table }) => {
			// Get selected rows info for bulk actions
			const selectedRows = table.getSelectedRowModel().rows;
			const hasSelection = selectedRows.length > 0;
			const unvalidatedSelected = selectedRows.filter(
				(row) => row.original.validate === null
			);
			const hasUnvalidatedSelection = unvalidatedSelected.length > 0;

			// Bulk validate handler
			const handleBulkValidate = () => {
				const ids = unvalidatedSelected.map((row) => row.original.id);
				modals.openConfirmModal({
					title: "Valider les UEs sélectionnées",
					children: (
						<Text>
							Êtes-vous sûr de vouloir valider {unvalidatedSelected.length} UE(s) ?
							Cette action validera uniquement les UEs en attente.
						</Text>
					),
					labels: { confirm: "Valider", cancel: "Annuler" },
					confirmProps: { color: "green" },
					onConfirm: async () => {
						await bulkValidateUes(ids);
						table.resetRowSelection();
					},
				});
			};

			// Bulk delete handler
			const handleBulkDelete = () => {
				const ids = selectedRows.map((row) => row.original.id);
				modals.openConfirmModal({
					title: "Supprimer les UEs sélectionnées",
					children: (
						<Text>
							Êtes-vous sûr de vouloir supprimer {selectedRows.length} UE(s) ?
							Cette action est irréversible.
						</Text>
					),
					labels: { confirm: "Supprimer", cancel: "Annuler" },
					confirmProps: { color: "red" },
					onConfirm: async () => {
						await bulkDeleteUes(ids);
						table.resetRowSelection();
					},
				});
			};

			return (
			<>
				<Flex gap={4} justify={"flex-end"} align={"center"} wrap="wrap">
					{/* Bulk Actions - only show when rows are selected */}
					{hasSelection && (
						<Group gap="xs">
							{/* Bulk Validate - only for unvalidated UEs */}
							{hasUnvalidatedSelection && authorizations.includes("validate-ues") && (
								<Button
									color="green"
									variant="light"
									leftSection={<IconChecks size={18} />}
									onClick={handleBulkValidate}
									loading={isBulkValidating}
								>
									Valider ({unvalidatedSelected.length})
								</Button>
							)}
							{/* Bulk Delete */}
							{authorizations.includes("delete-ues") && (
								<Button
									color="red"
									variant="light"
									leftSection={<IconTrashX size={18} />}
									onClick={handleBulkDelete}
									loading={isBulkDeleting}
								>
									Supprimer ({selectedRows.length})
								</Button>
							)}
							<Divider orientation="vertical" />
						</Group>
					)}

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
		);
		},
		state: {
			columnFilterFns,
			columnFilters,
			globalFilter,
			// pagination,
			isLoading: isLoading,
			isSaving: isCreatingUe || isUpdatingUe || isDeletingUe || isBulkValidating || isBulkDeleting,
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

//VALIDATE hook (validate ue in api)
function useValidateUe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ueId: string) => {
			console.log(`[UE Validate] Début validation UE ${ueId}`);

			const response = await fetch(
				innerUrl(`/api/ues/${ueId}/validate`),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			console.log(`[UE Validate] Réponse status: ${response.status}`);

			// Succès sans contenu (204)
			if (response.status === 204) {
				notifications.show({
					color: "green",
					title: "Unité d'enseignement validée",
					message: "L'UE a été validée avec succès",
					icon: <IconCheck />,
					loading: false,
					autoClose: 2000,
				});
				return { success: true };
			}

			// Gestion des erreurs avec message détaillé
			if (!response.ok) {
				let errorMessage = `Erreur ${response.status}`;
				let errorDetails = null;

				try {
					errorDetails = await response.json();
					errorMessage = errorDetails.message || errorDetails.error || errorDetails.details || errorMessage;
				} catch {
					// Pas de JSON dans la réponse
				}

				console.error("[UE Validate] Erreur complète:", {
					status: response.status,
					statusText: response.statusText,
					details: errorDetails,
				});

				notifications.show({
					color: "red",
					title: "Erreur de validation",
					message: errorMessage,
					autoClose: 5000,
				});

				throw new Error(errorMessage);
			}

			// Succès avec contenu
			notifications.show({
				color: "green",
				title: "Unité d'enseignement validée",
				message: "L'UE a été validée avec succès",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});

			return response.json().catch(() => ({ success: true }));
		},
		onError: (error) => {
			console.error("[UE Validate] Mutation error:", error);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

//BULK VALIDATE hook (validate multiple ues in api)
function useBulkValidateUes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ids: string[]) => {
			const response = await fetch(
				innerUrl("/api/ues/bulk-validate"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ids }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la validation des UEs");
			}

			const data = await response.json();

			notifications.show({
				color: "green",
				title: "Validation groupée réussie",
				message: data.message || `${ids.length} UE(s) validée(s)`,
				icon: <IconChecks />,
				loading: false,
				autoClose: 3000,
			});

			return data;
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

//BULK DELETE hook (delete multiple ues in api)
function useBulkDeleteUes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ids: string[]) => {
			const response = await fetch(
				innerUrl("/api/ues/bulk-delete"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ids }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression des UEs");
			}

			const data = await response.json();

			notifications.show({
				color: "red",
				title: "Suppression groupée réussie",
				message: data.message || `${ids.length} UE(s) supprimée(s)`,
				icon: <IconTrashX />,
				loading: false,
				autoClose: 3000,
			});

			return data;
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ues"] });
		},
	});
}

type UeProps = {
	authorizations: String[];
	filterStatus?: string;
};

const UeTable = ({ authorizations, filterStatus }: UeProps) => (
	<Section authorizations={authorizations} filterStatus={filterStatus} />
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
