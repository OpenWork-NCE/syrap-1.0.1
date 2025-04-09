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
	UnstyledButton,
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
	IconFileUpload,
	IconChevronUp,
	IconChevronDown,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FileDocument, FileType, FileFormData } from "@/types";
import {
	formatFileSize,
	formatDate,
	getFileTypeIcon,
	getFileTypeColor,
	formatDateToFrench,
	showConfirmationDialog,
} from "@/app/lib/utils";
import { FileForm } from "./FileForm";

interface FileListProps {
	files: FileDocument[];
	total: number;
	page: number;
	onPageChange: (page: number) => void;
	onSearch: (query: string) => void;
	onRefresh: () => void;
	onDelete: (id: string) => void;
	onEdit: (id: string, data: Partial<FileDocument>) => void;
	onSort: (type: FileType | "all") => void;
	onUpload: () => void;
	isLoading: boolean;
	sortOrder: "asc" | "desc";
	onToggleSort: () => void;
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
	sortOrder,
	onToggleSort,
}: FileListProps) {
	// Ensure files is always an array, even if undefined is passed
	const filesList = Array.isArray(files) ? files : [];

	const [editingFile, setEditingFile] = useState<FileDocument | null>(null);
	const [deleteConfirmFile, setDeleteConfirmFile] =
		useState<FileDocument | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [fileTypeFilter, setFileTypeFilter] = useState<FileType | "all">("all");
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [
		deleteModalOpened,
		{ open: openDeleteModal, close: closeDeleteModal },
	] = useDisclosure(false);
	const [localLoading, setLocalLoading] = useState(false);

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
				setLocalLoading(true);
				// Convert FileFormData to the format expected by the API
				const fileData: Partial<FileDocument> = {
					title: values.title,
					description: values.description,
				};

				await onEdit(editingFile.id, fileData);
				notifications.show({
					title: "Succès",
					message: "Document modifié avec succès",
					color: "green",
				});
				closeEditModal();
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la modification du document",
					color: "red",
				});
			} finally {
				setLocalLoading(false);
			}
		}
	};

	const handleDelete = async () => {
		if (deleteConfirmFile) {
			try {
				setLocalLoading(true);
				await onDelete(deleteConfirmFile.id);
				notifications.show({
					title: "Succès",
					message: "Document supprimé avec succès",
					color: "green",
				});
				closeDeleteModal();
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la suppression du document",
					color: "red",
				});
			} finally {
				setLocalLoading(false);
			}
		}
	};

	const handleDownload = async (downloadUrl: string, fileName: string) => {
		try {
			// Make API call to download
			const response = await fetch(`/api/files/download?download_url=${encodeURIComponent(downloadUrl)}`);
			
			if (!response.ok) {
				throw new Error('Download failed');
			}
			
			// Create a blob from the response
			const blob = await response.blob();
			
			// Create a download link and trigger download
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(link);
		} catch (error) {
			console.error("Download error:", error);
			// Show error notification
		}
	};

	const toggleSortOrder = () => {
		if (onToggleSort) {
			onToggleSort();
		}
	};

	const handleFileTypeChange = (value: string | null) => {
		const newType = (value || "all") as FileType | "all";
		setFileTypeFilter(newType);
		onSort(newType);
	};

	const confirmDelete = (id: string) => {
		showConfirmationDialog({
			title: "Confirmer la suppression",
			message: "Êtes-vous sûr de vouloir supprimer ce fichier?",
			confirmLabel: "Supprimer",
			cancelLabel: "Annuler",
			onConfirm: () => onDelete(id),
		});
	};

	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="md">
				<Group justify="space-between">
					<Title order={3}>Liste des documents</Title>
					<Button 
						leftSection={<IconFileUpload/>}
						onClick={onUpload}
						disabled={isLoading || localLoading}
					>
						Ajouter un document
					</Button>
				</Group>

				<Group>
					<TextInput
						size={"md"}
						placeholder="Rechercher..."
						leftSection={<IconSearch size={18} />}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.currentTarget.value)}
						style={{ flex: 1 }}
						disabled={isLoading || localLoading}
					/>
					<Tooltip label="Actualiser">
						<ActionIcon
							variant="light"
							color="blue"
							onClick={onRefresh}
							loading={isLoading || localLoading}
						>
							<IconRefresh />
						</ActionIcon>
					</Tooltip>
					<Tooltip
						label={`Trier par date (${sortOrder === "asc" ? "croissant" : "décroissant"})`}
					>
						<ActionIcon 
							variant="light" 
							color="blue" 
							onClick={toggleSortOrder}
							disabled={isLoading || localLoading}
						>
							{sortOrder === "asc" ? (
								<IconChevronUp />
							) : (
								<IconChevronDown />
							)}
						</ActionIcon>
					</Tooltip>
					<Select
						placeholder="Filtrer par type"
						leftSection={<IconFilter size={18} />}
						size={"md"}
						data={[
							{ value: "all", label: "Tous les types" },
							{ value: "pdf", label: "PDF" },
							{ value: "word", label: "Word" },
							{ value: "excel", label: "Excel" },
							{ value: "text", label: "Texte" },
							{ value: "zip", label: "ZIP" },
							{ value: "image", label: "Image" },
						]}
						value={fileTypeFilter}
						onChange={handleFileTypeChange}
						clearable={false}
						searchable
						style={{ width: 200 }}
						disabled={isLoading || localLoading}
					/>
				</Group>

				{isLoading ? (
					<Group justify="center" p="xl">
						<Loader size="md" />
						<Text>Chargement des documents...</Text>
					</Group>
				) : filesList.length === 0 ? (
					<Alert
						icon={<IconAlertCircle size={20} />}
						title="Aucun document"
						color="gray"
						variant="light"
					>
						Aucun document trouvé. Utilisez le bouton "Ajouter un document" pour
						télécharger un nouveau document.
					</Alert>
				) : (
					<ScrollArea h={'60vh'}>
						<Table striped highlightOnHover withColumnBorders verticalSpacing={'sm'} >
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
														<Icon color={color} />
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
															disabled={localLoading}
														>
															<IconEdit />
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
															disabled={localLoading}
														>
															<IconTrash />
														</ActionIcon>
													</Tooltip>
													<Tooltip label="Télécharger">
														<ActionIcon
															variant="subtle"
															color="green"
															onClick={() =>
																handleDownload(file.url, file.title)
															}
															disabled={localLoading}
														>
															<IconDownload />
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
							disabled={isLoading || localLoading}
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
						<Button variant="light" onClick={closeDeleteModal} disabled={localLoading}>
							Annuler
						</Button>
						<Button color="red" onClick={handleDelete} loading={localLoading}>
							Supprimer
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Paper>
	);
}
