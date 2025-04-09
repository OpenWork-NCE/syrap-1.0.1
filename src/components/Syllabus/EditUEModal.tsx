import { useState, useEffect } from "react";
import {
	Modal,
	NumberInput,
	Stack,
	TextInput,
	Button,
	Group,
	Alert,
	Loader,
	Text,
	Textarea,
	Select,
	Paper,
	Title,
} from "@mantine/core";
import { Course } from "./Syllabus";
import { IconAlertCircle, IconCheck, IconCalendar } from "@tabler/icons-react";
import { innerUrl } from "@/app/lib/utils";

interface EditCourseModalProps {
	course: Course | null;
	opened: boolean;
	onClose: () => void;
	onSubmit: (updatedCourse: Course) => void;
	classroomId: string;
	instituteType?: "IPES" | "University";
}

export function EditCourseModal({
	course,
	opened,
	onClose,
	onSubmit,
	classroomId,
	instituteType = "University",
}: EditCourseModalProps) {
	const [formData, setFormData] = useState<Course | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Generate available years (current year and 10 years back)
	const currentYear = new Date().getFullYear();
	const availableYears = Array.from({ length: 11 }, (_, i) =>
		(currentYear - i).toString(),
	);

	// Reset form when modal opens with new course
	useEffect(() => {
		if (opened && course) {
			console.log("Initializing form with course data:", course);
			setFormData({
				...course,
				year: course.year || currentYear.toString(),
				nbr_hrs: course.nbr_hrs || "0",
				credit: course.credit || "0",
			});
			setStatusMessage(null);
		}
	}, [opened, course]);

	if (!formData) return null;

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			setStatusMessage(null);

			console.log("Form data before validation:", formData);

			// Validate form data
			if (!formData.year || !formData.nbr_hrs || !formData.credit) {
				console.log("Validation failed: Missing required fields");
				setStatusMessage({
					type: "error",
					message: "Veuillez remplir tous les champs obligatoires",
				});
				setIsLoading(false);
				return;
			}

			// Validate year format
			if (isNaN(Number(formData.year))) {
				setStatusMessage({
					type: "error",
					message: "L'année doit être un nombre valide",
				});
				setIsLoading(false);
				return;
			}

			// Check if the year is in the available years list
			if (!availableYears.includes(formData.year)) {
				console.log("Validation failed: Invalid year", formData.year);
				setStatusMessage({
					type: "error",
					message:
						"Veuillez sélectionner une année valide parmi les options disponibles",
				});
				setIsLoading(false);
				return;
			}

			// Prepare data for API
			const apiData = {
				ue: formData.courseId,
				credit: formData.credit,
				nbr_hrs: formData.nbr_hrs,
				year: formData.year,
			};

			console.log("Sending data to API:", apiData);

			// Make API request to update UE
			const response = await fetch(
				innerUrl(`/api/syllabus/${classroomId}/addue`),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(apiData),
				},
			);

			const responseData = await response.json();
			console.log("API response:", responseData);

			// Show success message
			setStatusMessage({
				type: "success",
				message: `UE ${instituteType === "IPES" ? "IPES " : ""}mise à jour avec succès`,
			});

			// Notify parent component
			onSubmit(formData);

			// Close modal and reload page after a delay
			setTimeout(() => {
				onClose();
				window.location.reload();
			}, 1500);
		} catch (error) {
			console.error("Error updating UE:", error);
			setStatusMessage({
				type: "error",
				message: `Erreur lors de la mise à jour de l'UE ${instituteType === "IPES" ? "IPES" : ""}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={`Modifier ${instituteType === "IPES" ? "l'UE IPES" : "l'UE"} ${formData.name}`}
			size="lg"
			padding="lg"
			radius="md"
			centered
		>
			{statusMessage && (
				<Alert
					icon={
						statusMessage.type === "error" ? (
							<IconAlertCircle size={16} />
						) : (
							<IconCheck size={16} />
						)
					}
					title={statusMessage.type === "error" ? "Erreur" : "Succès"}
					color={statusMessage.type === "error" ? "red" : "green"}
					mb="md"
					withCloseButton
					onClose={() => setStatusMessage(null)}
					variant="light"
				>
					{statusMessage.message}
				</Alert>
			)}

			{isLoading && (
				<Group justify="center" my="md">
					<Loader size="sm" />
					<Text size="sm">Mise à jour en cours...</Text>
				</Group>
			)}

			<Stack gap="md">
				<Paper withBorder p="md">
					<Stack gap="md">
						<Title order={6} mb="xs">
							Détails de l'UE {instituteType === "IPES" ? "IPES" : ""}
						</Title>
						<Textarea
							label="Description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							minRows={3}
							disabled={isLoading}
							readOnly
							size="md"
						/>

						<Group grow>
							<Select
								label="Année"
								value={formData.year}
								onChange={(value) =>
									setFormData({
										...formData,
										year: value || currentYear.toString(),
									})
								}
								data={availableYears.map((year) => ({
									value: year,
									label: year,
								}))}
								leftSection={<IconCalendar size={16} />}
								searchable
								required
								disabled={isLoading}
								size="md"
							/>

							<NumberInput
								label="Heures"
								value={Number(formData.nbr_hrs)}
								onChange={(value) =>
									setFormData({ ...formData, nbr_hrs: String(value || 0) })
								}
								min={0}
								required
								disabled={isLoading}
								size="md"
							/>

							<NumberInput
								label="Crédits"
								value={Number(formData.credit)}
								onChange={(value) =>
									setFormData({ ...formData, credit: String(value || 0) })
								}
								min={0}
								required
								disabled={isLoading}
								size="md"
							/>
						</Group>
					</Stack>
				</Paper>

				<Group justify="flex-end" mt="md">
					<Button
						variant="light"
						onClick={onClose}
						disabled={isLoading}
						size="md"
					>
						Annuler
					</Button>
					<Button onClick={handleSubmit} loading={isLoading} size="md">
						Sauvegarder
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
