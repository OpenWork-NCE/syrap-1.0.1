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
	Button,
	Flex,
	Menu,
	Modal,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconCheck,
	IconDoor,
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
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Localization, Ipes, University } from "@/types";
import { PATH_SECTIONS } from "@/routes";
import { useRouter } from "next/navigation";
import { handleExportAsCSV, handleExportRowsAsPDF, innerUrl } from "@/app/lib/utils";
import ClassroomsTable from "@/components/ClassroomsTable/ClassroomsTable";

type LocalizationApiResponse = {
	data: Array<Localization>;
	messages: Array<string>;
	success: string;
};

type IpesApiResponse = {
	data: Array<Ipes>;
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

const useGetUniversities = () => {
	return useQuery<UniversityApiResponse>({
		queryKey: ["universities"],
		queryFn: () => fetch(innerUrl("/api/universities")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

//custom react-query hook
const useGetIpess = ({}: Params) => {
	return useQuery<IpesApiResponse>({
		queryKey: ["ipes"],
		queryFn: () => fetch(innerUrl("/api/ipes")).then((res) => res.json()),
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
	const { authorizations, institution, user } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});
	const { push } = useRouter();
	const [sallesOpened, { open: openSalles, close: closeSalles }] =
		useDisclosure(false);
	const [selectedIpes, setSelectedIpes] = useState<Ipes | null>(null);

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetLocalizations();

	const fetchedLocalizations = lData?.data ?? [];

	const {
		data: uData,
		isError: uIsError,
		isFetching: uIsFetching,
		isLoading: uIsLoading,
		refetch: uRefresh,
	} = useGetUniversities();

	const fetchedUniversities = uData?.data ?? [];

	const columns = useMemo<MRT_ColumnDef<Ipes>[]>(
		() => [
			{
				accessorKey: "code",
				header: "Sigle",
				size: 80,
				maxSize: 100,
				Cell: ({ cell }) => {
					const value = cell.getValue<string>();
					return value ? value : <Text c="dimmed" size="sm">-</Text>;
				},
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.code,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							code: undefined,
						}),
				},
			},
			{
				accessorKey: "name",
				header: "Intitulé de l'Ipes",
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
				accessorKey: "phone",
				header: "Téléphone",
				size: 120,
				enableHiding: true,
				Cell: ({ cell }) => {
					const value = cell.getValue<string>();
					return value ? value : <Text c="dimmed" size="sm">-</Text>;
				},
				mantineEditTextInputProps: {
					type: "tel",
					error: validationErrors?.phone,
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
				size: 150,
				Cell: ({ cell }) => {
					const value = cell.getValue<string>();
					return value ? value : <Text c="dimmed" size="sm">-</Text>;
				},
				mantineEditTextInputProps: {
					type: "email",
					error: validationErrors?.email,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							email: undefined,
						}),
				},
			},
			{
				accessorKey: "arrondissement_id",
				header: "Localisation",
				size: 100,
				Cell: ({ row }) => {
					const localization = fetchedLocalizations.find(
						(loc) => String(loc.id) === String(row.original.arrondissement_id),
					);
					return localization?.name ?? "-";
				},
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedLocalizations.map((localization) => ({
						value: String(localization.id),
						label: localization.name,
					})),
					required: true,
					error: validationErrors?.arrondissement_id,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							arrondissement_id: undefined,
						}),
				},
			},
			{
				accessorKey: "university_id",
				header: "Univ. Tutelle",
				size: 130,
				Cell: ({ row }) => {
					const university = fetchedUniversities.find(
						(u) => String(u.id) === String(row.original.university_id),
					);
					return university?.name ?? "-";
				},
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedUniversities.map((university) => ({
						value: String(university.id),
						label: university.name,
					})),
					required: true,
					error: validationErrors?.university_id,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							university_id: undefined,
						}),
				},
			},
			// Colonnes masquées dans le tableau mais présentes dans le formulaire d'édition
			{
				accessorKey: "arrete_ouverture",
				header: "Arreté d'Ouverture",
				enableHiding: true,
				mantineEditTextInputProps: {
					type: "text",
					error: validationErrors?.arrete_ouverture,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							arrete_ouverture: undefined,
						}),
				},
			},
			{
				accessorKey: "decret_creation",
				header: "Decret de création",
				enableHiding: true,
				mantineEditTextInputProps: {
					type: "text",
					error: validationErrors?.decret_creation,
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							decret_creation: undefined,
						}),
				},
			},
		],
		[validationErrors, fetchedLocalizations, fetchedUniversities],
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

	const { data, isError, isFetching, isLoading, refetch } = useGetIpess({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	const fetchedIpess = data?.data ?? [];

	const { mutateAsync: createIpes, isPending: isCreatingIpes } =
		useCreateIpes();
	const { mutateAsync: updateIpes, isPending: isUpdatingIpes } =
		useUpdateIpes();
	const { mutateAsync: deleteIpes, isPending: isDeletingIpes } =
		useDeleteIpes();

	const handleCreateIpes: MRT_TableOptions<Ipes>["onCreatingRowSave"] = async ({
		values,
		exitCreatingMode,
	}) => {
		const newValidationErrors = validateIpes(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors(values);
		await createIpes({
			...values,
			user_id: String(user.id),
		});
		exitCreatingMode();
	};

	const handleSaveIpes: MRT_TableOptions<Ipes>["onEditingRowSave"] = async ({
		values,
		table,
		row,
	}) => {
		const newValidationErrors = validateIpes(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors(values);
		await updateIpes({
			...values,
			id: row.original.id,
			user_id: String(user.id),
		});
		table.setEditingRow(null);
	};

	const openDeleteConfirmModal = (row: MRT_Row<Ipes>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cet Ipes ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteIpes(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedIpess,
		createDisplayMode: "modal",
		editDisplayMode: "modal",
		enableRowNumbers: false,
		manualFiltering: false,
		onGlobalFilterChange: setGlobalFilter,
		initialState: {
			density: "xs",
			columnVisibility: {
				arrete_ouverture: false,
				decret_creation: false,
			},
		},
		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Ipes",
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
		onCreatingRowSave: handleCreateIpes,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveIpes,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations?.includes("create-ipes")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvel Ipes</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer l'Ipes</Title>
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
						push(PATH_SECTIONS.ipes.ipes_details(row.original.id));
					}}
				>
					Détails
				</Button>
				<Button
					variant="light"
					color="teal"
					size="compact-sm"
					leftSection={<IconDoor size={16} />}
					onClick={() => {
						setSelectedIpes(row.original);
						openSalles();
					}}
				>
					Salles
				</Button>
				{authorizations?.includes("update-ipes") && (
					<Tooltip label="Editer">
						<ActionIcon
							color={"green"}
							onClick={() => table.setEditingRow(row)}
						>
							<IconEdit />
						</ActionIcon>
					</Tooltip>
				)}
				{authorizations?.includes("delete-ipes") && (
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
					{authorizations?.includes("create-ipes") && (
						<Button
							onClick={() => {
								table.setCreatingRow(true);
							}}
							leftSection={<IconPlus />}
						>
							Nouvel Ipes
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
									handleExportRowsAsPDF([
										"code",
										"name",
										"phone",
										"email",
										"university",
										"arrondissement",
									], table.getPrePaginationRowModel().rows.map(row => [
										row.original.code,
										row.original.name,
										row.original.phone,
										row.original.email,
										fetchedUniversities.find((university) => university.id === row.original.university_id,)?.name || "",
										fetchedLocalizations.find((localization) => localization.id === row.original.arrondissement_id,)?.name || "",
									]))
								}
							>
								Exporter tout
							</Menu.Item>
							<Menu.Item
								disabled={table.getRowModel().rows.length === 0}
								//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
								leftSection={<IconFileTypePdf />}
								onClick={() => handleExportRowsAsPDF([
									"code",
									"name",
									"phone",
									"email",
									"university",
									"arrondissement",
								], table.getRowModel().rows.map(row => [
									row.original.code,
									row.original.name,
									row.original.phone,
									row.original.email,
									fetchedUniversities.find((university) => university.id === row.original.university_id,)?.name || "",
									fetchedLocalizations.find((localization) => localization.id === row.original.arrondissement_id,)?.name || "",
								]))}
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
									handleExportRowsAsPDF([
										"code",
										"name",
										"phone",
										"email",
										"university",
										"arrondissement",
									], table.getSelectedRowModel().rows.map(row => [
										row.original.code,
										row.original.name,
										row.original.phone,
										row.original.email,
										fetchedUniversities.find((university) => university.id === row.original.university_id,)?.name || "",
										fetchedLocalizations.find((localization) => localization.id === row.original.arrondissement_id,)?.name || "",
									]))
								}
							>
								Exporter la selection
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Format Excel</Menu.Label>
							<Menu.Item
								//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
								onClick={() => handleExportAsCSV(fetchedIpess.map(row => ({
									code: row.code,
									name: row.name,
									phone: row.phone,
									email: row.email,
									university: fetchedUniversities.find(
										(university) => university.id === row.university_id,
									)?.name,
									arrondissement: fetchedLocalizations.find(
										(localization) => localization.id === row.arrondissement_id,
									)?.name,
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
										code: row.original.code,
										name: row.original.name,
										phone: row.original.phone,
										email: row.original.email,
										university: fetchedUniversities.find(
											(university) => university.id === row.original.university_id,
										)?.name,
										arrondissement: fetchedLocalizations.find(
											(localization) => localization.id === row.original.arrondissement_id,
										)?.name,
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
									code: row.original.code,
									name: row.original.name,
									phone: row.original.phone,
									email: row.original.email,
									university: fetchedUniversities.find(
										(university) => university.id === row.original.university_id,
									)?.name,
									arrondissement: fetchedLocalizations.find(
										(localization) => localization.id === row.original.arrondissement_id,
									)?.name,
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
										code: row.original.code,
										name: row.original.name,
										phone: row.original.phone,
										email: row.original.email,
										university: fetchedUniversities.find(
											(university) => university.id === row.original.university_id,
										)?.name,
										arrondissement: fetchedLocalizations.find(
											(localization) => localization.id === row.original.arrondissement_id,
										)?.name,
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
			isSaving: isCreatingIpes || isUpdatingIpes || isDeletingIpes,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return (
		<>
			<MantineReactTable table={table} />
			<Modal
				opened={sallesOpened}
				onClose={closeSalles}
				title={
					<Title order={4}>
						Salles — {selectedIpes?.name}
					</Title>
				}
				size="xl"
				centered
			>
				{selectedIpes && (
					<ClassroomsTable
						institute="Ipes"
						instituteId={selectedIpes.id}
						parentInstitute={selectedIpes.institute}
					/>
				)}
			</Modal>
		</>
	);
};

function useCreateIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipes: Ipes) => {
			const response = await fetch(innerUrl("/api/ipes/create"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(ipes),
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'Ipes");
			}

			notifications.show({
				color: "teal",
				title: "Ipes créé",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newIpesInfo: Ipes) => {
			queryClient.setQueryData(["ipes"], (prevIpess: any) => {
				const ipesList = Array.isArray(prevIpess) ? prevIpess : [];
				return [
					...ipesList,
					{
						...newIpesInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as Ipes[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ipes"] });
		},
	});
}

function useUpdateIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipes: Ipes) => {
			const response = await fetch(
				innerUrl(`/api/ipes/${ipes.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(ipes),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de l'Ipes");
			}

			notifications.show({
				color: "green",
				title: "Ipes mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newIpesInfo: Ipes) => {
			queryClient.setQueryData(["ipes"], (prevIpess: any) => {
				const ipesList = Array.isArray(prevIpess) ? prevIpess : [];

				return ipesList.map((ipes: Ipes) =>
					ipes.id === newIpesInfo.id ? { ...ipes, ...newIpesInfo } : ipes,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ipes"] });
		},
	});
}

function useDeleteIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipesId: string) => {
			const response = await fetch(
				innerUrl(`/api/ipes/${ipesId}/delete`),
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: ipesId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression de l'Ipes");
			}

			notifications.show({
				color: "red",
				title: "Ipes supprimé",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (ipesId: string) => {
			queryClient.cancelQueries({ queryKey: ["ipes"] });

			const previousIpeses = queryClient.getQueryData(["ipes"]);

			queryClient.setQueryData(["ipes"], (prevIpeses: any | undefined) => {
				return prevIpeses?.data?.filter((ipes: Ipes) => ipes.id !== ipesId);
			});

			return { previousIpeses };
		},
		onError: (err, ipesId, context: any) => {
			if (context?.previousIpeses) {
				queryClient.setQueryData(["ipes"], context.previousIpeses);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ipes"] });
		},
	});
}

type IpesProps = {
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

const IpesTable = ({ authorizations, institution, user }: IpesProps) => (
	<Section
		authorizations={authorizations}
		institution={institution}
		user={user}
	/>
);

export default IpesTable;

const validateRequired = (value: string | undefined | null) => !!value && value.length > 0;

function validateIpes(ipess: Ipes) {
	return {
		code: !validateRequired(ipess.code)
			? "Le sigle de l'IPES est requis"
			: "",
		name: !validateRequired(ipess.name)
			? "L'intitulé de l'IPES est requis"
			: "",
		arrondissement_id: ipess.arrondissement_id == undefined
			? "La localisation est requise"
			: "",
		university_id: ipess.university_id == undefined
			? "L'université de tutelle est requise"
			: "",
	};
}
