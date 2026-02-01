"use client";

import { useState, useCallback, useEffect } from "react";
import {
	Grid,
	Stack,
	Modal,
	Tabs,
	Paper,
	Group,
	Text,
	Badge,
	Loader,
	Alert,
	Button,
	ActionIcon,
	Tooltip,
} from "@mantine/core";
import {
	IconFolder,
	IconFile,
	IconTrash,
	IconRefresh,
	IconAlertCircle,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

import { FileDocument, FileFormData, Folder, FolderFormData, DocumentVersion } from "@/types";
import { FileList } from "./FileList";
import { FileForm } from "./FileForm";
import { FolderTree } from "./FolderTree";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { VersionHistoryModal } from "./VersionHistory";
import { innerUrl } from "@/app/lib/utils";

// ===== MOCK DATA FOR DEMO =====
const MOCK_FOLDERS: Folder[] = [
	{
		id: "1",
		name: "Rapports 2024",
		description: "Rapports annuels et trimestriels",
		parent_id: null,
		owner: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
		scope: { type: "minsup", id: "1" },
		path: "Rapports 2024",
		breadcrumbs: [{ id: "1", name: "Rapports 2024" }],
		children_count: 2,
		documents_count: 3,
		children: [
			{
				id: "2",
				name: "Trimestriels",
				description: "Rapports trimestriels",
				parent_id: "1",
				owner: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
				scope: { type: "minsup", id: "1" },
				path: "Rapports 2024 / Trimestriels",
				breadcrumbs: [{ id: "1", name: "Rapports 2024" }, { id: "2", name: "Trimestriels" }],
				children_count: 0,
				documents_count: 4,
				children: [],
				created_at: "2024-01-15",
				updated_at: "2024-01-15",
				deleted_at: null,
			},
			{
				id: "3",
				name: "Annuels",
				description: "Rapports annuels",
				parent_id: "1",
				owner: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
				scope: { type: "minsup", id: "1" },
				path: "Rapports 2024 / Annuels",
				breadcrumbs: [{ id: "1", name: "Rapports 2024" }, { id: "3", name: "Annuels" }],
				children_count: 0,
				documents_count: 1,
				children: [],
				created_at: "2024-01-15",
				updated_at: "2024-01-15",
				deleted_at: null,
			},
		],
		created_at: "2024-01-10",
		updated_at: "2024-01-10",
		deleted_at: null,
	},
	{
		id: "4",
		name: "Procédures",
		description: "Documents de procédures",
		parent_id: null,
		owner: { id: "2", name: "Marie Claire", email: "marie@example.com" },
		scope: { type: "minsup", id: "1" },
		path: "Procédures",
		breadcrumbs: [{ id: "4", name: "Procédures" }],
		children_count: 0,
		documents_count: 2,
		children: [],
		created_at: "2024-02-01",
		updated_at: "2024-02-01",
		deleted_at: null,
	},
	{
		id: "5",
		name: "Archives 2023",
		description: "Documents archivés de 2023",
		parent_id: null,
		owner: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
		scope: { type: "minsup", id: "1" },
		path: "Archives 2023",
		breadcrumbs: [{ id: "5", name: "Archives 2023" }],
		children_count: 0,
		documents_count: 5,
		children: [],
		created_at: "2023-12-31",
		updated_at: "2023-12-31",
		deleted_at: null,
	},
];

const MOCK_DOCUMENTS: FileDocument[] = [
	{
		id: "1",
		title: "Rapport Activités Q1 2024",
		description: "Rapport des activités du premier trimestre 2024",
		size: 2.5 * 1024 * 1024,
		type: "pdf",
		author: "Jean Dupont",
		uploadDate: "2024-04-15T10:30:00",
		visibility: ["MINESUP"],
		url: "/files/rapport-q1-2024.pdf",
		folder: { id: "2", name: "Trimestriels", path: "Rapports 2024 / Trimestriels" },
		current_version: 3,
	},
	{
		id: "2",
		title: "Guide Utilisateur SYRAP",
		description: "Manuel d'utilisation complet du système SYRAP",
		size: 1.8 * 1024 * 1024,
		type: "word",
		author: "Marie Claire",
		uploadDate: "2024-03-20T14:45:00",
		visibility: ["MINESUP", "CENADI", "IPES"],
		url: "/files/guide-utilisateur.docx",
		folder: { id: "4", name: "Procédures", path: "Procédures" },
		current_version: 2,
	},
	{
		id: "3",
		title: "Statistiques IPES 2024",
		description: "Données statistiques des IPES pour l'année 2024",
		size: 856 * 1024,
		type: "excel",
		author: "Paul Martin",
		uploadDate: "2024-04-10T09:15:00",
		visibility: ["MINESUP", "CENADI"],
		url: "/files/stats-ipes-2024.xlsx",
		folder: { id: "1", name: "Rapports 2024", path: "Rapports 2024" },
		current_version: 1,
	},
	{
		id: "4",
		title: "Note de Service N°2024-05",
		description: "Note concernant les nouvelles procédures d'inscription",
		size: 245 * 1024,
		type: "pdf",
		author: "Direction",
		uploadDate: "2024-04-01T11:00:00",
		visibility: ["MINESUP"],
		url: "/files/note-service-2024-05.pdf",
		folder: null,
		current_version: 1,
	},
	{
		id: "5",
		title: "Rapport Financier Annuel 2023",
		description: "Bilan financier complet de l'année 2023",
		size: 3.2 * 1024 * 1024,
		type: "pdf",
		author: "Service Comptabilité",
		uploadDate: "2024-01-31T16:20:00",
		visibility: ["MINESUP"],
		url: "/files/rapport-financier-2023.pdf",
		folder: { id: "5", name: "Archives 2023", path: "Archives 2023" },
		current_version: 1,
	},
	{
		id: "6",
		title: "Planning Formation 2024",
		description: "Calendrier des formations prévues pour 2024",
		size: 125 * 1024,
		type: "excel",
		author: "RH",
		uploadDate: "2024-02-15T08:30:00",
		visibility: ["MINESUP", "IPES"],
		url: "/files/planning-formation-2024.xlsx",
		folder: null,
		current_version: 2,
	},
];

const MOCK_VERSIONS: DocumentVersion[] = [
	{
		id: "v3",
		version_number: 3,
		is_current: true,
		creator: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
		file: {
			name: "rapport-q1-2024-v3.pdf",
			mime_type: "application/pdf",
			size: 2621440,
			size_formatted: "2.5 MB",
			download_url: "/files/rapport-q1-2024-v3.pdf",
		},
		change_notes: "Correction des graphiques page 5 et mise à jour des données",
		created_at: "2024-04-15T10:30:00",
	},
	{
		id: "v2",
		version_number: 2,
		is_current: false,
		creator: { id: "2", name: "Marie Claire", email: "marie@example.com" },
		file: {
			name: "rapport-q1-2024-v2.pdf",
			mime_type: "application/pdf",
			size: 2411724,
			size_formatted: "2.3 MB",
			download_url: "/files/rapport-q1-2024-v2.pdf",
		},
		change_notes: "Ajout de la section analyse comparative",
		created_at: "2024-04-10T14:20:00",
	},
	{
		id: "v1",
		version_number: 1,
		is_current: false,
		creator: { id: "1", name: "Jean Dupont", email: "jean@example.com" },
		file: {
			name: "rapport-q1-2024.pdf",
			mime_type: "application/pdf",
			size: 1887436,
			size_formatted: "1.8 MB",
			download_url: "/files/rapport-q1-2024-v1.pdf",
		},
		change_notes: null,
		created_at: "2024-04-01T09:00:00",
	},
];

const MOCK_TRASHED: FileDocument[] = [
	{
		id: "t1",
		title: "Brouillon Rapport Q2",
		description: "Version brouillon non finalisée",
		size: 1.2 * 1024 * 1024,
		type: "word",
		author: "Jean Dupont",
		uploadDate: "2024-03-15T10:00:00",
		visibility: ["MINESUP"],
		url: "/files/brouillon-q2.docx",
		deleted_at: "2024-04-12T15:30:00",
	},
	{
		id: "t2",
		title: "Ancien Planning 2023",
		description: "Planning obsolète",
		size: 98 * 1024,
		type: "excel",
		author: "RH",
		uploadDate: "2023-01-10T08:00:00",
		visibility: ["MINESUP"],
		url: "/files/planning-2023.xlsx",
		deleted_at: "2024-04-10T11:00:00",
	},
];

const USE_MOCK_DATA = true; // Mettre à false pour utiliser les vraies données API
// ===== END MOCK DATA =====

interface DocumentsPageProps {
	institution?: {
		id: string;
		name: string;
		slug: string;
		type: string;
	} | null;
}

export function DocumentsPage({ institution }: DocumentsPageProps) {
	const queryClient = useQueryClient();

	// State
	const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
	const [activeTab, setActiveTab] = useState<string | null>("documents");
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [selectedDocumentForHistory, setSelectedDocumentForHistory] =
		useState<FileDocument | null>(null);

	// Modals
	const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] =
		useDisclosure(false);
	const [historyModalOpened, { open: openHistoryModal, close: closeHistoryModal }] =
		useDisclosure(false);

	// Fetch folders tree
	const {
		data: foldersData,
		isLoading: foldersLoading,
		refetch: refetchFolders,
	} = useQuery({
		queryKey: ["folders", "tree", institution?.id],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (institution) {
				params.set("model", institution.type.toLowerCase());
				params.set("model_id", institution.id);
			}
			const response = await fetch(innerUrl(`/api/folders/tree?${params}`));
			if (!response.ok) throw new Error("Failed to fetch folders");
			return response.json();
		},
		enabled: !USE_MOCK_DATA,
	});

	// Fetch documents
	const {
		data: documentsData,
		isLoading: documentsLoading,
		refetch: refetchDocuments,
	} = useQuery({
		queryKey: ["documents", page, searchQuery, sortOrder, typeFilter, selectedFolder?.id],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
			});
			if (searchQuery) params.set("search", searchQuery);
			if (selectedFolder) params.set("folder_id", selectedFolder.id);
			const response = await fetch(innerUrl(`/api/files?${params}`));
			if (!response.ok) throw new Error("Failed to fetch documents");
			return response.json();
		},
		enabled: !USE_MOCK_DATA,
	});

	// Fetch document versions
	const {
		data: versionsData,
		isLoading: versionsLoading,
		refetch: refetchVersions,
	} = useQuery({
		queryKey: ["document-versions", selectedDocumentForHistory?.id],
		queryFn: async () => {
			if (!selectedDocumentForHistory) return { data: [] };
			const response = await fetch(
				innerUrl(`/api/files/${selectedDocumentForHistory.id}/versions`),
			);
			if (!response.ok) throw new Error("Failed to fetch versions");
			return response.json();
		},
		enabled: !USE_MOCK_DATA && !!selectedDocumentForHistory,
	});

	// Fetch trashed items
	const {
		data: trashedData,
		isLoading: trashedLoading,
		refetch: refetchTrashed,
	} = useQuery({
		queryKey: ["documents", "trashed"],
		queryFn: async () => {
			const response = await fetch(innerUrl("/api/files/trashed"));
			if (!response.ok) throw new Error("Failed to fetch trashed documents");
			return response.json();
		},
		enabled: !USE_MOCK_DATA && activeTab === "trash",
	});

	// Mutations
	const createFolderMutation = useMutation({
		mutationFn: async (data: FolderFormData) => {
			const response = await fetch(innerUrl("/api/folders/create"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to create folder");
			return response.json();
		},
		onSuccess: () => {
			refetchFolders();
		},
	});

	const updateFolderMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<FolderFormData> }) => {
			const response = await fetch(innerUrl(`/api/folders/${id}`), {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to update folder");
			return response.json();
		},
		onSuccess: () => {
			refetchFolders();
		},
	});

	const deleteFolderMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(innerUrl(`/api/folders/${id}`), {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete folder");
			return response.json();
		},
		onSuccess: () => {
			refetchFolders();
			refetchDocuments();
		},
	});

	const createDocumentMutation = useMutation({
		mutationFn: async (formData: FormData) => {
			const response = await fetch(innerUrl("/api/files/create"), {
				method: "POST",
				body: formData,
			});
			if (!response.ok) throw new Error("Failed to create document");
			return response.json();
		},
		onSuccess: () => {
			refetchDocuments();
			closeUploadModal();
		},
	});

	const deleteDocumentMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(innerUrl(`/api/files/${id}`), {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete document");
			return response.json();
		},
		onSuccess: () => {
			refetchDocuments();
		},
	});

	const restoreDocumentMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(innerUrl(`/api/files/${id}/restore`), {
				method: "POST",
			});
			if (!response.ok) throw new Error("Failed to restore document");
			return response.json();
		},
		onSuccess: () => {
			refetchDocuments();
			refetchTrashed();
			notifications.show({
				title: "Succès",
				message: "Document restauré avec succès",
				color: "green",
			});
		},
	});

	const restoreVersionMutation = useMutation({
		mutationFn: async ({
			documentId,
			versionNumber,
		}: {
			documentId: string;
			versionNumber: number;
		}) => {
			const response = await fetch(
				innerUrl(`/api/files/${documentId}/versions/${versionNumber}/restore`),
				{
					method: "POST",
				},
			);
			if (!response.ok) throw new Error("Failed to restore version");
			return response.json();
		},
		onSuccess: () => {
			refetchDocuments();
			refetchVersions();
		},
	});

	// Handlers
	const handleSelectFolder = useCallback((folder: Folder | null) => {
		setSelectedFolder(folder);
		setPage(1);
	}, []);

	const handleCreateFolder = useCallback(
		async (data: FolderFormData) => {
			await createFolderMutation.mutateAsync(data);
		},
		[createFolderMutation],
	);

	const handleUpdateFolder = useCallback(
		async (id: string, data: Partial<FolderFormData>) => {
			await updateFolderMutation.mutateAsync({ id, data });
		},
		[updateFolderMutation],
	);

	const handleDeleteFolder = useCallback(
		async (id: string) => {
			await deleteFolderMutation.mutateAsync(id);
		},
		[deleteFolderMutation],
	);

	const handleUploadDocument = useCallback(
		async (values: FileFormData) => {
			const formData = new FormData();
			formData.append("title", values.title);
			formData.append("description", values.description);
			if (values.file) {
				formData.append("file", values.file);
			}
			if (values.folder_id) {
				formData.append("folder_id", values.folder_id);
			}
			if (values.change_notes) {
				formData.append("change_notes", values.change_notes);
			}
			if (institution) {
				formData.append("model", institution.type.toLowerCase());
				formData.append("model_id", institution.id);
			}

			await createDocumentMutation.mutateAsync(formData);
		},
		[createDocumentMutation, institution],
	);

	const handleDeleteDocument = useCallback(
		async (id: string) => {
			await deleteDocumentMutation.mutateAsync(id);
		},
		[deleteDocumentMutation],
	);

	const handleEditDocument = useCallback(
		async (id: string, data: Partial<FileDocument>) => {
			// Implement edit logic
			console.log("Edit document", id, data);
		},
		[],
	);

	const handleViewHistory = useCallback(
		(file: FileDocument) => {
			setSelectedDocumentForHistory(file);
			openHistoryModal();
		},
		[openHistoryModal],
	);

	const handleRestoreVersion = useCallback(
		async (versionNumber: number) => {
			if (!selectedDocumentForHistory) return;
			await restoreVersionMutation.mutateAsync({
				documentId: selectedDocumentForHistory.id,
				versionNumber,
			});
		},
		[selectedDocumentForHistory, restoreVersionMutation],
	);

	const handleDownloadVersion = useCallback(async (version: DocumentVersion) => {
		// Create download link
		const link = document.createElement("a");
		link.href = version.file.download_url;
		link.download = version.file.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, []);

	const handleRefresh = useCallback(() => {
		refetchFolders();
		refetchDocuments();
	}, [refetchFolders, refetchDocuments]);

	// Get files from response (or mock data)
	// Filter mock documents based on selected folder
	const getMockDocuments = () => {
		if (!selectedFolder) {
			// Show all documents when no folder is selected
			return MOCK_DOCUMENTS;
		}
		// Filter documents that belong to the selected folder or its children
		const folderIds = [selectedFolder.id];
		// Also include children folder IDs
		const addChildrenIds = (folder: Folder) => {
			if (folder.children) {
				folder.children.forEach(child => {
					folderIds.push(child.id);
					addChildrenIds(child);
				});
			}
		};
		addChildrenIds(selectedFolder);

		return MOCK_DOCUMENTS.filter(doc =>
			doc.folder && folderIds.includes(doc.folder.id)
		);
	};

	const mockFiles = USE_MOCK_DATA ? getMockDocuments() : [];
	const files = USE_MOCK_DATA ? mockFiles : (documentsData?.data || []);
	const total = USE_MOCK_DATA ? mockFiles.length : (documentsData?.total || 0);
	const folders = USE_MOCK_DATA ? MOCK_FOLDERS : (foldersData?.data || []);
	const versions = USE_MOCK_DATA ? MOCK_VERSIONS : (versionsData?.data || []);
	const trashedFiles = USE_MOCK_DATA ? MOCK_TRASHED : (trashedData?.data || []);
	const isVersionsLoading = USE_MOCK_DATA ? false : versionsLoading;
	const isTrashedLoading = USE_MOCK_DATA ? false : trashedLoading;
	const isFoldersLoading = USE_MOCK_DATA ? false : foldersLoading;
	const isDocumentsLoading = USE_MOCK_DATA ? false : documentsLoading;

	return (
		<Stack gap="md">
			{/* Breadcrumb */}
			<Paper p="sm" withBorder radius="md">
				<FolderBreadcrumb
					folder={selectedFolder}
					onNavigate={(folderId) => {
						if (folderId) {
							const folder = findFolderById(folders, folderId);
							setSelectedFolder(folder || null);
						} else {
							setSelectedFolder(null);
						}
					}}
				/>
			</Paper>

			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value="documents" leftSection={<IconFile size={16} />}>
						Documents
					</Tabs.Tab>
					<Tabs.Tab value="trash" leftSection={<IconTrash size={16} />}>
						Corbeille
						{trashedFiles.length > 0 && (
							<Badge size="xs" ml="xs" color="red">
								{trashedFiles.length}
							</Badge>
						)}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="documents" pt="md">
					<Grid>
						{/* Folder Tree */}
						<Grid.Col span={{ base: 12, md: 3 }}>
							<FolderTree
								folders={folders}
								selectedFolderId={selectedFolder?.id || null}
								onSelectFolder={handleSelectFolder}
								onCreateFolder={handleCreateFolder}
								onUpdateFolder={handleUpdateFolder}
								onDeleteFolder={handleDeleteFolder}
								isLoading={isFoldersLoading}
								institution={institution ? {
									id: institution.id,
									name: institution.name,
									type: institution.type,
								} : null}
							/>
						</Grid.Col>

						{/* File List */}
						<Grid.Col span={{ base: 12, md: 9 }}>
							<FileList
								files={files}
								total={total}
								page={page}
								onPageChange={setPage}
								onSearch={setSearchQuery}
								onRefresh={handleRefresh}
								onDelete={handleDeleteDocument}
								onEdit={handleEditDocument}
								onSort={(type) => setTypeFilter(type)}
								onUpload={openUploadModal}
								isLoading={isDocumentsLoading}
								sortOrder={sortOrder}
								onToggleSort={() =>
									setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
								}
								onViewHistory={handleViewHistory}
								currentFolderName={selectedFolder?.name}
							/>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				<Tabs.Panel value="trash" pt="md">
					<Paper p="md" withBorder radius="md">
						<Stack gap="md">
							<Group justify="space-between">
								<Text fw={600}>Documents supprimés</Text>
								<Tooltip label="Actualiser">
									<ActionIcon
										variant="light"
										color="blue"
										onClick={() => refetchTrashed()}
										loading={isTrashedLoading}
									>
										<IconRefresh size={18} />
									</ActionIcon>
								</Tooltip>
							</Group>

							{isTrashedLoading ? (
								<Group justify="center" py="xl">
									<Loader size="md" />
								</Group>
							) : trashedFiles.length === 0 ? (
								<Alert
									icon={<IconAlertCircle size={16} />}
									title="Corbeille vide"
									color="gray"
									variant="light"
								>
									Aucun document dans la corbeille.
								</Alert>
							) : (
								<Stack gap="sm">
									{trashedFiles.map((file: FileDocument) => (
										<Paper key={file.id} p="sm" withBorder>
											<Group justify="space-between">
												<Group gap="sm">
													<IconFile size={20} />
													<div>
														<Text fw={500}>{file.title}</Text>
														<Text size="xs" c="dimmed">
															Supprimé le {file.deleted_at}
														</Text>
													</div>
												</Group>
												<Button
													size="xs"
													variant="light"
													color="green"
													onClick={() =>
														restoreDocumentMutation.mutate(file.id)
													}
													loading={restoreDocumentMutation.isPending}
												>
													Restaurer
												</Button>
											</Group>
										</Paper>
									))}
								</Stack>
							)}
						</Stack>
					</Paper>
				</Tabs.Panel>
			</Tabs>

			{/* Upload Modal */}
			<Modal
				opened={uploadModalOpened}
				onClose={closeUploadModal}
				title="Ajouter un document"
				size="lg"
				centered
			>
				<FileForm
					onSubmit={handleUploadDocument}
					onCancel={closeUploadModal}
					institution={institution}
					folders={folders}
					currentFolderId={selectedFolder?.id}
				/>
			</Modal>

			{/* Version History Modal */}
			<VersionHistoryModal
				opened={historyModalOpened}
				onClose={() => {
					closeHistoryModal();
					setSelectedDocumentForHistory(null);
				}}
				document={selectedDocumentForHistory}
				versions={versions}
				onRestoreVersion={handleRestoreVersion}
				onDownloadVersion={handleDownloadVersion}
				isLoading={isVersionsLoading}
			/>
		</Stack>
	);
}

// Helper function to find a folder by ID in a nested structure
function findFolderById(folders: Folder[], id: string): Folder | null {
	for (const folder of folders) {
		if (folder.id === id) return folder;
		if (folder.children && folder.children.length > 0) {
			const found = findFolderById(folder.children, id);
			if (found) return found;
		}
	}
	return null;
}
