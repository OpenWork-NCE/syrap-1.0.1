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
import { Profile, User } from "@/types";
import { getInstitutionName } from "@/app/lib/utils";

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

type ProfileApiResponse = {
	data: Array<Profile>;
	messages: Array<string>;
	success: string;
};

type UserApiResponse = {
	data: Array<User>;
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
const useGetUsers = ({}: Params) => {
	const fetchURL = new URL(
		"/api/users",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<UserApiResponse>({
		queryKey: ["users"],
		queryFn: () => fetch(fetchURL.href).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetProfiles = () => {
	const fetchURL = new URL(
		"/api/profiles",
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: "http://localhost:3000",
	);

	return useQuery<ProfileApiResponse>({
		queryKey: ["profiles"],
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

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetProfiles();

	const fetchedProfiles = lData?.data ?? [];
	console.log("Intelligence de jeu : ", fetchedProfiles);

	const handleExportRows = (rows: MRT_Row<User>[]) => {
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
			body: [["name", "roles"]],
		});

		doc.save("syrap-users.pdf");
	};

	const handleExportRowsAsCSV = (rows: MRT_Row<User>[]) => {
		const rowData = rows.map((row) => ({
			name: row.original.name,
		}));
		const csv = generateCsv(csvConfig)(rowData);
		download(csvConfig)(csv);
	};

	const handleExportDataAsCSV = () => {
		const allData = fetchedUsers.map((row) => ({
			name: row.name,
		}));
		const csv = generateCsv(csvConfig)(allData);
		download(csvConfig)(csv);
	};

	const columns = useMemo<MRT_ColumnDef<User>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Identifiant",
				enableEditing: false,
			},
			{
				accessorKey: "name",
				header: "Nom Utilisateur",
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
				accessorKey: "email",
				header: "Email",
				mantineEditTextInputProps: {
					type: "email",
					required: true,
					error: validationErrors?.email,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							email: undefined,
						}),
					//optionally add validation checking for onBlur or onChange
				},
			},
			{
				accessorKey: "roles",
				accessorFn: (row) => {
					// const profiles = row.roles?.map((role) => role.name);
					return [];
				},
				Cell: ({ cell }) => {
					const roles = cell.row.original.roles.map((role) => role.name);
					return roles.join(", ");
				},
				// accessorFn: (row) => {
				// 	const profiles = row.roles?.map((role) => role.name);
				// 	return profiles?.join(", ");
				// },
				// accessorFn: (row) => row.roles?.map((role) => role.name)?.join(", "),
				header: "Roles",
				editVariant: "multi-select",
				mantineEditSelectProps: {
					data: fetchedProfiles.map((profile) => ({
						value: String(profile.id),
						label: profile.name,
					})),
				},
			},
			{
				accessorKey: "password",
				header: "Mot de passe",
				mantineEditTextInputProps: {
					type: "password",
					required: true,
					error: validationErrors?.password,
					//remove any previous validation errors when user focuses on the input
					onFocus: () =>
						setValidationErrors({
							...validationErrors,
							password: undefined,
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

	const { data, isError, isFetching, isLoading, refetch } = useGetUsers({
		columnFilterFns,
		columnFilters,
		globalFilter,
		// pagination,
		sorting,
	});

	const fetchedUsers = data?.data ?? [];
	console.log("Voici les users : ", fetchedUsers);

	const { mutateAsync: createUser, isPending: isCreatingUser } =
		useCreateUser();
	const { mutateAsync: updateUser, isPending: isUpdatingUser } =
		useUpdateUser();
	const { mutateAsync: deleteUser, isPending: isDeletingUser } =
		useDeleteUser();

	const handleCreateUser: MRT_TableOptions<User>["onCreatingRowSave"] = async ({
		values,
		exitCreatingMode,
	}) => {
		const newValidationErrors = validateUser(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		console.log("Voici les valeurs : ", values);
		setValidationErrors(values);
		await createUser({
			...values,
			model:
				getInstitutionName(institution?.slug) !== "Ipes"
					? getInstitutionName(institution?.slug)
					: "institute",
			model_id: String(institution?.id),
		});
		exitCreatingMode();
	};

	const handleSaveUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
		values,
		table,
		row,
	}) => {
		const newValidationErrors = validateUser(values);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors(values);
		await updateUser({
			...values,
			id: row.original.id,
			model:
				getInstitutionName(institution?.slug) !== "Ipes"
					? getInstitutionName(institution?.slug)
					: "institute",
			model_id: String(institution?.id),
		});
		table.setEditingRow(null);
	};

	const openDeleteConfirmModal = (row: MRT_Row<User>) =>
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
			onConfirm: () => deleteUser(row.original.id),
		});

	const table = useCustomTable({
		columns,
		data: fetchedUsers,
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
		onCreatingRowSave: handleCreateUser,
		onEditingRowCancel: () => setValidationErrors({}),
		onEditingRowSave: handleSaveUser,
		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
			if (!authorizations.includes("create-users")) {
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
					<Title order={5}>{row.original.name}</Title>
					<Divider pb={1} mb={10} />
					<Box style={{ fontSize: "16px" }}>
						<Text size={"sm"}>
							Intitulé de l'Utilisateur :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.name}</span>
						</Text>
						<Text size={"sm"}>
							Email :{" "}
							<span style={{ fontWeight: "bolder" }}>{row.original.email}</span>
						</Text>
						{/*<Text size={"sm"}>*/}
						{/*	Rôles :{" "}*/}
						{/*	<span style={{ fontWeight: "bolder" }}>*/}
						{/*		{(() => {*/}
						{/*			const profiles = row.original.roles?.map((role) => role.name);*/}
						{/*			return profiles?.join(", ");*/}
						{/*		})()}*/}
						{/*	</span>*/}
						{/*</Text>*/}
						<Divider my={10} />
					</Box>
				</Box>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{/*{authorizations.includes("update-users") && (*/}
				{/*<Tooltip label="Editer">*/}
				{/*	<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>*/}
				{/*		<IconEdit />*/}
				{/*	</ActionIcon>*/}
				{/*</Tooltip>*/}
				{/*)}*/}
				{/*{authorizations.includes("delete-users") && (*/}
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
					{/*{authorizations.includes("create-users") && (*/}
					<Button
						onClick={() => {
							table.setCreatingRow(true);
						}}
						leftSection={<IconPlus />}
					>
						Nouvelle Utilisateur
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
			isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (user: User) => {
			const response = await fetch("http://localhost:3000/api/users/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(user),
			});

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
		onMutate: (newUserInfo: User) => {
			queryClient.setQueryData(["users"], (prevUsers: any) => {
				const userList = Array.isArray(prevUsers) ? prevUsers : [];
				return [
					...userList,
					{
						...newUserInfo,
						id: (Math.random() + 1).toString(36).substring(7),
					},
				] as User[];
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (user: User) => {
			const response = await fetch(
				`http://localhost:3000/api/users/${user.id}/update`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(user),
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
		onMutate: (newUserInfo: User) => {
			queryClient.setQueryData(["users"], (prevUsers: any) => {
				const userList = Array.isArray(prevUsers) ? prevUsers : [];

				return userList.map((user: User) =>
					user.id === newUserInfo.id ? { ...user, ...newUserInfo } : user,
				);
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (userId: string) => {
			const response = await fetch(
				`http://localhost:3000/api/users/${userId}/delete`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: userId }),
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
		onMutate: (userId: string) => {
			queryClient.cancelQueries({ queryKey: ["users"] });

			const previousUseres = queryClient.getQueryData(["users"]);

			queryClient.setQueryData(["users"], (prevUseres: any | undefined) => {
				return prevUseres?.data?.filter((user: User) => user.id !== userId);
			});

			return { previousUseres };
		},
		onError: (err, userId, context: any) => {
			if (context?.previousUseres) {
				queryClient.setQueryData(["users"], context.previousUseres);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

const queryClient = new QueryClient();

type UserProps = {
	authorizations: String[];
	institution: {
		id: string;
		name: string;
		slug: string;
		code: string;
	};
};

const UserTable = ({ authorizations, institution }: UserProps) => (
	<QueryClientProvider client={queryClient}>
		<Section authorizations={authorizations} institution={institution} />
	</QueryClientProvider>
);

export default UserTable;

const validateRequired = (value: string) =>
	!!value.length && value.length > 3 && value.length <= 100;
const validateRequiredNumber = (value: number) => !!value;
const validateEmail = (email: string) =>
	!!email.length &&
	email
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);
const validatePassword = (password: string) =>
	password.length >= 8 &&
	/[A-Z]/.test(password) &&
	/[a-z]/.test(password) &&
	/[0-9]/.test(password) &&
	/[\W_]/.test(password);

function validateUser(user: User) {
	return user.password
		? {
				name: !validateRequired(user.name) ? "Ce champs est requis" : "",
				email: !validateEmail(user.email)
					? "L'email est un chaine de caractère comprise entre 3 et 100"
					: "",
				password: !validatePassword(user.password)
					? "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial."
					: "",
			}
		: {
				name: !validateRequired(user.name) ? "Ce champs est requis" : "",
				email: !validateEmail(user.email)
					? "L'email est un chaine de caractère comprise entre 3 et 100"
					: "",
			};
}
