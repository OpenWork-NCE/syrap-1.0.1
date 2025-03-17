"use client";

import { useState, useEffect } from "react";
import {
	Table,
	Group,
	ActionIcon,
	Text,
	Menu,
	TextInput,
	Stack,
	Pagination,
	Modal,
	Button,
	Select,
	Paper,
	Title,
	Badge,
	Tooltip,
	Loader,
	Alert,
	Divider,
	Box,
	ScrollArea,
} from "@mantine/core";
import {
	IconDotsVertical,
	IconDownload,
	IconEdit,
	IconTrash,
	IconSearch,
	IconRefresh,
	IconFilter,
	IconAlertCircle,
	IconSortAscending,
	IconSortDescending,
	IconFileUpload,
	IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FileDocument, FileType, FileFormData } from "@/types";
import {
	formatFileSize,
	formatDate,
	getFileTypeIcon,
	getFileTypeColor,
} from "@/app/lib/utils";
import { FileForm } from "./FileForm";

interface FileListProps {
	files: FileDocument[];
	total: number;
	page: number;
	onPageChange: (page: number) => void;
	onSearch: (query: string) => void;
	onRefresh: () => void;
	onDelete: (id: string) => Promise<void>;
	onEdit: (id: string, data: Partial<FileDocument>) => Promise<void>;
	onSort: (type: FileType | "all") => void;
	onUpload: () => void;
	isLoading: boolean;
}

export function FileList({
	files,
	total,
	page,
	onPageChange,
	onSearch,
	onRefresh,
	onDelete,
	onEdit,
	onSort,
	onUpload,
	isLoading,
}: FileListProps) {
	// Ensure files is always an array, even if undefined is passed
	const filesList = Array.isArray(files) ? files : [];

	const [editingFile, setEditingFile] = useState<FileDocument | null>(null);
	const [deleteConfirmFile, setDeleteConfirmFile] =
		useState<FileDocument | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [
		deleteModalOpened,
		{ open: openDeleteModal, close: closeDeleteModal },
	] = useDisclosure(false);
	const [
		uploadModalOpened,
		{ open: openUploadModal, close: closeUploadModal },
	] = useDisclosure(false);

	// Handle search with debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, onSearch]);

	const handleEdit = async (values: FileFormData) => {
		if (editingFile) {
			try {
				// Convert FileFormData to the format expected by the API
				const fileData: Partial<FileDocument> = {
					title: values.title,
					description: values.description,
					visibility: values.visibility as ("CENADI" | "MINESUP" | "IPES")[],
				};

				await onEdit(editingFile.id, fileData);
				notifications.show({
					title: "Succès",
					message: "Document modifié avec succès",
					color: "green",
				});
				closeEditModal();
				onRefresh(); // Refresh the list
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la modification du document",
					color: "red",
				});
			}
		}
	};

	const handleDelete = async () => {
		if (deleteConfirmFile) {
			try {
				await onDelete(deleteConfirmFile.id);
				notifications.show({
					title: "Succès",
					message: "Document supprimé avec succès",
					color: "green",
				});
				closeDeleteModal();
				onRefresh(); // Refresh the list
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la suppression du document",
					color: "red",
				});
			}
		}
	};

	const handleDownload = (id: string, filename: string) => {
		try {
			// Create a link to download the file
			const link = document.createElement("a");
			link.href = `/api/files/${id}/download`;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			notifications.show({
				title: "Téléchargement",
				message: "Téléchargement démarré",
				color: "blue",
			});
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Erreur lors du téléchargement du document",
				color: "red",
			});
		}
	};

	const toggleSortOrder = () => {
		setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		// Implement sorting logic here if needed
	};

	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="md">
				<Group justify="space-between">
					<Title order={3}>Liste des documents</Title>
				</Group>

				<Group>
					<TextInput
						placeholder="Rechercher..."
						leftSection={<IconSearch size={16} />}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.currentTarget.value)}
						style={{ flex: 1 }}
					/>
					<Tooltip label="Actualiser">
						<ActionIcon
							variant="light"
							color="blue"
							onClick={onRefresh}
							loading={isLoading}
						>
							<IconRefresh size={20} />
						</ActionIcon>
					</Tooltip>
					<Tooltip
						label={`Trier par date (${sortOrder === "asc" ? "croissant" : "décroissant"})`}
					>
						<ActionIcon variant="light" color="blue" onClick={toggleSortOrder}>
							{sortOrder === "asc" ? (
								<IconSortAscending size={20} />
							) : (
								<IconSortDescending size={20} />
							)}
						</ActionIcon>
					</Tooltip>
					<Select
						placeholder="Filtrer par type"
						leftSection={<IconFilter size={16} />}
						data={[
							{ value: "all", label: "Tous les types" },
							{ value: "pdf", label: "PDF" },
							{ value: "word", label: "Word" },
							{ value: "excel", label: "Excel" },
							{ value: "text", label: "Texte" },
							{ value: "zip", label: "ZIP" },
							{ value: "image", label: "Image" },
						]}
						onChange={(value) => onSort(value as FileType | "all")}
						clearable
						searchable
						style={{ width: 200 }}
					/>
				</Group>

				{isLoading ? (
					<Group justify="center" p="xl">
						<Loader size="md" />
						<Text>Chargement des documents...</Text>
					</Group>
				) : filesList.length === 0 ? (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title="Aucun document"
						color="gray"
						variant="light"
					>
						Aucun document trouvé. Utilisez le bouton "Ajouter un document" pour
						télécharger un nouveau document.
					</Alert>
				) : (
					<ScrollArea h={400}>
						<Table striped highlightOnHover withTableBorder withColumnBorders>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Type</Table.Th>
									<Table.Th>Titre</Table.Th>
									<Table.Th>Description</Table.Th>
									<Table.Th>Taille</Table.Th>
									<Table.Th>Auteur</Table.Th>
									<Table.Th>Date d'upload</Table.Th>
									<Table.Th>Visibilité</Table.Th>
									<Table.Th>Actions</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{filesList.map((file) => {
									const Icon = getFileTypeIcon(file.type);
									const color = getFileTypeColor(file.type);
									return (
										<Table.Tr key={file.id}>
											<Table.Td>
												<Tooltip label={file.type.toUpperCase()}>
													<Box>
														<Icon size={20} color={color} />
													</Box>
												</Tooltip>
											</Table.Td>
											<Table.Td>
												<Text fw={500}>{file.title}</Text>
											</Table.Td>
											<Table.Td>
												<Text lineClamp={2}>{file.description}</Text>
											</Table.Td>
											<Table.Td>{formatFileSize(file.size)}</Table.Td>
											<Table.Td>{file.author}</Table.Td>
											<Table.Td>{formatDate(file.uploadDate)}</Table.Td>
											<Table.Td>
												<Group gap="xs">
													{file.visibility.map((v) => (
														<Badge key={v} size="sm" variant="light">
															{v}
														</Badge>
													))}
												</Group>
											</Table.Td>
											<Table.Td>
												<Group gap="xs">
													<Tooltip label="Modifier">
														<ActionIcon
															variant="subtle"
															color="blue"
															onClick={() => {
																setEditingFile(file);
																openEditModal();
															}}
														>
															<IconEdit size={18} />
														</ActionIcon>
													</Tooltip>
													<Tooltip label="Supprimer">
														<ActionIcon
															variant="subtle"
															color="red"
															onClick={() => {
																setDeleteConfirmFile(file);
																openDeleteModal();
															}}
														>
															<IconTrash size={18} />
														</ActionIcon>
													</Tooltip>
													<Tooltip label="Télécharger">
														<ActionIcon
															variant="subtle"
															color="green"
															onClick={() =>
																handleDownload(file.id, file.title)
															}
														>
															<IconDownload size={18} />
														</ActionIcon>
													</Tooltip>
												</Group>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</ScrollArea>
				)}

				{total > 0 && (
					<Group justify="center">
						<Pagination
							total={Math.ceil(total / 10)}
							value={page}
							onChange={onPageChange}
							radius="md"
							withEdges
						/>
						<Text size="sm" c="dimmed">
							Affichage de {filesList.length} sur {total} documents
						</Text>
					</Group>
				)}
			</Stack>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={closeEditModal}
				title="Modifier le document"
				size="lg"
				padding="lg"
				radius="md"
				centered
			>
				{editingFile && (
					<FileForm
						initialData={editingFile}
						onSubmit={handleEdit}
						onCancel={closeEditModal}
					/>
				)}
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				opened={deleteModalOpened}
				onClose={closeDeleteModal}
				title="Confirmer la suppression"
				size="md"
				padding="lg"
				radius="md"
				centered
			>
				<Stack>
					<Alert
						icon={<IconAlertCircle size={16} />}
						title="Attention"
						color="red"
						variant="light"
					>
						Êtes-vous sûr de vouloir supprimer le document "
						{deleteConfirmFile?.title}" ?
						<Text size="sm" mt="xs">
							Cette action est irréversible.
						</Text>
					</Alert>
					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeDeleteModal}>
							Annuler
						</Button>
						<Button color="red" onClick={handleDelete}>
							Supprimer
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Upload Modal */}
			<Modal
				opened={uploadModalOpened}
				onClose={closeUploadModal}
				title="Ajouter un document"
				size="lg"
				padding="lg"
				radius="md"
				centered
			>
				<FileForm
					onSubmit={async (values) => {
						try {
							// Create FormData
							const formData = new FormData();
							if (values.file) {
								formData.append("file", values.file);
							}
							formData.append("title", values.title);
							formData.append("description", values.description);
							values.visibility.forEach((v) => {
								formData.append("visibility[]", v);
							});

							// Make API request
							const response = await fetch("/api/files/upload", {
								method: "POST",
								body: formData,
							});

							if (!response.ok) {
								throw new Error("Failed to upload file");
							}

							// Close modal and refresh list
							closeUploadModal();
							onRefresh();

							notifications.show({
								title: "Succès",
								message: "Document téléchargé avec succès",
								color: "green",
							});
						} catch (error) {
							notifications.show({
								title: "Erreur",
								message: "Erreur lors du téléchargement du document",
								color: "red",
							});
						}
					}}
					onCancel={closeUploadModal}
				/>
			</Modal>
		</Paper>
	);
}
