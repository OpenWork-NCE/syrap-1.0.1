"use client";

import { useState, useCallback } from "react";
import {
	Stack,
	Group,
	Text,
	ActionIcon,
	UnstyledButton,
	Collapse,
	Paper,
	TextInput,
	Button,
	Modal,
	Loader,
	Menu,
	Tooltip,
	Badge,
	Box,
	ScrollArea,
} from "@mantine/core";
import {
	IconFolder,
	IconFolderOpen,
	IconChevronRight,
	IconChevronDown,
	IconPlus,
	IconEdit,
	IconTrash,
	IconHome,
	IconDotsVertical,
	IconFolderPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Folder, FolderFormData } from "@/types";

interface FolderTreeItemProps {
	folder: Folder;
	level: number;
	selectedFolderId: string | null;
	onSelect: (folder: Folder | null) => void;
	onCreateSubfolder: (parentId: string) => void;
	onEdit: (folder: Folder) => void;
	onDelete: (folder: Folder) => void;
	expandedFolders: Set<string>;
	toggleExpanded: (folderId: string) => void;
}

function FolderTreeItem({
	folder,
	level,
	selectedFolderId,
	onSelect,
	onCreateSubfolder,
	onEdit,
	onDelete,
	expandedFolders,
	toggleExpanded,
}: FolderTreeItemProps) {
	const isExpanded = expandedFolders.has(folder.id);
	const isSelected = selectedFolderId === folder.id;
	const hasChildren = folder.children && folder.children.length > 0;

	return (
		<Box>
			<Group
				gap={0}
				wrap="nowrap"
				style={{
					paddingLeft: `${level * 16}px`,
					backgroundColor: isSelected ? "var(--mantine-color-blue-light)" : "transparent",
					borderRadius: "var(--mantine-radius-sm)",
					cursor: "pointer",
				}}
			>
				<ActionIcon
					variant="subtle"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						if (hasChildren) {
							toggleExpanded(folder.id);
						}
					}}
					style={{ visibility: hasChildren ? "visible" : "hidden" }}
				>
					{isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
				</ActionIcon>

				<UnstyledButton
					onClick={() => onSelect(folder)}
					style={{ flex: 1, padding: "6px 8px" }}
				>
					<Group gap="xs" wrap="nowrap">
						{isExpanded ? (
							<IconFolderOpen size={18} color="var(--mantine-color-yellow-6)" />
						) : (
							<IconFolder size={18} color="var(--mantine-color-yellow-6)" />
						)}
						<Text size="sm" truncate fw={isSelected ? 600 : 400}>
							{folder.name}
						</Text>
						{folder.documents_count > 0 && (
							<Badge size="xs" variant="light" color="gray">
								{folder.documents_count}
							</Badge>
						)}
					</Group>
				</UnstyledButton>

				<Menu shadow="md" width={180} position="right-start">
					<Menu.Target>
						<ActionIcon
							variant="subtle"
							size="sm"
							onClick={(e) => e.stopPropagation()}
						>
							<IconDotsVertical size={14} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconFolderPlus size={14} />}
							onClick={(e) => {
								e.stopPropagation();
								onCreateSubfolder(folder.id);
							}}
						>
							Nouveau sous-dossier
						</Menu.Item>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={(e) => {
								e.stopPropagation();
								onEdit(folder);
							}}
						>
							Renommer
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							color="red"
							leftSection={<IconTrash size={14} />}
							onClick={(e) => {
								e.stopPropagation();
								onDelete(folder);
							}}
						>
							Supprimer
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>

			{hasChildren && (
				<Collapse in={isExpanded}>
					{folder.children?.map((child) => (
						<FolderTreeItem
							key={child.id}
							folder={child}
							level={level + 1}
							selectedFolderId={selectedFolderId}
							onSelect={onSelect}
							onCreateSubfolder={onCreateSubfolder}
							onEdit={onEdit}
							onDelete={onDelete}
							expandedFolders={expandedFolders}
							toggleExpanded={toggleExpanded}
						/>
					))}
				</Collapse>
			)}
		</Box>
	);
}

interface FolderTreeProps {
	folders: Folder[];
	selectedFolderId: string | null;
	onSelectFolder: (folder: Folder | null) => void;
	onCreateFolder: (data: FolderFormData) => Promise<void>;
	onUpdateFolder: (id: string, data: Partial<FolderFormData>) => Promise<void>;
	onDeleteFolder: (id: string) => Promise<void>;
	isLoading?: boolean;
	institution?: { id: string; name: string; type: string } | null;
}

export function FolderTree({
	folders,
	selectedFolderId,
	onSelectFolder,
	onCreateFolder,
	onUpdateFolder,
	onDeleteFolder,
	isLoading = false,
	institution,
}: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
		useDisclosure(false);
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
		useDisclosure(false);
	const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(null);
	const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
	const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderDescription, setNewFolderDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const toggleExpanded = useCallback((folderId: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) {
				next.delete(folderId);
			} else {
				next.add(folderId);
			}
			return next;
		});
	}, []);

	const handleCreateSubfolder = useCallback((parentId: string) => {
		setParentIdForCreate(parentId);
		setNewFolderName("");
		setNewFolderDescription("");
		openCreateModal();
	}, [openCreateModal]);

	const handleCreateRootFolder = useCallback(() => {
		setParentIdForCreate(null);
		setNewFolderName("");
		setNewFolderDescription("");
		openCreateModal();
	}, [openCreateModal]);

	const handleEdit = useCallback((folder: Folder) => {
		setFolderToEdit(folder);
		setNewFolderName(folder.name);
		setNewFolderDescription(folder.description || "");
		openEditModal();
	}, [openEditModal]);

	const handleDelete = useCallback((folder: Folder) => {
		setFolderToDelete(folder);
		openDeleteModal();
	}, [openDeleteModal]);

	const submitCreate = async () => {
		if (!newFolderName.trim()) {
			notifications.show({
				title: "Erreur",
				message: "Le nom du dossier est requis",
				color: "red",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await onCreateFolder({
				name: newFolderName.trim(),
				description: newFolderDescription.trim() || undefined,
				parent_id: parentIdForCreate,
				model: institution?.type?.toLowerCase(),
				model_id: institution?.id,
			});
			notifications.show({
				title: "Succès",
				message: "Dossier créé avec succès",
				color: "green",
			});
			closeCreateModal();
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Impossible de créer le dossier",
				color: "red",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitEdit = async () => {
		if (!folderToEdit || !newFolderName.trim()) {
			notifications.show({
				title: "Erreur",
				message: "Le nom du dossier est requis",
				color: "red",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await onUpdateFolder(folderToEdit.id, {
				name: newFolderName.trim(),
				description: newFolderDescription.trim() || undefined,
			});
			notifications.show({
				title: "Succès",
				message: "Dossier modifié avec succès",
				color: "green",
			});
			closeEditModal();
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Impossible de modifier le dossier",
				color: "red",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitDelete = async () => {
		if (!folderToDelete) return;

		setIsSubmitting(true);
		try {
			await onDeleteFolder(folderToDelete.id);
			notifications.show({
				title: "Succès",
				message: "Dossier supprimé avec succès",
				color: "green",
			});
			if (selectedFolderId === folderToDelete.id) {
				onSelectFolder(null);
			}
			closeDeleteModal();
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Impossible de supprimer le dossier",
				color: "red",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Paper p="md" withBorder radius="md" h="100%">
			<Stack gap="md" h="100%">
				<Group justify="space-between">
					<Text fw={600} size="sm">
						Dossiers
					</Text>
					<Tooltip label="Nouveau dossier">
						<ActionIcon
							variant="light"
							color="blue"
							size="sm"
							onClick={handleCreateRootFolder}
							disabled={isLoading}
						>
							<IconPlus size={14} />
						</ActionIcon>
					</Tooltip>
				</Group>

				{isLoading ? (
					<Group justify="center" py="xl">
						<Loader size="sm" />
					</Group>
				) : (
					<ScrollArea h="calc(100% - 60px)" offsetScrollbars>
						<Stack gap={2}>
							{/* Root option */}
							<UnstyledButton
								onClick={() => onSelectFolder(null)}
								style={{
									padding: "6px 8px",
									borderRadius: "var(--mantine-radius-sm)",
									backgroundColor:
										selectedFolderId === null
											? "var(--mantine-color-blue-light)"
											: "transparent",
								}}
							>
								<Group gap="xs">
									<IconHome size={18} color="var(--mantine-color-gray-6)" />
									<Text size="sm" fw={selectedFolderId === null ? 600 : 400}>
										Tous les documents
									</Text>
								</Group>
							</UnstyledButton>

							{/* Folder tree */}
							{folders.map((folder) => (
								<FolderTreeItem
									key={folder.id}
									folder={folder}
									level={0}
									selectedFolderId={selectedFolderId}
									onSelect={onSelectFolder}
									onCreateSubfolder={handleCreateSubfolder}
									onEdit={handleEdit}
									onDelete={handleDelete}
									expandedFolders={expandedFolders}
									toggleExpanded={toggleExpanded}
								/>
							))}

							{folders.length === 0 && (
								<Text size="sm" c="dimmed" ta="center" py="md">
									Aucun dossier
								</Text>
							)}
						</Stack>
					</ScrollArea>
				)}
			</Stack>

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={closeCreateModal}
				title={parentIdForCreate ? "Nouveau sous-dossier" : "Nouveau dossier"}
				centered
			>
				<Stack gap="md">
					<TextInput
						label="Nom du dossier"
						placeholder="Ex: Rapports 2024"
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.currentTarget.value)}
						required
						disabled={isSubmitting}
					/>
					<TextInput
						label="Description (optionnel)"
						placeholder="Description du dossier"
						value={newFolderDescription}
						onChange={(e) => setNewFolderDescription(e.currentTarget.value)}
						disabled={isSubmitting}
					/>
					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeCreateModal} disabled={isSubmitting}>
							Annuler
						</Button>
						<Button onClick={submitCreate} loading={isSubmitting}>
							Créer
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={closeEditModal}
				title="Modifier le dossier"
				centered
			>
				<Stack gap="md">
					<TextInput
						label="Nom du dossier"
						placeholder="Ex: Rapports 2024"
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.currentTarget.value)}
						required
						disabled={isSubmitting}
					/>
					<TextInput
						label="Description (optionnel)"
						placeholder="Description du dossier"
						value={newFolderDescription}
						onChange={(e) => setNewFolderDescription(e.currentTarget.value)}
						disabled={isSubmitting}
					/>
					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeEditModal} disabled={isSubmitting}>
							Annuler
						</Button>
						<Button onClick={submitEdit} loading={isSubmitting}>
							Enregistrer
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Delete Modal */}
			<Modal
				opened={deleteModalOpened}
				onClose={closeDeleteModal}
				title="Supprimer le dossier"
				centered
			>
				<Stack gap="md">
					<Text>
						Êtes-vous sûr de vouloir supprimer le dossier "{folderToDelete?.name}" ?
					</Text>
					{folderToDelete && (folderToDelete.children_count > 0 || folderToDelete.documents_count > 0) && (
						<Text size="sm" c="red">
							Ce dossier contient {folderToDelete.children_count > 0 && `${folderToDelete.children_count} sous-dossier(s)`}
							{folderToDelete.children_count > 0 && folderToDelete.documents_count > 0 && " et "}
							{folderToDelete.documents_count > 0 && `${folderToDelete.documents_count} document(s)`}.
							Ils seront également supprimés.
						</Text>
					)}
					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeDeleteModal} disabled={isSubmitting}>
							Annuler
						</Button>
						<Button color="red" onClick={submitDelete} loading={isSubmitting}>
							Supprimer
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Paper>
	);
}
