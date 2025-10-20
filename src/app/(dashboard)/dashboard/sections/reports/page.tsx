"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";
import { useState, useEffect, useCallback } from "react";
import {
	Container,
	Title,
	Button,
	Group,
	Modal,
	Anchor,
	Box,
	Paper,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { FileList } from "@/components/Files/FileList";
import { FileForm } from "@/components/Files/FileForm";
import { FileDocument, FileFormData, FileType } from "@/types";
import { notifications } from "@mantine/notifications";

const items = [{ title: "Rapports", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();
	const [allFiles, setAllFiles] = useState<FileDocument[]>([]);
	const [filteredFiles, setFilteredFiles] = useState<FileDocument[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [fileType, setFileType] = useState<FileType | "all">("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [opened, { open, close }] = useDisclosure(false);
	const [isLoading, setIsLoading] = useState(false);

	// Determine the model type based on institution slug
	const getModelType = () => {
		if (!institution) return null;

		if (institution.slug.includes('cenadi')) {
			return 'cenadi';
		} else if (institution.slug.includes('minsup')) {
			return 'minsup';
		} else {
			return 'institute';
		}
	};

	// Fetch data from API
	const fetchFiles = useCallback(async () => {
		setIsLoading(true);
		try {
			// Simplified API call without query parameters
			const response = await fetch('/api/files');

			if (!response.ok) {
				throw new Error('Failed to fetch files');
			}

			const data = await response.json();

			// Map the API response to FileDocument format
			const formattedFiles = data.data.map((item: any) => {
				// The backend might return a single file object or a files array
				// Handle both cases to ensure backward compatibility
				const fileData = item.file || (item.files && item.files.length > 0 ? item.files[0] : null);

				return {
					id: item.id.toString(),
					title: item.title,
					description: item.description,
					size: fileData?.size || 0,
					type: determineFileType(fileData?.mime_type, fileData?.name),
					author: item.owner?.name || 'Unknown',
					uploadDate: item.created_at,
					visibility: determineVisibility(item.model?.type),
					url: fileData?.download_url || '',
				};
			});

			// Store all files
			setAllFiles(formattedFiles);

			// Initial filtering will happen in applyFilters
		} catch (error) {
			console.error("Error fetching files:", error);
			notifications.show({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to load files",
				color: "red",
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Apply filters to the fetched data
	const applyFilters = useCallback(() => {
		if (allFiles.length === 0) return;

		// Start with all files
		let result = [...allFiles];

		// Filter files by visibility
		// result = result.filter(file => file.visibility.some(v => String(institution.model).toLowerCase().includes(v.toLowerCase())))
		result = result.filter(file => file.visibility.some(v => String(institution.name).toLowerCase().includes(v.toLowerCase())))

		// Apply search filter
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter(file =>
				file.title.toLowerCase().includes(searchLower) ||
				file.description.toLowerCase().includes(searchLower) ||
				file.author.toLowerCase().includes(searchLower)
			);
		}

		// Apply file type filter
		if (fileType !== 'all') {
			result = result.filter(file => file.type === fileType);
		}

		// Sort files by date
		result.sort((a, b) => {
			const dateA = new Date(a.uploadDate).getTime();
			const dateB = new Date(b.uploadDate).getTime();
			return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
		});

		// Set total before pagination
		setTotal(result.length);

		// Apply pagination
		const itemsPerPage = 10;
		const startIndex = (page - 1) * itemsPerPage;
		const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage);

		// Update filtered files
		setFilteredFiles(paginatedResult);
	}, [allFiles, search, fileType, sortOrder, page]);

	// Helper function to determine file type from mime type
	const determineFileType = (mimeType: string, fileName: string): FileType => {
		if (!mimeType) return 'other';

		if (mimeType.includes('pdf')) return 'pdf';
		if (mimeType.includes('word') || mimeType.includes('docx') || mimeType.includes('doc')) return 'word';
		if (mimeType.includes('excel') || mimeType.includes('xlsx') || mimeType.includes('xls')) return 'excel';
		if (mimeType.includes('text') || mimeType.includes('txt')) return 'text';
		if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compress')) return 'zip';
		if (mimeType.includes('image')) return 'image';

		// Fallback to extension check
		if (fileName) {
			const ext = fileName.split('.').pop()?.toLowerCase();
			if (ext === 'pdf') return 'pdf';
			if (ext === 'doc' || ext === 'docx') return 'word';
			if (ext === 'xls' || ext === 'xlsx') return 'excel';
			if (ext === 'txt') return 'text';
			if (ext === 'zip' || ext === 'rar') return 'zip';
			if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext as string)) return 'image';
		}

		return 'other';
	};

	// Helper function to determine visibility from model type
	const determineVisibility = (modelType: string): ("CENADI" | "MINESUP" | "IPES")[] => {
		if (!modelType) return ['CENADI', 'MINESUP', 'IPES'];

		if (modelType.includes('Cenadi')) return ['CENADI'];
		if (modelType.includes('Minesup')) return ['MINESUP'];
		if (modelType.includes('Ipes')) return ['IPES'];

		return ['CENADI', 'MINESUP', 'IPES'];
	};

	// Toggle sort order
	const toggleSortOrder = () => {
		setSortOrder(prev => prev === "asc" ? "desc" : "asc");
	};

	// Handler for search
	const handleSearch = (query: string) => {
		setSearch(query);
		setPage(1); // Reset to first page when searching
	};

	// Handler for file type filter
	const handleFileTypeFilter = (type: FileType | "all") => {
		setFileType(type);
		setPage(1); // Reset to first page when filtering
	};

	// Fetch data on initial load
	useEffect(() => {
		fetchFiles();
	}, [fetchFiles]);

	// Apply filters whenever filter criteria change
	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	const handleUpload = async (values: FileFormData) => {
		try {
			setIsLoading(true);

			// Determine model type and id
			const model = getModelType();
			const model_id = institution?.id;

			if (!model || !model_id) {
				throw new Error('Institution information is missing');
			}

			// Create FormData
			const formData = new FormData();
			formData.append('title', values.title);
			formData.append('description', values.description);
			formData.append('model', model);
			formData.append('model_id', model_id.toString());

			if (values.file) {
				formData.append('file', values.file);
			}

			// Send the request
			const response = await fetch('/api/files/create', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to upload file');
			}

			close();
			notifications.show({
				title: "Success",
				message: "File uploaded successfully",
				color: "green",
			});

			// Refresh the file list
			fetchFiles();
		} catch (error) {
			console.error("Upload error:", error);
			notifications.show({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to upload file",
				color: "red",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = async (id: string, data: Partial<FileDocument>) => {
		try {
			setIsLoading(true);

			const response = await fetch(`/api/files/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: data.title,
					description: data.description,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update file');
			}

			notifications.show({
				title: "Success",
				message: "File updated successfully",
				color: "green",
			});

			fetchFiles();
		} catch (error) {
			console.error("Edit error:", error);
			notifications.show({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to update file",
				color: "red",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			setIsLoading(true);

			const response = await fetch(`/api/files/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete file');
			}

			notifications.show({
				title: "Success",
				message: "File deleted successfully",
				color: "green",
			});

			fetchFiles();
		} catch (error) {
			console.error("Delete error:", error);
			notifications.show({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to delete file",
				color: "red",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<>
				<title>Rapports | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Box mb="lg">
					<PageHeader title="Rapports" breadcrumbItems={items} />
				</Box>
				<Paper p={"sm"}>
					<FileList
						files={filteredFiles}
						total={total}
						page={page}
						onPageChange={setPage}
						onSearch={handleSearch}
						onRefresh={fetchFiles}
						onDelete={handleDelete}
						onEdit={handleEdit}
						onSort={handleFileTypeFilter}
						onUpload={open}
						isLoading={isLoading}
						sortOrder={sortOrder}
						onToggleSort={toggleSortOrder}
					/>

					<Modal
						opened={opened}
						onClose={close}
						title="Uploader un nouveau fichier"
						size="lg"
						centered
					>
						<FileForm
							onSubmit={handleUpload}
							onCancel={close}
							institution={institution}
						/>
					</Modal>
				</Paper>
			</Container>
		</>
	);
}

export default Page;

