"use client";

import { useState, useEffect } from "react";
import { Select, Button, Stack, Title, Text } from "@mantine/core";
import { ShowUniversitWihClassrooms, ClassroomForWithSyllabus } from "@/types";
import { Branch, Course, Level, Program } from "@/components/Syllabus/Syllabus";

interface ProgramSelectorProps {
	title: string;
	institutes: ShowUniversitWihClassrooms[];
	onClassroomSelect: (classroom: ClassroomForWithSyllabus) => void;
}

export function ProgramSelector({
	title,
	institutes,
	onClassroomSelect,
}: ProgramSelectorProps) {
	const [availableBranches, setAvalaibleBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvalaibleLevels] = useState<Level[]>([]);
	const [selectedInstitute, setSelectedInstitute] = useState<string | null>(
		null,
	);
	const [selectedClassroom, setSelectedClassroom] =
		useState<ClassroomForWithSyllabus | null>(null);
	const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (selectedInstitute) {
					const branches: Branch[] = [];
					const institute = institutes.find(
						(institute: ShowUniversitWihClassrooms) =>
							institute.id == selectedInstitute,
					);
					institute?.salles.forEach((salle) => {
						const filiere = salle.filiere;
						const exists = branches.some((branch) => branch.id === filiere.id);
						if (!exists) {
							branches.push({
								id: filiere.id,
								name: filiere.name,
							});
						}
					});
					setAvalaibleBranches(branches);
				}
				if (selectedBranch) {
					const levels: Level[] = [];
					const institute = institutes.find(
						(institute: ShowUniversitWihClassrooms) =>
							institute.id == selectedInstitute,
					);

					institute?.salles.forEach((salle) => {
						const filiere = salle.filiere;
						const niveau = salle.niveau;
						if (filiere.id == selectedBranch) {
							const exists = levels.some((level) => level.id === niveau.id);
							if (!exists) {
								levels.push({
									id: niveau.id,
									name: niveau.name,
								});
							}
						}
					});
					setAvalaibleLevels(levels);
				}
			} catch (error) {
				console.error("Error fetching branches and levels:", error);
			}
		};
		fetchData();
	}, [selectedInstitute, selectedBranch]);

	const handleSelect = () => {
		const classrooms = institutes.find(
			(institute: ShowUniversitWihClassrooms) =>
				institute.id == selectedInstitute,
		)?.salles;
		const classroom = classrooms?.find(
			(s) => s.niveau.id == selectedLevel && s.filiere.id == selectedBranch,
		);
		if (classroom) {
			setSelectedClassroom(classroom);
			onClassroomSelect(classroom);
		}
	};

	return (
		<Stack>
			<Title order={4}>{title}</Title>
			<Select
				label="Institut"
				placeholder="Choisir un institut"
				data={institutes.map((i) => ({
					value: i.id.toString(),
					label: i.name,
				}))}
				value={selectedInstitute}
				onChange={setSelectedInstitute}
			/>
			<Select
				label="Filière"
				placeholder="Choisir une filière"
				data={availableBranches.map((f) => ({
					value: f.id.toString(),
					label: f.name,
				}))}
				value={selectedBranch}
				onChange={setSelectedBranch}
				disabled={!selectedInstitute}
			/>
			<Select
				label="Niveau"
				placeholder="Choisir un niveau"
				data={availableLevels.map((n) => ({
					value: n.id.toString(),
					label: n.name,
				}))}
				value={selectedLevel}
				onChange={setSelectedLevel}
				disabled={!selectedBranch}
			/>
			<Button onClick={handleSelect} disabled={!selectedLevel}>
				Sélectionner ce programme
			</Button>
			{selectedClassroom && (
				<Text size="sm" mt="md">
					Programme sélectionné : {selectedClassroom.designation} -{" "}
					{selectedClassroom.filiere.name} - {selectedClassroom.niveau.name}
				</Text>
			)}
		</Stack>
	);
}
