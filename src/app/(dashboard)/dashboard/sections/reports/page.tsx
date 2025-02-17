"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useState, useEffect } from "react";
import {
	Container,
	Title,
	Button,
	Group,
	Modal,
	Anchor,
	Box,
	MantineProvider,
	Paper,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { FileList } from "@/components/Files/FileList";
import { FileForm } from "@/components/Files/FileForm";
import { FileDocument, FileFormData, FileType } from "@/types";

const items = [{ title: "Rapports", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();
	const [files, setFiles] = useState<FileDocument[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [fileType, setFileType] = useState<FileType | "all">("all");
	const [opened, { open, close }] = useDisclosure(false);

	const fetchFiles = async () => {
		const response = await fetch(
			`/api/files?page=${page}&search=${search}&type=${fileType}`,
		);
		const data = await response.json();
		setFiles(data.files);
		setTotal(data.total);
	};

	useEffect(() => {
		fetchFiles();
	}, [page, search, fileType]);

	const handleUpload = async (values: FileFormData) => {
		try {
			await fetch("/api/files", {
				method: "POST",
				body: JSON.stringify(values),
			});
			close();
			fetchFiles();
		} catch (error) {
			console.error("Upload error:", error);
		}
	};

	const handleEdit = async (id: string, data: Partial<FileDocument>) => {
		try {
			await fetch(`/api/files/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			});
			fetchFiles();
		} catch (error) {
			console.error("Edit error:", error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await fetch(`/api/files/${id}`, {
				method: "DELETE",
			});
			fetchFiles();
		} catch (error) {
			console.error("Delete error:", error);
		}
	};

	const handleRefresh = () => {
		fetchFiles();
	};

	const handleSort = (type: FileType | "all") => {
		setFileType(type);
		setPage(1);
		fetchFiles();
	};

	return (
		<>
			<>
				<title>Rapports | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Box mb="lg">
					<PageHeader title="Rapports" breadcrumbItems={items} />
				</Box>
				<Paper p={"sm"}>
					<Group justify="flex-end" mb="xl">
						<Button leftSection={<IconUpload size={16} />} onClick={open}>
							Uploader un fichier
						</Button>
					</Group>

					<FileList
						files={files}
						total={total}
						page={page}
						onPageChange={setPage}
						onSearch={setSearch}
						onRefresh={handleRefresh}
						onDelete={handleDelete}
						onEdit={handleEdit}
						onSort={handleSort}
					/>

					<Modal
						opened={opened}
						onClose={close}
						title="Uploader un nouveau fichier"
						size="lg"
					>
						<FileForm onSubmit={handleUpload} onCancel={close} />
					</Modal>
				</Paper>
			</Container>
		</>
	);
}

export default Page;
