"use client";

import { useState } from "react";
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
} from "@mantine/core";
import {
	IconDotsVertical,
	IconDownload,
	IconEdit,
	IconTrash,
	IconSearch,
	IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FileDocument, FileType } from "@/types";
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
}: FileListProps) {
	const [editingFile, setEditingFile] = useState<FileDocument | null>(null);
	const [opened, { open, close }] = useDisclosure(false);

	const handleEdit = async (values: Partial<FileDocument>) => {
		if (editingFile) {
			try {
				await onEdit(editingFile.id, values);
				notifications.show({
					title: "Succès",
					message: "Document modifié avec succès",
					color: "green",
				});
				close();
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la modification du document",
					color: "red",
				});
			}
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await onDelete(id);
			notifications.show({
				title: "Succès",
				message: "Document supprimé avec succès",
				color: "green",
			});
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Erreur lors de la suppression du document",
				color: "red",
			});
		}
	};

	const handleDownload = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Stack gap="md">
			<Group>
				<TextInput
					placeholder="Rechercher..."
					leftSection={<IconSearch size={24} />}
					onChange={(e) => onSearch(e.currentTarget.value)}
					style={{ flex: 1 }}
				/>
				<ActionIcon variant="filled" onClick={onRefresh}>
					<IconRefresh size={24} />
				</ActionIcon>
				<Select
					placeholder="Trier par type"
					data={[
						{ value: "all", label: "Tous" },
						{ value: "pdf", label: "PDF" },
						{ value: "word", label: "Word" },
						{ value: "excel", label: "Excel" },
						{ value: "text", label: "Texte" },
						{ value: "zip", label: "ZIP" },
						{ value: "image", label: "Image" },
					]}
					onChange={(value) => onSort(value as FileType | "all")}
				/>
			</Group>

			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Type</Table.Th>
						<Table.Th>Titre</Table.Th>
						<Table.Th>Description</Table.Th>
						<Table.Th>Taille</Table.Th>
						<Table.Th>Auteur</Table.Th>
						<Table.Th>Date d'upload</Table.Th>
						<Table.Th>Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{files.map((file) => {
						const Icon = getFileTypeIcon(file.type);
						const color = getFileTypeColor(file.type);
						return (
							<Table.Tr key={file.id}>
								<Table.Td>
									<Icon size={20} color={color} />
								</Table.Td>
								<Table.Td>{file.title}</Table.Td>
								<Table.Td>{file.description}</Table.Td>
								<Table.Td>{formatFileSize(file.size)}</Table.Td>
								<Table.Td>{file.author}</Table.Td>
								<Table.Td>{formatDate(file.uploadDate)}</Table.Td>
								<Table.Td>
									<Group gap="xs">
										<ActionIcon
											variant="subtle"
											color="blue"
											onClick={() => {
												setEditingFile(file);
												open();
											}}
										>
											<IconEdit size={24} />
										</ActionIcon>
										<ActionIcon
											variant="subtle"
											color="red"
											onClick={() => handleDelete(file.id)}
										>
											<IconTrash size={24} />
										</ActionIcon>
										<ActionIcon
											variant="subtle"
											color="green"
											onClick={() => handleDownload(file.url, file.title)}
										>
											<IconDownload size={24} />
										</ActionIcon>
									</Group>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>

			<Group justify="center">
				<Pagination
					total={Math.ceil(total / 10)}
					value={page}
					onChange={onPageChange}
				/>
			</Group>

			<Modal
				opened={opened}
				onClose={close}
				title="Modifier le document"
				size="lg"
			>
				<FileForm
					initialData={editingFile || undefined}
					onSubmit={handleEdit}
					onCancel={close}
				/>
			</Modal>
		</Stack>
	);
}
