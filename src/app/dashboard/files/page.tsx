"use client";

import { useState, useEffect } from "react";
import { Container, Title, Alert, Text, Button, Group } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { FileList } from "@/components/Files/FileList";
import { FileDocument, FileFormData, FileType } from "@/types";
import { notifications } from "@mantine/notifications";

export default function FilesPage() {
	const [files, setFiles] = useState<FileDocument[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [fileType, setFileType] = useState<FileType | "all">("all");

	// Fetch files on component mount and when filters change
	useEffect(() => {
		fetchFiles();
	}, [page, searchQuery, fileType]);

	const fetchFiles = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Build query parameters
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", "10");

			if (searchQuery) {
				params.append("search", searchQuery);
			}

			if (fileType !== "all") {
				params.append("type", fileType);
			}

			// Make API request
			const response = await fetch(`/api/files?${params.toString()}`);

			if (!response.ok) {
				throw new Error("Failed to fetch files");
			}

			const data = await response.json();

			// Handle the specific API response structure
			if (data && data.data) {
				const mappedFiles = data.data.map((file: any) => ({
					id: file.id.toString(),
					title: file.name,
					description: "",
					type: "file",
					size: 0,
					author: "",
					uploadDate: new Date(),
					visibility: [],
					url: file.url,
				}));
				setFiles(mappedFiles);
				setTotal(data.data.length);
			} else {
				// Fallback to empty array if structure is unexpected
				console.warn("Unexpected API response structure:", data);
				setFiles([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Error fetching files:", error);
			setError(
				"Une erreur est survenue lors du chargement des fichiers. Veuillez réessayer.",
			);
			// Set empty files array to prevent undefined errors
			setFiles([]);
			setTotal(0);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		setPage(1); // Reset to first page when searching
	};

	const handleSort = (type: FileType | "all") => {
		setFileType(type);
		setPage(1); // Reset to first page when changing file type
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/files/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete file");
			}

			// Refresh the file list
			fetchFiles();

			return Promise.resolve();
		} catch (error) {
			console.error("Error deleting file:", error);
			return Promise.reject(error);
		}
	};

	const handleEdit = async (id: string, data: Partial<FileDocument>) => {
		try {
			const response = await fetch(`/api/files/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: data.title,
					description: data.description,
					visibility: data.visibility,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update file");
			}

			// Refresh the file list
			fetchFiles();

			return Promise.resolve();
		} catch (error) {
			console.error("Error updating file:", error);
			return Promise.reject(error);
		}
	};

	const handleUpload = async (formData: FileFormData) => {
		try {
			// Create FormData
			const data = new FormData();
			if (formData.file) {
				data.append("file", formData.file);
			}
			data.append("title", formData.title);
			data.append("description", formData.description);
			formData.visibility.forEach((v) => {
				data.append("visibility[]", v);
			});

			// Make API request
			const response = await fetch("/api/fichiers/upload", {
				method: "POST",
				body: data,
			});

			if (!response.ok) {
				throw new Error("Failed to upload file");
			}

			// Refresh the file list
			fetchFiles();

			return Promise.resolve();
		} catch (error) {
			console.error("Error uploading file:", error);
			return Promise.reject(error);
		}
	};

	// Modify the onUpload function to match the expected signature
	const handleUploadClick = () => {
		// This function is empty because the actual upload logic is handled in the FileForm component
		// This is just to satisfy the prop type requirement
	};

	return (
		<Container size="xl" py="xl">
			<Title order={2} mb="xl">
				Gestion des documents
			</Title>

			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Erreur"
					color="red"
					variant="light"
					mb="xl"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
					<Group mt="md">
						<Button
							leftSection={<IconRefresh size={16} />}
							variant="light"
							onClick={fetchFiles}
						>
							Réessayer
						</Button>
					</Group>
				</Alert>
			)}

			<FileList
				files={files ?? []} // Ensure files is never undefined by providing empty array as fallback
				total={total}
				page={page}
				onPageChange={setPage}
				onSearch={handleSearch}
				onRefresh={fetchFiles}
				onDelete={handleDelete}
				onEdit={handleEdit}
				onSort={handleSort}
				onUpload={handleUploadClick}
				isLoading={isLoading}
			/>
		</Container>
	);
}
