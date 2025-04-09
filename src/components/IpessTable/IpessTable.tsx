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
import { Institution, Localization, Ipes, User, University } from "@/types";
import { getInstitutionName, innerUrl } from "@/app/lib/utils";
import { PATH_SECTIONS } from "@/routes";
import { useRouter } from "next/navigation";
import { handleExportAsCSV, handleExportRowsAsPDF } from "@/app/lib/utils";

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
		queryKey: ["ipess"],
		queryFn: () => fetch(innerUrl("/api/ipess")).then((res) => res.json()),
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

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetLocalizations();

	const fetchedLocalizations = lData?.data ?? [];
	console.log("Intelligence de jeu : ", fetchedLocalizations);

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

				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.code,
					//remove any previous validation errors when user focuses on the input
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
				header: "Intitulé de l'Ipes",
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
				accessorKey: "phone",
				header: "Téléphone",
				enableHiding: true,
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
							String(localisation.id) === String(row.arrondissement_id),
					)?.name,
				header: "Localisation",
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedLocalizations.map((localization) => ({
						value: String(localization.id),
						label: localization.name,
					})),
				},
			},
			{
				accessorKey: "university_id",
				accessorFn: (row) =>
					fetchedUniversities.find(
						(university) => String(university.id) === String(row.university_id),
					)?.name,
				header: "Université de Tutelle",
				editVariant: "select",
				mantineEditSelectProps: {
					data: fetchedUniversities.map((university) => ({
						value: String(university.id),
						label: university.name,
					})),
				},
			},
			{
				accessorKey: "arrete_ouverture",
				header: "Arreté d'Ouverture",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.arrete_ouverture,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							arrete_ouverture: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
				},
			},
			{
				accessorKey: "decret_creation",
				header: "Decret de création",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.decret_creation,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							decret_creation: undefined,
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

	const { data, isError, isFetching, isLoading, refetch } = useGetIpess({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	const fetchedIpess = data?.data ?? [];
	console.log("Voici les ipess : ", fetchedIpess);

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
		console.log("Voici les valeurs en question : ", values);
		await createIpes({
			...values,
			cenadi_id: String(institution.id),
			user_id: String(user.id),
			promoteur_id: String(user.id),
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
			cenadi_id: String(institution.id),
			user_id: String(user.id),
			promoteur_id: String(user.id),
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
		onCreatingRowCancel: () => setValidationErrors({}),
		onCreatingRowSave: handleCreateIpes,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveIpes,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-ipes")) {
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
						{row.original.name}
					</Title>
					<Box style={{ fontSize: "16px" }}>
						<Text size={"sm"}>
							Sigle de l'Ipes :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.code}</span>
						</Text>
						<Text size={"sm"}>
							Intitulé de l'Ipes :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Text size={"sm"}>
							Téléphone :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.phone}</span>
						</Text>
						<Text size={"sm"}>
							Email :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.email}</span>
						</Text>
						<Text size={"sm"}>
							Arrété d'ouverture :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.arrete_ouverture}
							</span>
						</Text>
						<Text size={"sm"}>
							Décrêt de création :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.decret_creation}
							</span>
						</Text>
						{/*<Text size={'sm'}>*/}
						{/*	Arrondissement :{' '}*/}
						{/*	<span style={{ fontWeight: 'bolder' }}>{row.original.arrondissement_id}</span>*/}
						{/*</Text>*/}
						{/*<Text size={'sm'}>*/}
						{/*	Université de tutelle :{' '}*/}
						{/*	<span style={{ fontWeight: 'bolder' }}>{row.original.university_id}</span>*/}
						{/*</Text>*/}
						{/*<Text size={'sm'}>*/}
						{/*  Nombre d'IPES sous tutelle :{' '}*/}
						{/*  <span style={{ fontWeight: 'bolder' }}>*/}
						{/*    {row.original.ipes_count}*/}
						{/*  </span>*/}
						{/*</Text>*/}
						{/*<Text size={'sm'}>*/}
						{/*  Nombre de filières :{' '}*/}
						{/*  <span style={{ fontWeight: 'bolder' }}>*/}
						{/*    {row.original.branch_count}*/}
						{/*  </span>*/}
						{/*</Text>*/}
						<Divider pb={1} mb={10} />
						<Button
							variant={"outline"}
							leftSection={<IconEye />}
							onClick={() => {
								push(PATH_SECTIONS.ipes.ipes_details(row.original.id));
							}}
						>
							Details
						</Button>
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{authorizations.includes("update-ipes") &&
					institution.slug.includes("cenadi") && (
						<Tooltip label="Editer">
							<ActionIcon
								color={"green"}
								onClick={() => table.setEditingRow(row)}
							>
								<IconEdit />
							</ActionIcon>
						</Tooltip>
					)}
				{authorizations.includes("delete-ipes") && (
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
					{authorizations.includes("create-ipes") &&
						institution?.slug.includes("cenadi") && (
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

	return <MantineReactTable table={table} />;
};

function useCreateIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipes: Ipes) => {
			const response = await fetch(innerUrl("/api/ipess/create"), {
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
			queryClient.setQueryData(["ipess"], (prevIpess: any) => {
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
			queryClient.invalidateQueries({ queryKey: ["ipess"] });
		},
	});
}

function useUpdateIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipes: Ipes) => {
			const response = await fetch(
				innerUrl(`/api/ipess/${ipes.id}/update`),
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
			queryClient.setQueryData(["ipess"], (prevIpess: any) => {
				const ipesList = Array.isArray(prevIpess) ? prevIpess : [];

				return ipesList.map((ipes: Ipes) =>
					ipes.id === newIpesInfo.id ? { ...ipes, ...newIpesInfo } : ipes,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ipess"] });
		},
	});
}

function useDeleteIpes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (ipesId: string) => {
			const response = await fetch(
				innerUrl(`/api/ipess/${ipesId}/delete`),
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
			queryClient.cancelQueries({ queryKey: ["ipess"] });

			const previousIpeses = queryClient.getQueryData(["ipess"]);

			queryClient.setQueryData(["ipess"], (prevIpeses: any | undefined) => {
				return prevIpeses?.data?.filter((ipes: Ipes) => ipes.id !== ipesId);
			});

			return { previousIpeses };
		},
		onError: (err, ipesId, context: any) => {
			if (context?.previousIpeses) {
				queryClient.setQueryData(["ipess"], context.previousIpeses);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ipess"] });
		},
	});
}

const queryClient = new QueryClient();

type IpesProps = {
	authorizations: String[];
	institution: {
		id: string;
		name: string;
		slug: string;
		model: string;
	};
	user: {
		id: string;
		name: string;
		email: string;
	};
};

const IpesTable = ({ authorizations, institution, user }: IpesProps) => (
	<QueryClientProvider client={queryClient}>
		<Section
			authorizations={authorizations}
			institution={institution}
			user={user}
		/>
	</QueryClientProvider>
);

export default IpesTable;

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
	!!email.length &&
	email
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);

function validateIpes(ipess: Ipes) {
	return {
		code: !validateRequired(ipess.code)
			? "Le sigle de l'Université est requis"
			: "",
		name: !validateRequired(ipess.name)
			? "L'intitulé de l'Université est requis"
			: "",
		// description: !validateRequired(ipess.description)
		//   ? "L'intitulé de l'Université est requis"
		//   : '',
		// phone: !validateRequired(ipess.phone)
		//   ? "Le nombre d'heures est requis : "
		//   : '',
		// email: !validateEmail(ipess.email)
		//   ? "L'intitulé de l'Université est requis"
		//   : '',
		// localization: !validateRequired(ipess.localization)
		//   ? "Le nombre d'heures est requis : "
		//   : '',
	};
}
