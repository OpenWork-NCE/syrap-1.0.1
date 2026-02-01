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
import { useCustomTable } from "@/hooks/use-custom-table";
import {
	ActionIcon,
	Box,
	Button,
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
	keepPreviousData,
	useQuery,
	useQueryClient,
	useMutation,
} from "@tanstack/react-query";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Localization, University } from "@/types";
import { PATH_SECTIONS } from "@/routes";
import { useRouter } from "next/navigation";
import { handleExportAsCSV, handleExportRowsAsPDF, innerUrl } from "@/app/lib/utils";

type LocalizationApiResponse = {
	data: Array<Localization>;
	messages: Array<string>;
	success: string;
};

type UniversityApiResponse = {
	data: Array<University>;
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
//custom react-query hook
const useGetUniversities = ({}: Params) => {
	return useQuery<UniversityApiResponse>({
		queryKey: ["universities"],
		queryFn: () => fetch(innerUrl("/api/universities")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetLocalizations = () => {
	return useQuery<LocalizationApiResponse>({
		queryKey: ["localizations"],
		queryFn: () => fetch(innerUrl("/api/localizations")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	// Ensure safe default values for props to prevent null errors
	const authorizations = Array.isArray(props.authorizations) ? props.authorizations : [];
	const institution = props.institution ?? { id: "", name: "", slug: "", model: "" };
	const user = props.user ?? { id: "", name: "", email: "" };

	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});
	const { push } = useRouter();

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetLocalizations();

	const fetchedLocalizations = lData?.data ?? [];

	const columns = useMemo<MRT_ColumnDef<University>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Université",
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
			// {
			//   accessorKey: 'ipes_count',
			//   header: 'Nbre IPES sous tutelle',
			//   Edit: () => null,
			//   enableHiding: true,
			// },
			{
				accessorKey: "phone",
				header: "Téléphone",
				enableHiding: true,
				Cell: ({ cell }) => {
					const value = cell.getValue<string>();
					return value ? value : <Text c="dimmed" size="sm">-</Text>;
				},
				mantineEditTextInputProps: {
					type: "tel",
					error: validationErrors?.phone,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							phone: undefined,
						}),
				},
			},
			{
				accessorKey: "email",
				header: "Email",
				Cell: ({ cell }) => {
					const value = cell.getValue<string>();
					return value ? value : <Text c="dimmed" size="sm">-</Text>;
				},
				mantineEditTextInputProps: {
					type: "email",
					error: validationErrors?.email,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							email: undefined,
						}),
				},
			},
			{
				accessorKey: "arrondissement_id",
				accessorFn: (row) =>
					fetchedLocalizations.find(
						(localisation) =>
							String(localisation.id) == String(row?.arrondissement?.id),
					)?.name ?? "-",
				header: "Localisation",
				editVariant: "select",
				mantineEditSelectProps: ({ row }) => ({
					data: fetchedLocalizations.map((localization) => ({
						value: String(localization.id),
						label: localization.name,
					})),
					required: true,
					error: validationErrors?.arrondissement_id,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							arrondissement_id: undefined,
						}),
				}),
			},
		],
		[validationErrors, fetchedLocalizations],
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

	const { data, isError, isFetching, isLoading, refetch } = useGetUniversities({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	const fetchedUniversities = data?.data ?? [];

	const { mutateAsync: createUniversity, isPending: isCreatingUniversity } =
		useCreateUniversity();
	const { mutateAsync: updateUniversity, isPending: isUpdatingUniversity } =
		useUpdateUniversity();
	const { mutateAsync: deleteUniversity, isPending: isDeletingUniversity } =
		useDeleteUniversity();

	const handleCreateUniversity: MRT_TableOptions<University>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateUniversity(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			await createUniversity({
				...values,
				user_id: String(user.id),
			});
			exitCreatingMode();
		};

	const handleSaveUniversity: MRT_TableOptions<University>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateUniversity(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			await updateUniversity({
				...values,
				id: row.original.id,
				user_id: String(user.id),
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<University>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cet Université ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteUniversity(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedUniversities,
		createDisplayMode: "modal",
		editDisplayMode: "modal",
		enableRowNumbers: false,
		manualFiltering: false, // Filtrage client-side pour recherche instantanée
		onGlobalFilterChange: setGlobalFilter,
		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Universités",
		},
		getRowId: (row) => row.id,
		initialState: {
			density: "xs", // Tableau compact
		},
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
		mantineTableBodyCellProps: {
			style: {
				padding: "8px 12px",
			},
		},
		mantineTableHeadCellProps: {
			style: {
				padding: "10px 12px",
			},
		},
		mantineCreateRowModalProps: {
			centered: true,
		},
		mantineEditRowModalProps: {
			centered: true,
		},
		onCreatingRowCancel: () => setValidationErrors({}),
		onCreatingRowSave: handleCreateUniversity,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveUniversity,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations?.includes("create-universities")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvelle Université</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer l''Université'</Title>
				{internalEditComponents}
				<Flex justify="flex-end" mt="xl">
					<MRT_EditActionButtons variant="text" table={table} row={row} />
				</Flex>
			</Stack>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md" align="center">
				<Button
					variant="light"
					size="compact-sm"
					leftSection={<IconEye size={16} />}
					onClick={() => {
						push(
							PATH_SECTIONS.universities.university_details(
								row.original.id,
							),
						);
					}}
				>
					Détails
				</Button>
				{authorizations?.includes("update-universities") && (
					<Tooltip label="Editer">
						<ActionIcon
							color={"green"}
							onClick={() => table.setEditingRow(row)}
						>
							<IconEdit />
						</ActionIcon>
					</Tooltip>
				)}
				{authorizations?.includes("delete-universities") && (
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
					{authorizations?.includes("create-universities") && (
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Université
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
									handleExportRowsAsPDF(["name", "phone", "email", "localisation"], table.getPrePaginationRowModel().rows.map(row => [row.original.name, row.original.phone, row.original.email, row.original.arrondissement?.name || ""]))
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() => handleExportRowsAsPDF(["name", "phone", "email", "localisation"], table.getRowModel().rows.map(row => [row.original.name, row.original.phone, row.original.email, row.original.arrondissement?.name || ""]))}
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
									handleExportRowsAsPDF(["name", "phone", "email", "localisation"], table.getSelectedRowModel().rows.map(row => [row.original.name, row.original.phone, row.original.email, row.original.arrondissement?.name || ""]))
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(fetchedUniversities.map(row => ({
									name: row.name,
									phone: row.phone,
									email: row.email,
									localisation: row.arrondissement?.name || "",
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
										phone: row.original.phone,
										email: row.original.email,
										localisation: row.original.arrondissement?.name || "",
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
									phone: row.original.phone,
									email: row.original.email,
									localisation: row.original.arrondissement?.name || "",
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
										phone: row.original.phone,
										email: row.original.email,
										localisation: row.original.arrondissement?.name || "",
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
			isSaving:
				isCreatingUniversity || isUpdatingUniversity || isDeletingUniversity,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateUniversity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (university: University) => {
			const response = await fetch(
				innerUrl("/api/universities/create"),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(university),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'Université");
			}

			notifications.show({
				color: "teal",
				title: "Université créé",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newUniversityInfo: University) => {
			queryClient.setQueryData(["universities"], (prevUniversities: any) => {
				const universityList = Array.isArray(prevUniversities)
					? prevUniversities
					: [];
				return [
					...universityList,
					{
						...newUniversityInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as University[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["universities"] });
		},
	});
}

function useUpdateUniversity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (university: University) => {
			const response = await fetch(
				innerUrl(`/api/universities/${university.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(university),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de l'Université");
			}

			notifications.show({
				color: "green",
				title: "Université mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newUniversityInfo: University) => {
			queryClient.setQueryData(["universities"], (prevUniversities: any) => {
				const universityList = Array.isArray(prevUniversities)
					? prevUniversities
					: [];

				return universityList.map((university: University) =>
					university.id === newUniversityInfo.id
						? { ...university, ...newUniversityInfo }
						: university,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["universities"] });
		},
	});
}

function useDeleteUniversity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (universityId: string) => {
			const response = await fetch(
				innerUrl(`/api/universities/${universityId}/delete`),
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: universityId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression de l'Université");
			}

			notifications.show({
				color: "red",
				title: "Université supprimé",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (universityId: string) => {
			queryClient.cancelQueries({ queryKey: ["universities"] });

			const previousUniversities = queryClient.getQueryData(["universities"]);

			queryClient.setQueryData(
				["universities"],
				(prevUniversities: any | undefined) => {
					return prevUniversities?.data?.filter(
						(university: University) => university.id !== universityId,
					);
				},
			);

			return { previousUniversities };
		},
		onError: (err, universityId, context: any) => {
			if (context?.previousUniversityes) {
				queryClient.setQueryData(
					["universities"],
					context.previousUniversityes,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["universities"] });
		},
	});
}

type UniversityProps = {
	authorizations: String[];
	institution: {
		id: string | number | null;
		name: string | null;
		slug: string | null;
		type: string | null;
	} | null;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
};

const UniversityTable = ({
	authorizations,
	institution,
	user,
}: UniversityProps) => (
	<Section
		authorizations={authorizations}
		institution={institution}
		user={user}
	/>
);

export default UniversityTable;

const validateRequired = (value: string | undefined | null) => !!value && value.length > 0;

function validateUniversity(university: any) {
	return {
		name: !validateRequired(university.name)
			? "L'intitulé de l'Université est requis"
			: "",
		arrondissement_id: !university.arrondissement_id
			? "La localisation est requise"
			: "",
	};
}
