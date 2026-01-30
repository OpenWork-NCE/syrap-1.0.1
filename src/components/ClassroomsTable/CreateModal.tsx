import { useState } from "react";
import { Stack, TextInput, Button, Flex, Title } from "@mantine/core";
import {
	MRT_EditActionButtons,
	MRT_Row,
	MRT_TableInstance,
} from "mantine-react-table";
import { FormattedClassroom } from "@/types";

function validateField(value: string, required: boolean = true) {
	if (required && !value.trim()) {
		return "This field is required";
	}
	return undefined;
}

function validateForm(values: any) {
	const errors: Record<string, string | undefined> = {};
	errors.designation = validateField(values.designation);
	errors.branchName = validateField(values.branchName);
	errors.levelName = validateField(values.levelName);
	return errors;
}

const CustomCreateRowModal = ({
	table,
	row,
}: {
	table: MRT_TableInstance<FormattedClassroom>;
	row: MRT_Row<FormattedClassroom>;
}) => {
	const [values, setValues] = useState({
		designation: "",
		branchName: "",
		levelName: "",
	});
	const [errors, setErrors] = useState<Record<string, string | undefined>>({});

	const handleChange = (key: string, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => ({ ...prev, [key]: undefined })); // Clear field error
	};

	const handleSubmit = () => {
		const validationErrors = validateForm(values);
		if (Object.values(validationErrors).some((error) => error)) {
			setErrors(validationErrors);
			return;
		}

		console.log("On a passé la validation");
		table.setCreatingRow(true);

		console.log("Voici les données : ", table);
	};

	return (
		<Stack gap="md">
			<Title order={3}>Create New Classroom</Title>
			<TextInput
				label="Designation"
				value={values.designation}
				onChange={(e) => handleChange("designation", e.currentTarget.value)}
				error={errors.designation}
				placeholder="Enter classroom designation"
			/>
			<TextInput
				label="Branch Name"
				value={values.branchName}
				onChange={(e) => handleChange("branchName", e.currentTarget.value)}
				error={errors.branchName}
				placeholder="Enter branch name"
			/>
			<TextInput
				label="Level Name"
				value={values.levelName}
				onChange={(e) => handleChange("levelName", e.currentTarget.value)}
				error={errors.levelName}
				placeholder="Enter level name"
			/>
			<Flex justify="flex-end">
				<Button onClick={handleSubmit}>Submit</Button>

				{/*<Flex justify="flex-end" mt="xl">*/}
				{/*	<MRT_EditActionButtons variant="text" table={table} row={row} />*/}
				{/*</Flex>*/}
			</Flex>
		</Stack>
	);
};

export default CustomCreateRowModal;
