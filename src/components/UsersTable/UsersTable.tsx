"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Profile, User, Cenadi, Minesup, University, ShowIpes } from "@/types";
import { getInstitutionName, innerUrl } from "@/app/lib/utils";

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

type CenadiApiResponse = {
	data: Array<Cenadi>;
	messages: Array<string>;
	success: string;
};

type MinesupApiResponse = {
	data: Array<Minesup>;
	messages: Array<string>;
	success: string;
};

type UniversityApiResponse = {
	data: Array<University>;
	messages: Array<string>;
	success: string;
};

type IpesApiResponse = {
	data: Array<ShowIpes>;
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
	return useQuery<UserApiResponse>({
		queryKey: ["users"],
		queryFn: () => fetch(innerUrl("/api/users")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const useGetProfiles = () => {
	return useQuery<ProfileApiResponse>({
		queryKey: ["profiles"],
		queryFn: () => fetch(innerUrl("/api/profiles")).then((res) => res.json()),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
};

const Section = (props: any) => {
	const { authorizations, institution } = props;
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [modelOptions, setModelOptions] = useState<{value: string, label: string}[]>([]);
	const [isModelSelectInitialized, setIsModelSelectInitialized] = useState(false);

	// States for each type of entity
	const [cenadis, setCenadis] = useState<Cenadi[]>([]);
	const [minesups, setMinesups] = useState<Minesup[]>([]);
	const [universities, setUniversities] = useState<University[]>([]);
	const [ipess, setIpess] = useState<ShowIpes[]>([]);

	// Fetch model options based on selected model type
	const fetchModelOptions = async (modelType: string) => {
		try {
			let endpoint = "";
			switch (modelType) {
				case "Cenadi":
					endpoint = innerUrl("/api/cenadis");
					const cenadiResponse = await fetch(endpoint);
					const cenadiData: CenadiApiResponse = await cenadiResponse.json();
					setCenadis(cenadiData.data || []);
					setModelOptions(cenadiData.data.map(item => ({
						value: String(item.id),
						label: item.name
					})));
					break;
				case "Minesup":
					endpoint = innerUrl("/api/minesups");
					const minesupResponse = await fetch(endpoint);
					const minesupData: MinesupApiResponse = await minesupResponse.json();
					setMinesups(minesupData.data || []);
					setModelOptions(minesupData.data.map(item => ({
						value: String(item.id),
						label: item.name
					})));
					break;
				case "University":
					endpoint = innerUrl("/api/universities");
					const universityResponse = await fetch(endpoint);
					const universityData: UniversityApiResponse = await universityResponse.json();
					setUniversities(universityData.data || []);
					setModelOptions(universityData.data.map(item => ({
						value: String(item.institute),
						label: item.name
					})));
					break;
				case "Ipes":
					endpoint = innerUrl("/api/ipess");
					const ipesResponse = await fetch(endpoint);
					const ipesData: IpesApiResponse = await ipesResponse.json();
					setIpess(ipesData.data || []);
					setModelOptions(ipesData.data.map(item => ({
						value: String(item.institute),
						label: item.name
					})));
					break;
				default:
					setModelOptions([]);
			}
		} catch (error) {
			console.error("Error fetching model options:", error);
			setModelOptions([]);
		}
	};

	// Handle model selection
	const handleModelChange = (value: any) => {
		if (typeof value === 'string' && value) {
			setSelectedModel(value);
			fetchModelOptions(value);
		}
	};

	const {
		data: lData,
		isError: lIsError,
		isFetching: lIsFetching,
		isLoading: lIsLoading,
		refetch: lRefresh,
	} = useGetProfiles();

	const fetchedProfiles = lData?.data ?? [];

	const columns = useMemo<MRT_ColumnDef<User>[]>(
		() => {
			// Define base columns that are always shown
			const baseColumns = [
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
						onFocus: () =>
							setValidationErrors({
								...validationErrors,
								name: undefined,
							}),
					},
				},
				{
					accessorKey: "email",
					header: "Email",
					mantineEditTextInputProps: {
						type: "email",
						required: true,
						error: validationErrors?.email,
						onFocus: () =>
							setValidationErrors({
								...validationErrors,
								email: undefined,
							}),
					},
				},
			];

			// These columns are only shown if user has create-users-anywhere permission
			const modelColumns = authorizations.includes("create-users-anywhere") ? [
				{
					accessorKey: "model",
					header: "Entité",
					editVariant: "select" as const,
					mantineEditSelectProps: {
						data: [
							{ value: "Cenadi", label: "Cenadi" },
							{ value: "Minesup", label: "Minesup" },
							{ value: "University", label: "Université" },
							{ value: "Ipes", label: "IPES" },
						],
						onChange: handleModelChange,
					},
				},
				{
					accessorKey: "model_id",
					header: "Spécifique",
					editVariant: "select" as const,
					mantineEditSelectProps: {
						data: modelOptions,
						disabled: !selectedModel,
						placeholder: selectedModel ? "Sélectionnez une option" : "Choisissez d'abord une entité",
					},
				},
			] : [];

			// Remaining columns
			const remainingColumns = [
				{
					accessorKey: "roles",
					accessorFn: (row: any) => {
						return [];
					},
					Cell: ({ cell }: { cell: any }) => {
						const roles = cell.row.original.roles.map((role: any) => role.name);
						return roles.join(", ");
					},
					header: "Roles",
					editVariant: "multi-select" as const,
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
						onFocus: () =>
							setValidationErrors({
								...validationErrors,
								password: undefined,
							}),
					},
				},
			];

			return [...baseColumns, ...modelColumns, ...remainingColumns];
		},
		[validationErrors, modelOptions, selectedModel, fetchedProfiles, handleModelChange, authorizations],
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
		const newValidationErrors = validateUser(values, authorizations as string[]);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}

		// For users with create-users-anywhere permission, validate model fields
		if (authorizations.includes("create-users-anywhere")) {
			// Validate model selection
			if (!values.model) {
				setValidationErrors({
					...newValidationErrors,
					model: "Veuillez sélectionner une entité",
				});
				return;
			}

			// Validate model_id selection
			if (!values.model_id) {
				setValidationErrors({
					...newValidationErrors,
					model_id: "Veuillez sélectionner une option spécifique",
				});
				return;
			}

			console.log("Voici les valeurs : ", values);
			setValidationErrors({});
			await createUser({
				...values,
				model: values.model === "Cenadi" ? "cenadi" : values.model === "Minesup" ? "minesup" : "institute",
				model_id: String(values.model_id),
			});
		} else {
			// For regular users, use the institution values
			console.log("Voici les valeurs (without model): ", values);
			setValidationErrors({});
			await createUser({
				...values,
				model: getInstitutionName(institution?.slug) !== "Ipes"
					? getInstitutionName(institution?.slug)
					: "institute",
				model_id: String(institution?.id),
			});
		}

		setSelectedModel('');
		setModelOptions([]);
		exitCreatingMode();
	};

	// Handle row creation start/cancel events
	const handleCreatingRowCancel = () => {
		setValidationErrors({});
		setSelectedModel('');
		setModelOptions([]);
	};

	const handleSaveUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
		values,
		table,
		row,
	}) => {
		const newValidationErrors = validateUser(values, authorizations as string[]);
		if (Object.values(newValidationErrors).some((error) => error)) {
			setValidationErrors(newValidationErrors);
			return;
		}
		setValidationErrors({});
		await updateUser({
			...values,
			id: row.original.id,
			model: values.model === "Cenadi" ? "cenadi" : values.model === "Minesup" ? "minesup" : "institute",
			model_id: String(institution?.id),
		});
		table.setEditingRow(null);
	};

	const handleEditingRowCancel = () => {
		setValidationErrors({});
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

	const handleRowActionClick = (action: 'edit' | 'create', row?: MRT_Row<User>) => {
		if (action === 'create') {
			setSelectedModel('');
			setModelOptions([]);
		}
	};

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
		mantineCreateRowModalProps: {
			centered: true,
		},
		mantineEditRowModalProps: {
			centered: true,
		},
		onCreatingRowCancel: handleCreatingRowCancel,
		onCreatingRowSave: handleCreateUser,
		onEditingRowCancel: handleEditingRowCancel,
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

		renderDetailPanel: ({ row } : { row: any}) => (
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
				{authorizations.includes("update-users") && (
				<Tooltip label="Mettre à jour">
				<ActionIcon color={"green"} onClick={() => table.setEditingRow(row)}>
						<IconEdit />
				</ActionIcon>
				</Tooltip>
				)}
				{authorizations.includes("delete-users") && (
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
					{authorizations.includes("create-users") && (
						<Button
							onClick={() => {
								handleRowActionClick('create');
								table.setCreatingRow(true);
							}}
							leftSection={<IconPlus />}
						>
							Nouvelle Utilisateur
						</Button>
					)}
					{/*{authorizations.includes("create-users") && (*/}
					{/*<Menu*/}
					{/*	shadow={"md"}*/}
					{/*	// width={130}*/}
					{/*	trigger="hover"*/}
					{/*	openDelay={100}*/}
					{/*	closeDelay={400}*/}
					{/*>*/}
					{/*	<Menu.Target>*/}
					{/*		<Button*/}
					{/*			leftSection={<IconTableExport />}*/}
					{/*			rightSection={<IconDownload size={14} />}*/}
					{/*			variant={"filled"}*/}
					{/*		>*/}
					{/*			Exporter*/}
					{/*		</Button>*/}
					{/*	</Menu.Target>*/}

					{/*	<Menu.Dropdown>*/}
					{/*		<Menu.Label>Format PDF</Menu.Label>*/}
					{/*		<Menu.Item*/}
					{/*			//export all rows, including from the next page, (still respects filtering and sorting)*/}
					{/*			disabled={table.getPrePaginationRowModel().rows.length === 0}*/}
					{/*			leftSection={<IconFileTypePdf />}*/}
					{/*			onClick={() =>*/}
					{/*				handleExportRows(table.getPrePaginationRowModel().rows)*/}
					{/*			}*/}
					{/*		>*/}
					{/*			Exporter tout*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Item*/}
					{/*			disabled={table.getRowModel().rows.length === 0}*/}
					{/*			//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)*/}
					{/*			leftSection={<IconFileTypePdf />}*/}
					{/*			onClick={() => handleExportRows(table.getRowModel().rows)}*/}
					{/*		>*/}
					{/*			Exporter la page*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Item*/}
					{/*			disabled={*/}
					{/*				!table.getIsSomeRowsSelected() &&*/}
					{/*				!table.getIsAllRowsSelected()*/}
					{/*			}*/}
					{/*			//only export selected rows*/}
					{/*			leftSection={<IconFileTypePdf />}*/}
					{/*			onClick={() =>*/}
					{/*				handleExportRows(table.getSelectedRowModel().rows)*/}
					{/*			}*/}
					{/*		>*/}
					{/*			Exporter la selection*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Divider />*/}
					{/*		<Menu.Label>Format Excel</Menu.Label>*/}
					{/*		<Menu.Item*/}
					{/*			//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)*/}
					{/*			onClick={handleExportDataAsCSV}*/}
					{/*			leftSection={<IconFileTypeCsv />}*/}
					{/*		>*/}
					{/*			Exporter tout*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Item*/}
					{/*			disabled={table.getPrePaginationRowModel().rows.length === 0}*/}
					{/*			//export all rows, including from the next page, (still respects filtering and sorting)*/}
					{/*			onClick={() =>*/}
					{/*				handleExportRowsAsCSV(table.getPrePaginationRowModel().rows)*/}
					{/*			}*/}
					{/*			leftSection={<IconFileTypeCsv />}*/}
					{/*		>*/}
					{/*			Exporter toute les lignes*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Item*/}
					{/*			disabled={table.getRowModel().rows.length === 0}*/}
					{/*			//export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)*/}
					{/*			onClick={() => handleExportRowsAsCSV(table.getRowModel().rows)}*/}
					{/*			leftSection={<IconFileTypeCsv />}*/}
					{/*		>*/}
					{/*			Exporter toutes la pages*/}
					{/*		</Menu.Item>*/}
					{/*		<Menu.Item*/}
					{/*			disabled={*/}
					{/*				!table.getIsSomeRowsSelected() &&*/}
					{/*				!table.getIsAllRowsSelected()*/}
					{/*			}*/}
					{/*			//only export selected rows*/}
					{/*			onClick={() =>*/}
					{/*				handleExportRowsAsCSV(table.getSelectedRowModel().rows)*/}
					{/*			}*/}
					{/*			leftSection={<IconFileTypeCsv />}*/}
					{/*		>*/}
					{/*			Exporter la selection*/}
					{/*		</Menu.Item>*/}
					{/*	</Menu.Dropdown>*/}
					{/*</Menu>*/}
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

	// Place the useEffect hooks here, after table is defined
	// Reset selected model when creating a new user
	useEffect(() => {
		// Only run this effect when table is defined
		if (table) {
			const creatingRow = table.getState().creatingRow;
			if (!creatingRow) {
				setSelectedModel('');
				setModelOptions([]);
			}
		}
	}, [table?.getState().creatingRow]);

	// Reset selected model when the table state changes
	useEffect(() => {
		const creatingRow = table.getState().creatingRow;
		if (!creatingRow && isModelSelectInitialized) {
			setSelectedModel('');
			setModelOptions([]);
		} else if (creatingRow) {
			setIsModelSelectInitialized(true);
		}
	}, [table.getState().creatingRow, isModelSelectInitialized]);

	return <MantineReactTable table={table} />;
};

function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (user: User) => {
			// Ensure model_id is a string
			const userData = {
				...user,
				model_id: String(user.model_id)
			};

			const response = await fetch(innerUrl("/api/users/create"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
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
			// Ensure model_id is a string
			const userData = {
				...user,
				model_id: String(user.model_id)
			};

			const response = await fetch(
				innerUrl(`/api/users/${user.id}/update`),
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(userData),
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
				innerUrl(`/api/users/${userId}/delete`),
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
		model: string;
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
	email.includes('@') &&
	email.includes('.') &&
	email.length >= 5;

function validateUser(user: User, auths: string[] = []) {
	// Base validation for all users
	const baseValidation = {
		name: !validateRequired(user.name)
			? 'Le nom doit contenir entre 3 et 100 caractères'
			: undefined,
		email: !validateEmail(user.email)
			? 'Veuillez entrer un email valide'
			: undefined,
		password: !validateRequired(user.password!)
			? 'Le mot de passe doit contenir entre 3 et 100 caractères'
			: undefined,
	};

	// Additional validation for users with create-users-anywhere permission
	if (auths.includes("create-users-anywhere")) {
		return {
			...baseValidation,
			// Additional model validations would be handled in the form submission
		};
	}

	return baseValidation;
}

