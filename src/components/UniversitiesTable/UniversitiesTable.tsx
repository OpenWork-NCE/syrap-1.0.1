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
import { Institution, Localization, University, User } from "@/types";
import { getInstitutionName } from "@/app/lib/utils";
import { PATH_SECTIONS } from "@/routes";
import { useRouter } from "next/navigation";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

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
	const fetchURL = new URL(
		"/api/universities",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<UniversityApiResponse>({
		queryKey: ["universities"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetLocalizations = () => {
	const fetchURL = new URL(
		"/api/localizations",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<LocalizationApiResponse>({
		queryKey: ["localizations"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
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

	const handleExportRows = (rows: MRT_Row<University>[]) => {
		const doc = new jsPDF("portrait", "pt", "A4");
		const pageWidth = doc.internal.pageSize.getWidth();
		const logoUrl = "/thumbnail.png";

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

		doc.setFontSize(10);
		doc.text(frenchText, 40, 50);
		doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 40, 60, 60);
		doc.text(englishText, pageWidth - 250, 50);

		const tableData = rows.map((row) => Object.values(row.original));
		const tableHeaders = columns.map((c) => c.header);

		autoTable(doc, {
			startY: 200, // Start after the header
			head: [tableHeaders],
			body: [["code", "name", "description", "phone", "email"]],
		});

		doc.save("syrap-universities.pdf");
	};

	const handleExportRowsAsCSV = (rows: MRT_Row<University>[]) => {
		const rowData = rows.map((row) => ({
			code: row.original.code,
			name: row.original.name,
			description: row.original.description,
			phone: row.original.phone,
			email: row.original.email,
		}));
		const csv = generateCsv(csvConfig)(rowData);
		download(csvConfig)(csv);
	};

	const handleExportDataAsCSV = () => {
		const allData = fetchedUniversities.map((row) => ({
			code: row.code,
			name: row.name,
			description: row.description,
			phone: row.phone,
			email: row.email,
		}));
		const csv = generateCsv(csvConfig)(allData);
		download(csvConfig)(csv);
	};

	const columns = useMemo<MRT_ColumnDef<University>[]>(
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
							String(localisation.id) == String(row.arrondissement_id),
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

	const { data, isError, isFetching, isLoading, refetch } = useGetUniversities({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	const fetchedUniversities = data?.data ?? [];
	console.log("Voici les universities : ", fetchedUniversities);

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
			console.log("Voici les valeurs en question : ", values);
			await createUniversity({
				...values,
				cenadi_id: String(institution.id),
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
				cenadi_id: institution.id,
				user_id: user.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<University>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cet utilisateur ?",
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
		createDisplayMode: "row",
		editDisplayMode: "row",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Utilisateurs",
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
		onCreatingRowSave: handleCreateUniversity,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveUniversity,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-universities")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvel Utilisateur</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer l'Utilisateur</Title>
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
							Sigle de l'Université :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.code}</span>
						</Text>
						<Text size={"sm"}>
							Intitulé de l'Université :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Text size={"sm"}>
							Description :{" "}
							<span style={{ fontWeight: "bolder" }}>
								{row.original.description}
							</span>
						</Text>
						<Text size={"sm"}>
							Téléphone :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.phone}</span>
						</Text>
						<Text size={"sm"}>
							Email :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.email}</span>
						</Text>
						{/*<Text size={'sm'}>*/}
						{/*	Arrondissement :{' '}*/}
						{/*	<span style={{ fontWeight: 'bolder' }}>{row.original.arrondissement_id}</span>*/}
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
						{/*<Text size={'sm'}>*/}
						{/*  Nombre de universités :{' '}*/}
						{/*  <span style={{ fontWeight: 'bolder' }}>*/}
						{/*    {row.original.level_count}*/}
						{/*  </span>*/}
						{/*</Text>*/}
						<Divider pb={1} mb={10} />
						<Button
							variant={"outline"}
							leftSection={<IconEye />}
							onClick={() => {
								push(
									PATH_SECTIONS.universities.university_details(
										row.original.id,
									),
								);
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
				{authorizations.includes("update-universities") &&
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
				{authorizations.includes("delete-universities") && (
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
					{authorizations.includes("create-universities") &&
						institution?.slug.includes("cenadi") && (
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
				"http://localhost:3000/api/universities/create",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(university),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'Utilisateur");
			}

			notifications.show({
				color: "teal",
				title: "Utilisateur créé",
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
				`http://localhost:3000/api/universities/${university.id}/update`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(university),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de l'Utilisateur");
			}

			notifications.show({
				color: "green",
				title: "Utilisateur mise à jour",
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
			console.log("Here id of university to delete", universityId);
			const response = await fetch(
				`http://localhost:3000/api/universities/${universityId}/delete`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: universityId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression de l'Utilisateur");
			}

			notifications.show({
				color: "red",
				title: "Utilisateur supprimé",
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

const queryClient = new QueryClient();

type UniversityProps = {
	authorizations: String[];
	institution: {
		id: string;
		name: string;
		slug: string;
		code: string;
	};
	user: {
		id: string;
		name: string;
		email: string;
	};
};

const UniversityTable = ({
	authorizations,
	institution,
	user,
}: UniversityProps) => (
	<QueryClientProvider client={queryClient}>
		<Section
			authorizations={authorizations}
			institution={institution}
			user={user}
		/>
	</QueryClientProvider>
);

export default UniversityTable;

const validateRequired = (value: string) => !!value.length;
// const validateEmail = (email: string) =>
// 	!!email.length &&
// 	email
// 		.toLowerCase()
// 		.match(
// 			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
// 		);

function validateUniversity(universities: University) {
	return {
		code: !validateRequired(universities.code)
			? "Le sigle de l'Université est requis"
			: "",
		name: !validateRequired(universities.name)
			? "L'intitulé de l'Université est requis"
			: "",
		// description: !validateRequired(universities.description)
		//   ? "L'intitulé de l'Université est requis"
		//   : '',
		// phone: !validateRequired(universities.phone)
		//   ? "Le nombre d'heures est requis : "
		//   : '',
		// email: !validateEmail(universities.email)
		//   ? "L'intitulé de l'Université est requis"
		//   : '',
		// localization: !validateRequired(universities.localization)
		//   ? "Le nombre d'heures est requis : "
		//   : '',
	};
}
