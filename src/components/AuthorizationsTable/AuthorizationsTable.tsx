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
import { Authorization } from "@/types";
import { getInstitutionName } from "@/app/lib/utils";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

type AuthorizationApiResponse = {
	data: Array<Authorization>;
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

const useGetAuthorizations = () => {
	const fetchURL = new URL(
		"/api/authorizations",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<AuthorizationApiResponse>({
		queryKey: ["authorizations"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	const { authorizations, institution } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	const handleExportRows = (rows: MRT_Row<Authorization>[]) => {
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
			body: [["name", "slug"]],
		});

		doc.save("syrap-authorizations.pdf");
	};

	const handleExportRowsAsCSV = (rows: MRT_Row<Authorization>[]) => {
		const rowData = rows.map((row) => ({
			name: row.original.name,
		}));
		const csv = generateCsv(csvConfig)(rowData);
		download(csvConfig)(csv);
	};

	const handleExportDataAsCSV = () => {
		const allData = fetchedAuthorizations.map((row) => ({
			name: row.name,
		}));
		const csv = generateCsv(csvConfig)(allData);
		download(csvConfig)(csv);
	};

	const columns = useMemo<MRT_ColumnDef<Authorization>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "name",
				header: "Permission",
				mantineEditTextInputProps: {
					type: "text",
					required: true,
					error: validationErrors?.name,
					//remove any previous validation errors when authorization focuses on the input
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

	const { data, isError, isFetching, isLoading, refetch } =
		useGetAuthorizations();

	const fetchedAuthorizations = data?.data ?? [];
	console.log("Voici les authorizations : ", fetchedAuthorizations);

	const {
		mutateAsync: createAuthorization,
		isPending: isCreatingAuthorization,
	} = useCreateAuthorization();
	const {
		mutateAsync: updateAuthorization,
		isPending: isUpdatingAuthorization,
	} = useUpdateAuthorization();
	const {
		mutateAsync: deleteAuthorization,
		isPending: isDeletingAuthorization,
	} = useDeleteAuthorization();

	const handleCreateAuthorization: MRT_TableOptions<Authorization>["onCreatingRowSave"] =
		async ({ values, exitCreatingMode }) => {
			const newValidationErrors = validateAuthorization(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			console.log("Voici les valeurs : ", values);
			setValidationErrors(values);
			await createAuthorization(values);
			exitCreatingMode();
		};

	const handleSaveAuthorization: MRT_TableOptions<Authorization>["onEditingRowSave"] =
		async ({ values, table, row }) => {
			const newValidationErrors = validateAuthorization(values);
			if (Object.values(newValidationErrors).some((error) => error)) {
				setValidationErrors(newValidationErrors);
				return;
			}
			setValidationErrors(values);
			console.log("Voici les valeurs de l'update : ", values);
			await updateAuthorization({
				...values,
				id: row.original.id,
			});
			table.setEditingRow(null);
		};

	const openDeleteConfirmModal = (row: MRT_Row<Authorization>) =>
		modals.openConfirmModal({
			title: "Etes vous sur de vouloir supprimer cette Permission ?",
			children: (
				<Text>
					Etes vous sure de vouloir supprimer {row.original.name}? Cette action
					est irreversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteAuthorization(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedAuthorizations,
		createDisplayMode: "row",
		editDisplayMode: "row",

		mantineSearchTextInputProps: {
			placeholder: "Rechercher des Permissions",
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
		onCreatingRowSave: handleCreateAuthorization,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveAuthorization,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-authorizations")) {
				return null;
			}

			return (
				<Stack>
					<Title order={3}>Nouvelle permission</Title>
					{internalEditComponents}
					<Flex justify="flex-end" mt="xl">
						<MRT_EditActionButtons variant="text" table={table} row={row} />
					</Flex>
				</Stack>
			);
		},
		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Editer la permission</Title>
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
							Intitulé de la permission :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Divider my={10} />
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{/*{authorizations.includes("update-authorizations") && (*/}
				<Tooltip label="Editer">
					<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
					</ActionIcon>
				</Tooltip>
				{/*)}*/}
				{/*{authorizations.includes("delete-authorizations") && (*/}
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
					{/*{authorizations.includes("create-authorizations") && (*/}
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle permission
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
				isCreatingAuthorization ||
				isUpdatingAuthorization ||
				isDeletingAuthorization,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateAuthorization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (authorization: Authorization) => {
			const response = await fetch(
				"http://localhost:3000/api/authorizations/create",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(authorization),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la création de la permission");
			}

			notifications.show({
				color: "teal",
				title: "Permission créee",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newAuthorizationInfo: Authorization) => {
			queryClient.setQueryData(
				["authorizations"],
				(prevAuthorizations: any) => {
					const authorizationList = Array.isArray(prevAuthorizations)
						? prevAuthorizations
						: [];
					return [
						...authorizationList,
						{
							...newAuthorizationInfo,
							id: (Math.random() + 1).toString(36).substring(7),
						},
					] as Authorization[];
				},
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["authorizations"] });
		},
	});
}

function useUpdateAuthorization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (authorization: Authorization) => {
			const response = await fetch(
				`http://localhost:3000/api/authorizations/${authorization.id}/update`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(authorization),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la mise à jour de la permission");
			}

			notifications.show({
				color: "green",
				title: "Permission mise à jour",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (newAuthorizationInfo: Authorization) => {
			queryClient.setQueryData(
				["authorizations"],
				(prevAuthorizations: any) => {
					const authorizationList = Array.isArray(prevAuthorizations)
						? prevAuthorizations
						: [];

					return authorizationList.map((authorization: Authorization) =>
						authorization.id === newAuthorizationInfo.id
							? { ...authorization, ...newAuthorizationInfo }
							: authorization,
					);
				},
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["authorizations"] });
		},
	});
}

function useDeleteAuthorization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (authorizationId: string) => {
			const response = await fetch(
				`http://localhost:3000/api/authorizations/${authorizationId}/delete`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: authorizationId }),
				},
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression du rôle");
			}

			notifications.show({
				color: "red",
				title: "Permission supprimée",
				message: "Merci de votre patience",
				icon: <IconCheck />,
				loading: false,
				autoClose: 2000,
			});
			return await response.json();
		},
		onMutate: (authorizationId: string) => {
			queryClient.cancelQueries({ queryKey: ["authorizations"] });

			const previousAuthorizations = queryClient.getQueryData([
				"authorizations",
			]);

			queryClient.setQueryData(
				["authorizations"],
				(prevAuthorizations: any | undefined) => {
					return prevAuthorizations?.data?.filter(
						(authorization: Authorization) =>
							authorization.id !== authorizationId,
					);
				},
			);

			return { previousAuthorizations };
		},
		onError: (err, authorizationId, context: any) => {
			if (context?.previousAuthorizations) {
				queryClient.setQueryData(
					["authorizations"],
					context.previousAuthorizations,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["authorizations"] });
		},
	});
}

const queryClient = new QueryClient();

type AuthorizationProps = {
	authorizations: String[];
};

const AuthorizationTable = ({ authorizations }: AuthorizationProps) => (
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} />
	</QueryClientProvider>
);

export default AuthorizationTable;

const validateRequired = (value: string) =>
	!!value.length && value.length > 3 && value.length <= 100;
function validateAuthorization(authorization: Authorization) {
	return {
		name: !validateRequired(authorization.name)
			? "Ce champs doit contenir entre 3 et 100 caractères."
			: "",
	};
}