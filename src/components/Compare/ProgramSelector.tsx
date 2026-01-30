"use client";

import { useState, useEffect } from "react";
import {
	Select,
	Button,
	Stack,
	Text,
	Group,
	Badge,
	Transition,
	Box,
	Divider,
	Stepper,
	Paper,
	useMantineTheme,
	rem,
} from "@mantine/core";
import {
	IconCheck,
	IconSchool,
	IconBuildingSkyscraper,
	IconSelector,
	IconListDetails,
	IconChartBar,
} from "@tabler/icons-react";
import {
	ShowUniversitWihClassrooms,
	ClassroomForWithSyllabus,
	ShowIpesWithClassrooms,
} from "@/types";
import { Branch, Course, Level, Program } from "@/components/Syllabus/Syllabus";
import { ThemedTitle, ThemedText } from "@/components/ui/ThemeComponents";
import classes from "./Compare.module.css";

interface ProgramSelectorProps {
	title: string;
	institutes: ShowUniversitWihClassrooms[] | ShowIpesWithClassrooms[];
	instituteType: "university" | "ipes";
	onClassroomSelect: (classroom: ClassroomForWithSyllabus) => void;
}

export function ProgramSelector({
	title,
	institutes,
	instituteType,
	onClassroomSelect,
}: ProgramSelectorProps) {
	const [activeStep, setActiveStep] = useState(0);
	const [availableBranches, setAvalaibleBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvalaibleLevels] = useState<Level[]>([]);
	const [selectedInstitute, setSelectedInstitute] = useState<string | null>(
		null,
	);
	const [selectedClassroom, setSelectedClassroom] =
		useState<ClassroomForWithSyllabus | null>(null);
	const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const theme = useMantineTheme();

	// Handle institute selection
	const handleInstituteSelect = (value: string | null) => {
		setSelectedInstitute(value);
		if (value) {
			setActiveStep(1);
		} else {
			setActiveStep(0);
			setSelectedBranch(null);
			setSelectedLevel(null);
			setSelectedClassroom(null);
		}
	};

	// Handle branch selection
	const handleBranchSelect = (value: string | null) => {
		setSelectedBranch(value);
		if (value) {
			setActiveStep(2);
		} else {
			setActiveStep(1);
			setSelectedLevel(null);
			setSelectedClassroom(null);
		}
	};

	// Handle level selection
	const handleLevelSelect = (value: string | null) => {
		setSelectedLevel(value);
		if (value) {
			setActiveStep(3);
		} else {
			setActiveStep(2);
			setSelectedClassroom(null);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (selectedInstitute) {
					setIsLoading(true);
					// Reset downstream selections when institute changes
					setSelectedBranch(null);
					setSelectedLevel(null);
					setSelectedClassroom(null);

					const branches: Branch[] = [];
					const institute = institutes.find(
						(institute: ShowUniversitWihClassrooms | ShowIpesWithClassrooms) =>
							institute.id == selectedInstitute,
					);

					institute?.salles.forEach((salle) => {
						const filiere = salle.branch;
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
			} catch (error) {
				console.error("Error fetching branches:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [selectedInstitute, institutes]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (selectedBranch && selectedInstitute) {
					setIsLoading(true);
					// Reset level selection when branch changes
					setSelectedLevel(null);
					setSelectedClassroom(null);

					const levels: Level[] = [];
					const institute = institutes.find(
						(institute: ShowUniversitWihClassrooms | ShowIpesWithClassrooms) =>
							institute.id == selectedInstitute,
					);

					institute?.salles.forEach((salle) => {
						const filiere = salle.branch;
						const niveau = salle.level;
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
				console.error("Error fetching levels:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [selectedBranch, selectedInstitute, institutes]);

	const handleSelect = () => {
		const classrooms = institutes.find(
			(institute: ShowUniversitWihClassrooms | ShowIpesWithClassrooms) =>
				institute.id == selectedInstitute,
		)?.salles;

		const classroom = classrooms?.find(
			(s) => s.level.id == selectedLevel && s.branch.id == selectedBranch,
		);

		if (classroom) {
			setSelectedClassroom(classroom);
			onClassroomSelect(classroom);
		}
		setActiveStep(4);
	};

	const getInstitutionIcon = () => {
		return title.toLowerCase().includes("université") ? (
			<IconSchool size={18} />
		) : (
			<IconBuildingSkyscraper size={18} />
		);
	};

	const getSelectedInstituteName = () => {
		if (!selectedInstitute) return "";
		const institute = institutes.find(
			(i) => i.id.toString() === selectedInstitute,
		);
		return institute ? institute.name : "";
	};

	const getSelectedBranchName = () => {
		if (!selectedBranch) return "";
		const branch = availableBranches.find(
			(b) => b.id.toString() === selectedBranch,
		);
		return branch ? branch.name : "";
	};

	const getSelectedLevelName = () => {
		if (!selectedLevel) return "";
		const level = availableLevels.find(
			(l) => l.id.toString() === selectedLevel,
		);
		return level ? level.name : "";
	};

	return (
		<Stack align="stretch" justify="center" gap="lg">
			<ThemedTitle order={4} className={classes.title}>
				{title}
			</ThemedTitle>

			<Stepper
				active={activeStep}
				onStepClick={setActiveStep}
				color="var(--primary-6)"
				classNames={{
					stepBody: classes.stepperBody,
					step: classes.stepperStep,
					stepLabel: classes.stepperLabel,
					stepDescription: classes.stepperDescription,
				}}
			>
				<Stepper.Step
					label={instituteType === "university" ? "Université" : "IPES"}
					description={
						selectedInstitute ? getSelectedInstituteName() : "Sélectionner"
					}
					icon={<IconBuildingSkyscraper size={18} />}
					allowStepSelect={true}
				>
					<Paper p="md" withBorder radius="md" className={classes.stepContent}>
						<ThemedText size="sm" mb="md" className={classes.stepperText}>
							Sélectionnez l'institut pour lequel vous souhaitez comparer les
							programmes.
						</ThemedText>
						<Select
							label="Institut"
							placeholder="Choisir un institut"
							data={institutes.map((i) => ({
								value: i.id.toString(),
								label: i.name,
							}))}
							value={selectedInstitute}
							onChange={handleInstituteSelect}
							searchable
							nothingFoundMessage="Aucun institut trouvé"
							leftSection={getInstitutionIcon()}
							className="theme-input"
						/>
					</Paper>
				</Stepper.Step>

				<Stepper.Step
					label="Filière"
					description={
						selectedBranch ? getSelectedBranchName() : "Sélectionner"
					}
					icon={<IconSelector size={18} />}
					allowStepSelect={!!selectedInstitute}
				>
					<Paper p="md" withBorder radius="md" className={classes.stepContent}>
						<ThemedText size="sm" mb="md" className={classes.stepperText}>
							Sélectionnez la filière d'études pour ce programme.
						</ThemedText>
						<Select
							label="Filière"
							placeholder="Choisir une filière"
							data={availableBranches.map((f) => ({
								value: f.id.toString(),
								label: f.name,
							}))}
							value={selectedBranch}
							onChange={handleBranchSelect}
							disabled={!selectedInstitute || isLoading}
							searchable
							nothingFoundMessage="Aucune filière disponible"
							className="theme-input"
						/>
					</Paper>
				</Stepper.Step>

				<Stepper.Step
					label="Niveau"
					description={selectedLevel ? getSelectedLevelName() : "Sélectionner"}
					icon={<IconChartBar size={18} />}
					allowStepSelect={!!selectedBranch}
				>
					<Paper p="md" withBorder radius="md" className={classes.stepContent}>
						<ThemedText size="sm" mb="md" className={classes.stepperText}>
							Sélectionnez le niveau d'études pour ce programme.
						</ThemedText>
						<Select
							label="Niveau"
							placeholder="Choisir un niveau"
							data={availableLevels.map((n) => ({
								value: n.id.toString(),
								label: n.name,
							}))}
							value={selectedLevel}
							onChange={handleLevelSelect}
							disabled={!selectedBranch || isLoading}
							className="theme-input"
						/>
					</Paper>
				</Stepper.Step>

				<Stepper.Step
					label="Confirmation"
					icon={<IconListDetails size={18} />}
					allowStepSelect={!!selectedLevel}
				>
					<Paper p="md" withBorder radius="md" className={classes.stepContent}>
						<ThemedText size="sm" mb="md" className={classes.stepperText}>
							Vérifiez les détails du programme et confirmez votre sélection.
						</ThemedText>

						<Box className={classes.confirmationBox}>
							<Group mb="xs">
								<ThemedText fw={500} size="sm">
									Institut:
								</ThemedText>
								<Badge color="blue" variant="light" size="lg">
									{getSelectedInstituteName()}
								</Badge>
							</Group>

							<Group mb="xs">
								<ThemedText fw={500} size="sm">
									Filière:
								</ThemedText>
								<Badge color="cyan" variant="light" size="lg">
									{getSelectedBranchName()}
								</Badge>
							</Group>

							<Group mb="md">
								<ThemedText fw={500} size="sm">
									Niveau:
								</ThemedText>
								<Badge color="teal" variant="light" size="lg">
									{getSelectedLevelName()}
								</Badge>
							</Group>

							<Button
								onClick={handleSelect}
								disabled={!selectedLevel || isLoading}
								variant="gradient"
								gradient={{
									from: "var(--primary-6)",
									to: "var(--primary-4)",
									deg: 45,
								}}
								leftSection={<IconCheck size={16} />}
								className={`${classes.confirmButton} theme-button`}
								fullWidth
							>
								Confirmer la sélection
							</Button>
						</Box>
					</Paper>
				</Stepper.Step>
			</Stepper>

			<Transition
				mounted={!!selectedClassroom}
				transition="slide-up"
				duration={300}
			>
				{(styles) => (
					<Box style={styles}>
						{selectedClassroom && (
							<Paper
								p="md"
								withBorder
								radius="md"
								className={classes.selectedProgramCard}
							>
								<ThemedTitle order={5} mb="sm">
									Programme sélectionné
								</ThemedTitle>
								<Group justify="apart">
									<Box>
										<Badge
											className="theme-badge"
											size="xl"
											variant="filled"
											mb="xs"
										>
											{selectedClassroom.designation}
										</Badge>
										<ThemedText size="sm" className={classes.stepperText}>
											{selectedClassroom.branch.name} -{" "}
											{selectedClassroom.level.name}
										</ThemedText>
									</Box>
									<IconCheck size={24} className={classes.checkIcon} />
								</Group>
							</Paper>
						)}
					</Box>
				)}
			</Transition>
		</Stack>
	);
}
