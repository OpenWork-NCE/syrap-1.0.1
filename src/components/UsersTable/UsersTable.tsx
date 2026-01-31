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
	Divider,
	Flex,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconCheck,
	IconEdit,
	IconPlus,
	IconRefresh,
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
import { Profile, User } from "@/types";
import { innerUrl } from "@/app/lib/utils";

// ============================================================================
// Types
// ============================================================================

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
}

// Types d'organisation disponibles
const ORGANISATION_TYPES = [
	{ value: "CENADI", label: "CENADI", backendModel: "cenadi" },
	{ value: "MINESUP", label: "MINESUP", backendModel: "minsup" },
	{ value: "Université", label: "Université", backendModel: "university" },
	{ value: "IPES", label: "IPES", backendModel: "ipes" },
] as const;

// Convertir le type d'organisation frontend vers le model backend
const getBackendModel = (orgType: string): string => {
	const found = ORGANISATION_TYPES.find((t) => t.value === orgType);
	return found?.backendModel || "cenadi";
};

// ============================================================================
// Hooks de données
// ============================================================================

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

// ============================================================================
// Validation
// ============================================================================

const validateRequired = (value: string | undefined | null) =>
	!!value && value.length > 3 && value.length <= 100;

const validateEmail = (email: string | undefined | null) =>
	!!email && email.length >= 5 && email.includes("@") && email.includes(".");

function validateUser(
	user: Record<string, any>,
	isUpdate: boolean = false
): Record<string, string | undefined> {
	const errors: Record<string, string | undefined> = {
		name: !validateRequired(user.name)
			? "Le nom doit contenir entre 3 et 100 caractères"
			: undefined,
		email: !validateEmail(user.email)
			? "Veuillez entrer un email valide"
			: undefined,
	};

	// Password requis seulement pour la création
	if (!isUpdate) {
		errors.password = !validateRequired(user.password)
			? "Le mot de passe doit contenir entre 3 et 100 caractères"
			: undefined;
	} else if (user.password && user.password.length > 0) {
		errors.password = !validateRequired(user.password)
			? "Le mot de passe doit contenir entre 3 et 100 caractères"
			: undefined;
	}

	return errors;
}

// ============================================================================
// Composant principal
// ============================================================================

type UserTableProps = {
	authorizations: string[];
	organisation: {
		id: string;
		name: string;
		slug: string;
		type: string;
	};
};

const Section = ({ authorizations, organisation }: UserTableProps) => {
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string | undefined>
	>({});

	// Permission pour gérer les utilisateurs de toutes les organisations
	const canManageAllOrgs = authorizations?.includes("create-users-anywhere");

	// Charger les profils (rôles)
	const { data: profilesData } = useGetProfiles();
	const fetchedProfiles = profilesData?.data ?? [];

	// ============================================================================
	// Définition des colonnes
	// ============================================================================

	const columns = useMemo<MRT_ColumnDef<User>[]>(() => {
		const baseColumns: MRT_ColumnDef<User>[] = [
			{
				accessorKey: "id",
				header: "ID",
				enableEditing: false,
				size: 80,
			},
			{
				accessorKey: "name",
				header: "Nom",
				mantineEditTextInputProps: {
					required: true,
					error: validationErrors?.name,
					onFocus: () =>
						setValidationErrors((prev) => ({ ...prev, name: undefined })),
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
						setValidationErrors((prev) => ({ ...prev, email: undefined })),
				},
			},
		];

		// Colonne Organisation - seulement si permission de gérer toutes les orgs
		const orgColumn: MRT_ColumnDef<User>[] = canManageAllOrgs
			? [
					{
						id: "organisationType",
						accessorFn: (row: any) => row.organisation?.type || "",
						header: "Organisation",
						Cell: ({ row }: any) => row.original.organisation?.type || "-",
						editVariant: "select",
						mantineEditSelectProps: {
							data: ORGANISATION_TYPES.map((t) => ({
								value: t.value,
								label: t.label,
							})),
							error: validationErrors?.organisationType,
						},
					} as MRT_ColumnDef<User>,
			  ]
			: [];

		const otherColumns: MRT_ColumnDef<User>[] = [
			{
				accessorKey: "roles",
				header: "Rôles",
				accessorFn: () => [],
				Cell: ({ row }: any) =>
					row.original.roles?.map((r: any) => r.name).join(", ") || "-",
				editVariant: "multi-select",
				mantineEditSelectProps: {
					data: fetchedProfiles.map((p) => ({
						value: String(p.id),
						label: p.name,
					})),
				},
			},
			{
				accessorKey: "password",
				header: "Mot de passe",
				Cell: () => "••••••••",
				mantineEditTextInputProps: {
					type: "password",
					error: validationErrors?.password,
					onFocus: () =>
						setValidationErrors((prev) => ({ ...prev, password: undefined })),
				},
			},
		];

		return [...baseColumns, ...orgColumn, ...otherColumns];
	}, [validationErrors, fetchedProfiles, canManageAllOrgs]);

	// ============================================================================
	// État de la table
	// ============================================================================

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
		[]
	);
	const [columnFilterFns, setColumnFilterFns] =
		useState<MRT_ColumnFilterFnsState>(
			Object.fromEntries(
				columns.map(({ accessorKey }) => [accessorKey, "contains"])
			)
		);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<MRT_SortingState>([]);

	const { data, isError, isFetching, isLoading, refetch } = useGetUsers({
		columnFilterFns,
		columnFilters,
		globalFilter,
		sorting,
	});

	const fetchedUsers = data?.data ?? [];

	// ============================================================================
	// Mutations
	// ============================================================================

	const { mutateAsync: createUser, isPending: isCreatingUser } =
		useCreateUser();
	const { mutateAsync: updateUser, isPending: isUpdatingUser } =
		useUpdateUser();
	const { mutateAsync: deleteUser, isPending: isDeletingUser } =
		useDeleteUser();

	// ============================================================================
	// Handlers
	// ============================================================================

	const handleCreateUser: MRT_TableOptions<User>["onCreatingRowSave"] = async ({
		values,
		exitCreatingMode,
	}) => {
		const errors = validateUser(values, false);
		if (Object.values(errors).some((e) => e)) {
			setValidationErrors(errors);
			return;
		}

		// Récupérer le type d'organisation sélectionné
		const orgType = values.organisationType;

		if (canManageAllOrgs) {
			if (!orgType) {
				setValidationErrors({
					...errors,
					organisationType: "Veuillez sélectionner une organisation",
				});
				return;
			}

			setValidationErrors({});
			await createUser({
				name: values.name,
				email: values.email,
				password: values.password,
				roles: values.roles,
				model: getBackendModel(orgType),
			});
		} else {
			// Utilisateur normal: utiliser son organisation actuelle
			setValidationErrors({});
			await createUser({
				name: values.name,
				email: values.email,
				password: values.password,
				roles: values.roles,
				model: getBackendModel(organisation?.type || "CENADI"),
				model_id: organisation?.id,
			});
		}

		exitCreatingMode();
	};

	const handleSaveUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
		values,
		table,
		row,
	}) => {
		const errors = validateUser(values, true);
		if (Object.values(errors).some((e) => e)) {
			setValidationErrors(errors);
			return;
		}

		setValidationErrors({});

		// Préparer les données
		const updateData: Record<string, any> = {
			id: row.original.id,
			name: values.name,
			email: values.email,
			roles: values.roles,
		};

		// Ajouter le password seulement s'il est fourni
		if (values.password && values.password.length > 0) {
			updateData.password = values.password;
		}

		// Ajouter le model si l'utilisateur peut gérer toutes les orgs
		if (canManageAllOrgs && values.organisationType) {
			updateData.model = getBackendModel(values.organisationType);
		}

		await updateUser(updateData);
		table.setEditingRow(null);
	};

	const handleCreatingRowCancel = () => setValidationErrors({});
	const handleEditingRowCancel = () => setValidationErrors({});

	const openDeleteConfirmModal = (row: MRT_Row<User>) =>
		modals.openConfirmModal({
			title: "Confirmer la suppression",
			children: (
				<Text>
					Êtes-vous sûr de vouloir supprimer {row.original.name} ? Cette action
					est irréversible.
				</Text>
			),
			labels: { confirm: "Supprimer", cancel: "Annuler" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteUser(row.original.id),
		});

	// ============================================================================
	// Configuration de la table
	// ============================================================================

	const table = useCustomTable({
		columns,
		data: fetchedUsers,
		createDisplayMode: "row",
		editDisplayMode: "row",
		mantineSearchTextInputProps: {
			placeholder: "Rechercher un utilisateur",
		},
		getRowId: (row) => row.id,
		mantineToolbarAlertBannerProps: isError
			? { color: "red", children: "Erreur de chargement des données" }
			: undefined,
		mantineTableContainerProps: { style: { minHeight: "auto" } },
		onCreatingRowCancel: handleCreatingRowCancel,
		onCreatingRowSave: handleCreateUser,
		onEditingRowCancel: handleEditingRowCancel,
		onEditingRowSave: handleSaveUser,

		renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Nouvel Utilisateur</Title>
				{internalEditComponents}
				<Flex justify="flex-end" mt="xl">
					<MRT_EditActionButtons variant="text" table={table} row={row} />
				</Flex>
			</Stack>
		),

		renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
			<Stack>
				<Title order={3}>Modifier l'Utilisateur</Title>
				{internalEditComponents}
				<Flex justify="flex-end" mt="xl">
					<MRT_EditActionButtons variant="text" table={table} row={row} />
				</Flex>
			</Stack>
		),

		renderDetailPanel: ({ row }: any) => (
			<Box p="md">
				<Title order={5}>{row.original.name}</Title>
				<Divider my="sm" />
				<Text size="sm">
					<strong>Email:</strong> {row.original.email}
				</Text>
				<Text size="sm">
					<strong>Organisation:</strong>{" "}
					{row.original.organisation?.name || "-"}
				</Text>
				<Text size="sm">
					<strong>Rôles:</strong>{" "}
					{row.original.roles?.map((r: any) => r.name).join(", ") || "-"}
				</Text>
			</Box>
		),

		renderRowActions: ({ row, table }) => (
			<Flex gap="md">
				{authorizations?.includes("update-users") && (
					<Tooltip label="Modifier">
						<ActionIcon
							color="green"
							onClick={() => table.setEditingRow(row)}
						>
							<IconEdit />
						</ActionIcon>
					</Tooltip>
				)}
				{authorizations?.includes("delete-users") && (
					<Tooltip label="Supprimer">
						<ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
							<IconTrash />
						</ActionIcon>
					</Tooltip>
				)}
			</Flex>
		),

		renderTopToolbarCustomActions: ({ table }) => (
			<Flex gap={4} align="center">
				<Tooltip label="Rafraîchir">
					<ActionIcon onClick={() => refetch()}>
						<IconRefresh />
					</ActionIcon>
				</Tooltip>
				{authorizations?.includes("create-users") && (
					<Button
						onClick={() => table.setCreatingRow(true)}
						leftSection={<IconPlus />}
					>
						Nouvel Utilisateur
					</Button>
				)}
			</Flex>
		),

		state: {
			columnFilterFns,
			columnFilters,
			globalFilter,
			isLoading,
			isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			sorting,
		},
	});

	return <MantineReactTable table={table} />;
};

// ============================================================================
// Mutations hooks
// ============================================================================

function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (userData: Record<string, any>) => {
			const response = await fetch(innerUrl("/api/users/create"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(userData),
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({}));
				throw new Error(error.message || "Erreur lors de la création");
			}

			notifications.show({
				color: "teal",
				title: "Utilisateur créé",
				message: "L'utilisateur a été créé avec succès",
				icon: <IconCheck />,
				autoClose: 2000,
			});

			return response.json();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (userData: Record<string, any>) => {
			const response = await fetch(
				innerUrl(`/api/users/${userData.id}/update`),
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(userData),
				}
			);

			if (!response.ok) {
				const error = await response.json().catch(() => ({}));
				throw new Error(error.message || "Erreur lors de la mise à jour");
			}

			notifications.show({
				color: "green",
				title: "Utilisateur modifié",
				message: "L'utilisateur a été modifié avec succès",
				icon: <IconCheck />,
				autoClose: 2000,
			});

			return response.json();
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
			const response = await fetch(innerUrl(`/api/users/${userId}/delete`), {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression");
			}

			notifications.show({
				color: "red",
				title: "Utilisateur supprimé",
				message: "L'utilisateur a été supprimé",
				icon: <IconCheck />,
				autoClose: 2000,
			});

			return response.json();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

// ============================================================================
// Export
// ============================================================================

type ExportedProps = {
	authorizations: string[];
	institution: {
		id: string;
		name: string;
		slug: string;
		type?: string;
		model?: string; // Compatibilité avec l'ancien format
	};
};

const UserTable = ({ authorizations, institution }: ExportedProps) => (
	<Section
		authorizations={authorizations}
		organisation={{
			id: institution.id,
			name: institution.name,
			slug: institution.slug,
			type: institution.type || institution.model || "",
		}}
	/>
);

export default UserTable;
