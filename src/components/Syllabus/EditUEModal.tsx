import {
	Modal,
	NumberInput,
	Stack,
	TextInput,
	Button,
	Group,
} from "@mantine/core";

interface EditCourseModalProps {
	course: any;
	opened: boolean;
	onClose: () => void;
	onSubmit: (course: any) => void;
}

export function EditCourseModal({
	course,
	opened,
	onClose,
	onSubmit,
}: EditCourseModalProps) {
	if (!course) return null;

	return (
		<Modal opened={opened} onClose={onClose} title={`Modifier ${course.name}`}>
			<Stack>
				<TextInput
					label="Année"
					value={course.year}
					onChange={(e) => (course.year = e.target.value)}
				/>
				<NumberInput
					label="Heures"
					value={course.nbr_hrs}
					onChange={(value) => (course.nbr_hrs = value)}
				/>
				<NumberInput
					label="Crédits"
					value={course.credit}
					onChange={(value) => (course.credit = value)}
				/>

				<Group justify="flex-end">
					<Button variant="light" onClick={onClose}>
						Annuler
					</Button>
					<Button onClick={() => onSubmit(course)}>Sauvegarder</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
