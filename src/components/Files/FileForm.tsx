"use client";

import { useForm } from "@mantine/form";
import {
	TextInput,
	Textarea,
	MultiSelect,
	FileInput,
	Button,
	Stack,
	Group,
	Text,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { FileDocument, FileFormData } from "@/types";
import {
	getFileTypeFromExtension,
	getFileTypeIcon,
	getFileTypeColor,
} from "@/app/lib/utils";

interface FileFormProps {
	initialData?: FileDocument;
	onSubmit: (values: FileFormData) => Promise<void>;
	onCancel: () => void;
}

// export function FileForm({ initialData, onSubmit, onCancel }: FileFormProps) {
// 	const form = useForm<FileFormData>({
// 		initialValues: {
// 			title: initialData?.title || "",
// 			description: initialData?.description || "",
// 			visibility: initialData?.visibility || [],
// 		},
// 		validate: {
// 			title: (value: any) => (!value ? "Le titre est requis" : null),
// 			description: (value: any) =>
// 				!value ? "La description est requise" : null,
// 			visibility: (value: any) =>
// 				!value.length ? "Sélectionnez au moins une visibilité" : null,
// 		},
// 	});
//
// 	const visibilityOptions = [
// 		{ value: "CENADI", label: "CENADI" },
// 		{ value: "MINESUP", label: "MINESUP" },
// 		{ value: "IPES", label: "IPES" },
// 	];
//
// 	const handleFileChange = (file: File | null) => {
// 		if (file) {
// 			const fileType = getFileTypeFromExtension(file.name);
// 			const Icon = getFileTypeIcon(fileType);
// 			const color = getFileTypeColor(fileType);
// 			return (
// 				<Group gap="xs">
// 					<Icon size={20} color={color} />
// 					<Text size="sm">{file.name}</Text>
// 				</Group>
// 			);
// 		}
// 		return null;
// 	};
//
// 	return (
// 		<form onSubmit={form.onSubmit(onSubmit)}>
// 			<Stack gap="md">
// 				<TextInput
// 					label="Titre"
// 					placeholder="Entrez le titre du document"
// 					required
// 					{...form.getInputProps("title")}
// 				/>
//
// 				<Textarea
// 					label="Description"
// 					placeholder="Entrez la description du document"
// 					required
// 					minRows={3}
// 					{...form.getInputProps("description")}
// 				/>
//
// 				{!initialData && (
// 					<FileInput
// 						label="Fichier"
// 						placeholder="Charger le fichier"
// 						accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,image/*"
// 						required
// 						icon={<IconUpload size={14} />}
// 						valueComponent={handleFileChange}
// 						{...form.getInputProps("file")}
// 					/>
// 				)}
//
// 				<MultiSelect
// 					label="Visibilité"
// 					placeholder="Sélectionnez la visibilité"
// 					data={visibilityOptions}
// 					required
// 					{...form.getInputProps("visibility")}
// 				/>
//
// 				<Group justify="flex-end" mt="md">
// 					<Button variant="light" onClick={onCancel}>
// 						Annuler
// 					</Button>
// 					<Button type="submit">{initialData ? "Modifier" : "Uploader"}</Button>
// 				</Group>
// 			</Stack>
// 		</form>
// 	);
// }

const FileValueComponent: React.FC<{ value: File | File[] | null }> = ({
	value,
}) => {
	if (!value) return null;

	const file = Array.isArray(value) ? value[0] : value; // Handle single or multiple files
	const fileType = getFileTypeFromExtension(file.name);
	const Icon = getFileTypeIcon(fileType);
	const color = getFileTypeColor(fileType);

	return (
		<Group gap="xs">
			<Icon size={20} color={color} />
			<Text size="sm">{file.name}</Text>
		</Group>
	);
};

export function FileForm({ initialData, onSubmit, onCancel }: FileFormProps) {
	const form = useForm<FileFormData>({
		initialValues: {
			title: initialData?.title || "",
			description: initialData?.description || "",
			visibility: initialData?.visibility || [],
		},
		validate: {
			title: (value: any) => (!value ? "Le titre est requis" : null),
			description: (value: any) =>
				!value ? "La description est requise" : null,
			visibility: (value: any) =>
				!value.length ? "Sélectionnez au moins une visibilité" : null,
		},
	});

	const visibilityOptions = [
		{ value: "CENADI", label: "CENADI" },
		{ value: "MINESUP", label: "MINESUP" },
		{ value: "IPES", label: "IPES" },
	];

	return (
		<form onSubmit={form.onSubmit(onSubmit)}>
			<Stack gap="md">
				<TextInput
					label="Titre"
					placeholder="Entrez le titre du document"
					required
					{...form.getInputProps("title")}
				/>

				<Textarea
					label="Description"
					placeholder="Entrez la description du document"
					required
					minRows={3}
					{...form.getInputProps("description")}
				/>

				{!initialData && (
					<FileInput
						label="Fichier"
						placeholder="Charger le fichier"
						accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,image/*"
						required
						// icon={<IconUpload size={14} />}
						valueComponent={FileValueComponent}
						{...form.getInputProps("file")}
					/>
				)}

				<MultiSelect
					label="Visibilité"
					placeholder="Sélectionnez la visibilité"
					data={visibilityOptions}
					required
					{...form.getInputProps("visibility")}
				/>

				<Group justify="flex-end" mt="md">
					<Button variant="light" onClick={onCancel}>
						Annuler
					</Button>
					<Button type="submit">{initialData ? "Modifier" : "Uploader"}</Button>
				</Group>
			</Stack>
		</form>
	);
}
