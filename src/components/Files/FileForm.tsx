"use client";

import { useState } from "react";
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
	Paper,
	Alert,
	Loader,
	Title,
	Badge,
} from "@mantine/core";
import {
	IconUpload,
	IconAlertCircle,
	IconCheck,
	IconFileDescription,
	IconEye,
	IconBuilding,
} from "@tabler/icons-react";
import { FileDocument, FileFormData } from "@/types";
import {
	getFileTypeFromExtension,
	getFileTypeIcon,
	getFileTypeColor,
} from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";

interface FileFormProps {
	initialData?: FileDocument;
	onSubmit: (values: FileFormData) => Promise<void>;
	onCancel: () => void;
	institution?: { id: string; name: string; slug: string; model: string; };
}

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
			<Text size="xs" c="dimmed">
				({(file.size / 1024).toFixed(2)} KB)
			</Text>
		</Group>
	);
};

export function FileForm({ initialData, onSubmit, onCancel, institution }: FileFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	
	// Determine model type based on institution
	const getModelInfo = () => {
		if (!institution) return null;
		
		let modelType;
		if (institution.slug.includes('cenadi')) {
			modelType = 'CENADI';
		} else if (institution.slug.includes('minsup')) {
			modelType = 'MINESUP';
		} else {
			modelType = 'IPES';
		}
		
		return {
			type: modelType,
			name: institution.name
		};
	};
	
	const modelInfo = getModelInfo();

	const form = useForm<{
		title: string;
		description: string;
		visibility: string[];
		file: File | null;
	}>({
		initialValues: {
			title: initialData?.title || "",
			description: initialData?.description || "",
			visibility: initialData?.visibility || [],
			file: null,
		},
		validate: {
			title: (value) =>
				!value.trim()
					? "Le titre est requis"
					: value.length < 3
						? "Le titre doit contenir au moins 3 caractères"
						: null,
			description: (value) =>
				!value.trim()
					? "La description est requise"
					: value.length < 10
						? "La description doit être plus détaillée"
						: null,
			file: (value, values) =>
				!initialData && !value ? "Le fichier est requis" : null,
		},
	});

	const visibilityOptions = [
		{ value: "CENADI", label: "CENADI" },
		{ value: "MINESUP", label: "MINESUP" },
		{ value: "IPES", label: "IPES" },
	];

	const handleSubmitForm = async (values: FileFormData) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await onSubmit(values);
			setSuccess(
				initialData
					? "Document modifié avec succès"
					: "Document téléchargé avec succès",
			);

			// Reset form if it's a new upload
			if (!initialData) {
				form.reset();
			}

			// Show notification
			notifications.show({
				title: "Succès",
				message: initialData
					? "Document modifié avec succès"
					: "Document téléchargé avec succès",
				color: "green",
				icon: <IconCheck size={16} />,
			});

			// Close form after a delay
			setTimeout(() => {
				onCancel();
			}, 1500);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Une erreur est survenue";
			setError(errorMessage);

			// Show notification
			notifications.show({
				title: "Erreur",
				message: errorMessage,
				color: "red",
				icon: <IconAlertCircle size={16} />,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Paper p="md" radius="md" withBorder>
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Erreur"
					color="red"
					variant="light"
					mb="md"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{success && (
				<Alert
					icon={<IconCheck size={16} />}
					title="Succès"
					color="green"
					variant="light"
					mb="md"
					withCloseButton
					onClose={() => setSuccess(null)}
				>
					{success}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmitForm)}>
				<Stack gap="md">
					<Title order={4} mb="xs">
						{initialData
							? "Modifier le document"
							: "Télécharger un nouveau document"}
					</Title>
					
					{modelInfo && !initialData && (
						<Alert
							icon={<IconBuilding size={16} />}
							title="Information"
							color="blue"
							variant="light"
							mb="md"
						>
							<Group>
								<Text>Ce document sera associé à l'institution:</Text>
								<Badge color="blue">{modelInfo.name}</Badge>
								<Text>({modelInfo.type})</Text>
							</Group>
						</Alert>
					)}

					<TextInput
						label="Titre"
						placeholder="Entrez le titre du document"
						required
						leftSection={<IconFileDescription size={16} />}
						disabled={isLoading}
						{...form.getInputProps("title")}
					/>

					<Textarea
						label="Description"
						placeholder="Entrez la description du document"
						required
						minRows={3}
						disabled={isLoading}
						{...form.getInputProps("description")}
					/>

					{!initialData && (
						<FileInput
							label="Fichier"
							placeholder="Charger le fichier"
							accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,image/*"
							required
							leftSection={<IconUpload size={16} />}
							valueComponent={FileValueComponent}
							disabled={isLoading}
							clearable
							description="Formats acceptés: PDF, Word, Excel, texte, ZIP, images"
							{...form.getInputProps("file")}
						/>
					)}

					<MultiSelect
						label="Visibilité"
						placeholder="Sélectionnez la visibilité"
						data={visibilityOptions}
						required
						leftSection={<IconEye size={16} />}
						disabled={isLoading}
						clearable
						searchable
						{...form.getInputProps("visibility")}
					/>

					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={onCancel} disabled={isLoading}>
							Annuler
						</Button>
						<Button
							type="submit"
							loading={isLoading}
							leftSection={
								isLoading ? <Loader size={14} /> : <IconUpload size={14} />
							}
						>
							{initialData ? "Modifier" : "Télécharger"}
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
