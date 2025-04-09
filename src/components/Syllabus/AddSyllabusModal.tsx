import { useState, useEffect } from "react";
import {
	Modal,
	Select,
	MultiSelect,
	NumberInput,
	Stack,
	TextInput,
	Button,
	Group,
	Alert,
	Loader,
	Text,
	Badge,
	Divider,
	Tooltip,
	Paper,
	Title,
} from "@mantine/core";
import { Branch, Level } from "@/components/Syllabus/Syllabus";
import { ShowUniversitWihClassrooms, ShowIpesWithClassrooms } from "@/types";
import {
	IconAlertCircle,
	IconCheck,
	IconInfoCircle,
	IconCalendar,
} from "@tabler/icons-react";
import { innerUrl } from "@/app/lib/utils";

interface Ue {
	id: string;
	name: string;
	description: string;
	validate?: string;
	author?: {
		user_id: string;
	};
}

interface FetchedCourse {
	id: string;
	name: string;
	description: string;
	pivot: {
		salle_id: string;
		ue_id: string;
		year: string;
		nbr_hrs: string;
		credit: string;
	};
}

interface AddProgramModalProps {
	opened: boolean;
	onClose: () => void;
	onSubmitted: (program: any) => void;
	universities: ShowUniversitWihClassrooms[] | ShowIpesWithClassrooms[];
	existingPrograms: any[]; // Add this to check for existing programs
	isCentralInstitution: boolean;
	currentInstitute: string;
	instituteName: string;
	instituteType?: "IPES" | "University"; // Add instituteType prop
}

export function AddSyllabusModal({
	opened,
	onClose,
	onSubmitted,
	universities,
	existingPrograms = [],
	isCentralInstitution,
	currentInstitute,
	instituteName,
	instituteType = "University", // Default to University for backward compatibility
}: AddProgramModalProps) {
	// Determine initial universityId based on institution type
	const initialUniversityId = !isCentralInstitution 
		? (universities).find(u => u.institute == currentInstitute)?.id || null
		: null;
	console.log("Initial university ID:", initialUniversityId, "Current institute:", currentInstitute);

	// Get the appropriate institution label based on type
	const getInstitutionLabel = () => {
		return instituteType === "University" ? "Université" : "IPES";
	};

	const [formData, setFormData] = useState({
		universityId: initialUniversityId as string | null,
		branchId: null as string | null,
		levelId: null as string | null,
		selectedUes: [] as string[],
		year: new Date().getFullYear().toString(),
		courseDetails: {} as Record<
			string,
			{ nbr_hrs: string; credit: string }
		>,
	});
	const [ues, setUes] = useState<Ue[]>([]);
	const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
	const [filters, setFilters] = useState({
		universityId: initialUniversityId as string | null,
		branchId: null as string | null,
		levelId: null as string | null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [existingUes, setExistingUes] = useState<FetchedCourse[]>([]);
	const [programExists, setProgramExists] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{
		type: "info" | "success" | "error";
		message: string;
	} | null>(null);

	// Generate available years (current year and 10 years back)
	const currentYear = new Date().getFullYear();
	const availableYears = Array.from({ length: 11 }, (_, i) =>
		(currentYear - i).toString(),
	);

	const handleFilter = (newFilters: typeof filters) => {
		setFilters(newFilters);
	};

	// When the modal is opened, ensure the proper initialization for non-central institutions
	useEffect(() => {
		if (opened && !isCentralInstitution && currentInstitute && universities.length > 0) {
			const matchingUniversity = (universities).find(u => u.institute == currentInstitute);
			if (matchingUniversity) {
				const universityId = matchingUniversity.id;
				console.log("Non-central institution: Setting initial university ID:", universityId);
				
				setFormData(prev => ({
					...prev,
					universityId: universityId
				}));
				
				setFilters(prev => ({
					...prev,
					universityId: universityId
				}));
			}
		}
	}, [opened, universities, isCentralInstitution, currentInstitute]);

	// Fetch all UEs
	useEffect(() => {
		async function getUes() {
			try {
				setIsLoading(true);
				const u = await fetch(innerUrl("/api/ues")).then((res) =>
					res.json(),
				);
				const fetchedUes: Ue[] = u.data;
				setUes(fetchedUes);
			} catch (e) {
				console.log("Error to get Ues", e);
				setStatusMessage({
					type: "error",
					message: "Erreur lors de la récupération des UEs",
				});
			} finally {
				setIsLoading(false);
			}
		}
		if (opened) {
			getUes();
		}
	}, [opened]);

	// Fetch branches when university changes
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				
				// For non-central institutions, use the currentInstitute regardless of filters.universityId
				if (!isCentralInstitution && currentInstitute) {
					console.log("Modal - Non-central: Loading branches for institution with ID:", currentInstitute);
					
					const branches: Branch[] = [];
					const matchingUniversities = (universities).filter(u => u.institute == currentInstitute);
					
					console.log("Modal - Non-central: Found matching universities:", matchingUniversities.length);
					
					matchingUniversities.forEach(university => {
						university.salles.forEach((salle) => {
							const filiere = salle.branch;
							const exists = branches.some((branch) => branch.id === filiere.id);
							if (!exists) {
								branches.push({
									id: filiere.id,
									name: filiere.name,
								});
							}
						});
					});
					
					console.log("Modal - Non-central: Found branches:", branches);
					setAvailableBranches(branches);
				}
				// For central institutions, use the selected university
				else if (isCentralInstitution && filters.universityId) {
					console.log("Modal - Central: Loading branches for university with ID:", filters.universityId);
					
					const branches: Branch[] = [];
					const university = (universities).find(
						(university: any) =>
							university.id == filters.universityId,
					);
					
					university?.salles.forEach((salle) => {
						const filiere = salle.branch;
						const exists = branches.some((branch) => branch.id === filiere.id);
						if (!exists) {
							branches.push({
								id: filiere.id,
								name: filiere.name,
							});
						}
					});
					
					console.log("Modal - Central: Found branches:", branches);
					setAvailableBranches(branches);
				}
			} catch (error) {
				console.error("Error fetching branches:", error);
				setStatusMessage({
					type: "error",
					message: "Erreur lors de la récupération des filières",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [filters.universityId, universities, isCentralInstitution, currentInstitute]);

	// Fetch levels when branch changes
	useEffect(() => {
		const fetchData = async () => {
			try {
				if (filters.branchId) {
					setIsLoading(true);
					
					// For non-central institutions
					if (!isCentralInstitution && currentInstitute) {
						console.log("Modal - Non-central: Loading levels for branch with ID:", filters.branchId);
						
						const levels: Level[] = [];
						const matchingUniversities = (universities).filter(u => u.institute == currentInstitute);
						
						matchingUniversities.forEach(university => {
							university.salles.forEach((salle) => {
								const filiere = salle.branch;
								const niveau = salle.level;
								
								if (filiere.id == filters.branchId) {
									const exists = levels.some((level) => level.id === niveau.id);
									if (!exists) {
										levels.push({
											id: niveau.id,
											name: niveau.name,
										});
									}
								}
							});
						});
						
						console.log("Modal - Non-central: Found levels:", levels);
						setAvailableLevels(levels);
					}
					// For central institutions
					else if (isCentralInstitution && filters.universityId) {
						console.log("Modal - Central: Loading levels for university with ID:", filters.universityId, "and branch with ID:", filters.branchId);
						
						const levels: Level[] = [];
						const university = (universities).find(
							(university: any) =>
								university.id == filters.universityId,
						);
						
						university?.salles.forEach((salle) => {
							const filiere = salle.branch;
							const niveau = salle.level;
							
							if (filiere.id == filters.branchId) {
								const exists = levels.some((level) => level.id === niveau.id);
								if (!exists) {
									levels.push({
										id: niveau.id,
										name: niveau.name,
									});
								}
							}
						});
						
						console.log("Modal - Central: Found levels:", levels);
						setAvailableLevels(levels);
					}
				}
			} catch (error) {
				console.error("Error fetching levels:", error);
				setStatusMessage({
					type: "error",
					message: "Erreur lors de la récupération des niveaux",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [filters.branchId, filters.universityId, universities, isCentralInstitution, currentInstitute]);

	// Check if program exists and fetch existing UEs when level changes
	useEffect(() => {
		const fetchExistCourses = async () => {
			try {
				if (filters.levelId && filters.branchId && filters.universityId) {
					setIsLoading(true);

					// Check if program already exists
					const classrooms = (universities).find(
						(university: any) =>
							university.id == filters.universityId,
					)?.salles;

					const classroom = classrooms?.find(
						(s) =>
							s.level.id == filters.levelId && s.branch.id == filters.branchId,
					);

					if (!classroom) {
						setProgramExists(false);
						setExistingUes([]);
						return;
					}

					// Check if this program exists in our existing programs
					const existingProgram = existingPrograms.find(
						(p) =>
							p.universityId == filters.universityId &&
							p.branchId == filters.branchId &&
							p.levelId == filters.levelId,
					);

					setProgramExists(!!existingProgram);
					setIsUpdating(!!existingProgram);

					// Fetch existing UEs for this classroom
					const request = await fetch(
						innerUrl(`/api/syllabus/${classroom.id}/classroom`),
					).then((res) => res.json());

					const courses: FetchedCourse[] = request.data || [];
					setExistingUes(courses);

					// Pre-populate form with existing UEs
					if (courses && courses.length > 0) {
						const selectedUeIds = courses.map((course) => course.id);
						const courseDetails = courses.reduce(
							(acc, course) => ({
								...acc,
								[course.id]: {
									nbr_hrs: course.pivot.nbr_hrs,
									credit: course.pivot.credit,
								},
							}),
							{},
						);

						setFormData((prev) => ({
							...prev,
							universityId: filters.universityId,
							branchId: filters.branchId,
							levelId: filters.levelId,
							selectedUes: selectedUeIds,
							courseDetails,
						}));

						setStatusMessage({
							type: "info",
							message: `${courses.length} UE(s) déjà associées à ce programme. Vous pouvez les modifier ou en ajouter d'autres.`,
						});
					} else {
						setStatusMessage(null);
					}
				}
			} catch (error) {
				console.error("Error fetching existing courses:", error);
				setStatusMessage({
					type: "error",
					message: "Erreur lors de la récupération des UEs existantes",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (filters.levelId) {
			fetchExistCourses();
		}
	}, [
		filters.levelId,
		filters.branchId,
		filters.universityId,
		universities,
		existingPrograms,
	]);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			// Remove year validation per UE since it's now at program level
			if (!formData.year || isNaN(Number(formData.year))) {
				setStatusMessage({
					type: "error",
					message: "Veuillez sélectionner une année valide pour le programme",
				});
				setIsLoading(false);
				return;
			}

			// Check for duplicate UEs
			const duplicateUes = new Set();
			const seenUes = new Set();

			formData.selectedUes.forEach((ueId) => {
				if (seenUes.has(ueId)) {
					duplicateUes.add(ueId);
				}
				seenUes.add(ueId);
			});

			if (duplicateUes.size > 0) {
				const duplicateNames = Array.from(duplicateUes)
					.map((id) => ues.find((ue) => ue.id === id)?.name)
					.join(", ");

				setStatusMessage({
					type: "error",
					message: `Les UEs suivantes sont en double: ${duplicateNames}`,
				});
				setIsLoading(false);
				return;
			}

			// Check if any UE already exists in the program for the selected year
			const duplicatesWithExisting = formData.selectedUes.filter((ueId) =>
				existingUes.some(
					(existingUe) =>
						existingUe.id === ueId &&
						existingUe.pivot.year === formData.year &&
						!formData.selectedUes.includes(existingUe.id),
				),
			);

			if (duplicatesWithExisting.length > 0) {
				const duplicateNames = duplicatesWithExisting
					.map((id) => ues.find((ue) => ue.id === id)?.name)
					.join(", ");

				setStatusMessage({
					type: "error",
					message: `Les UEs suivantes existent déjà pour l'année ${formData.year}: ${duplicateNames}`,
				});
				setIsLoading(false);
				return;
			}

			const programCourses = formData.selectedUes.map((ueId) => {
				const ue = ues.find((c) => c.id.toString() === ueId);
				const details = formData.courseDetails[ueId];

				return {
					courseId: Number.parseInt(ueId),
					name: ue?.name,
					description: ue?.description,
					nbr_hrs: details.nbr_hrs,
					credit: details.credit,
					year: formData.year, // Use the program level year
				};
			});

			const classrooms = (universities).find(
				(university: any) =>
					university.id == formData.universityId,
			)?.salles;

			const classroom = classrooms?.find(
				(s) =>
					s.level.id == formData.levelId && s.branch.id == formData.branchId,
			);

			if (!classroom) {
				throw new Error("Classroom not found");
			}

			const classroomId = classroom.id;

			// Prepare data for API with explicit year value
			const datas = programCourses.map((programCourse) => ({
				ue: String(programCourse.courseId),
				credit: programCourse.credit,
				nbr_hrs: programCourse.nbr_hrs,
				year: programCourse.year, // Ensure year is explicitly set
			}));

			console.log("Sending data to API:", datas); // Debug log

			// Make API requests
			const requests = datas.map((data) =>
				fetch(innerUrl(`/api/syllabus/${classroomId}/addue`), {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}),
			);

			await Promise.all(requests);

			// Get the university of guardianship for IPES
			let guardianUniversity = null;
			if (instituteType === "IPES") {
				const selectedIpes = (universities as ShowIpesWithClassrooms[]).find(
					i => i.id == formData.universityId
				);
				guardianUniversity = selectedIpes?.university?.name;
			}

			// Notify parent component
			onSubmitted({
				universityId: formData.universityId,
				branchId: formData.branchId,
				levelId: formData.levelId,
				branchName: classroom.branch.name,
				levelName: classroom.level.name,
				classroomId: classroom.id,
				institute: (universities).find((u) => u.id == formData.universityId)
					?.institute,
				courses: programCourses,
				guardianUniversity: guardianUniversity, // Add university of guardianship for IPES
			});

			setStatusMessage({
				type: "success",
				message: isUpdating
					? `Programme ${instituteType === "IPES" ? "IPES " : ""}mis à jour avec succès`
					: `Programme ${instituteType === "IPES" ? "IPES " : ""}créé avec succès`,
			});

			// Reset form after a delay
			setTimeout(() => {
				setFormData({
					universityId: null,
					branchId: null,
					levelId: null,
					selectedUes: [],
					year: currentYear.toString(),
					courseDetails: {},
				});
				setFilters({
					universityId: null,
					branchId: null,
					levelId: null,
				});
				onClose();
			}, 1500);
		} catch (e) {
			console.error("Error submitting program:", e);
			setStatusMessage({
				type: "error",
				message: `Erreur lors de l'enregistrement du programme ${instituteType === "IPES" ? "IPES" : ""}`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle UE selection with duplicate checking
	const handleUeSelection = (value: string[]) => {
		// Get newly added UEs
		const newUes = value.filter((ueId) => !formData.selectedUes.includes(ueId));

		// Check for duplicates with existing UEs
		const duplicates = newUes.filter((ueId) =>
			existingUes.some((existingUe) => existingUe.id === ueId),
		);

		if (duplicates.length > 0) {
			const duplicateNames = duplicates
				.map((id) => ues.find((ue) => ue.id === id)?.name)
				.join(", ");

			setStatusMessage({
				type: "info",
				message: `Les UEs suivantes existent déjà et seront mises à jour: ${duplicateNames}`,
			});
		}

		setFormData((prev) => ({
			...prev,
			selectedUes: value,
			courseDetails: value.reduce(
				(acc, courseId) => ({
					...acc,
					[courseId]: prev.courseDetails[courseId] ||
						// If this UE already exists in the program, use its values
						existingUes.find((eu) => eu.id === courseId)?.pivot || {
							nbr_hrs: "0",
							credit: "0",
						},
				}),
				{},
			),
		}));
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isUpdating ? `Modifier un programme ${instituteType === "IPES" ? "IPES" : ""}` : `Ajouter un programme ${instituteType === "IPES" ? "IPES" : ""}`}
			size="xl"
			padding="lg"
			radius="md"
			centered
		>
			{statusMessage && (
				<Alert
					icon={
						statusMessage.type === "error" ? (
							<IconAlertCircle size={16} />
						) : statusMessage.type === "success" ? (
							<IconCheck size={16} />
						) : (
							<IconInfoCircle size={16} />
						)
					}
					title={
						statusMessage.type === "error"
							? "Erreur"
							: statusMessage.type === "success"
								? "Succès"
								: "Information"
					}
					color={
						statusMessage.type === "error"
							? "red"
							: statusMessage.type === "success"
								? "green"
								: "blue"
					}
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
					<Text size="sm">Chargement en cours...</Text>
				</Group>
			)}

			<Stack gap="md">
				<Paper withBorder p="md">
					<Title order={6} mb="xs">
						Informations du programme {instituteType === "IPES" ? "IPES" : ""}
					</Title>
					{!isCentralInstitution && (
						<Paper p="sm" withBorder mb="md">
							<Group>
								<Text size="sm" fw={500}>{getInstitutionLabel()} :</Text>
								<Text>{instituteName}</Text>
							</Group>
						</Paper>
					)}
					{isCentralInstitution && (
						<Select
							label={getInstitutionLabel()}
							placeholder={`Sélectionner ${instituteType === "University" ? "une université" : "un IPES"}`}
							data={(universities).map((u) => ({
								value: u.id.toString(),
								label: u.name,
							}))}
							value={formData.universityId?.toString()}
							onChange={(value) => {
								setFilters({
									...filters,
									universityId: value ? String(value) : null,
								});
								setFormData((prev) => ({
									...prev,
									universityId: value ? value : null,
									branchId: null,
									levelId: null,
								}));
							}}
							required
							searchable
							nothingFoundMessage={`Aucun${instituteType === "IPES" ? "" : "e"} ${instituteType === "University" ? "université" : "IPES"} trouvé${instituteType === "IPES" ? "" : "e"}`}
							disabled={isLoading}
							size="md"
						/>
					)}
					<Group grow>					
						<Select
							label="Filière"
							placeholder="Sélectionner une filière"
							data={availableBranches.map((d) => ({
								value: d.id.toString(),
								label: d.name,
							}))}
							value={formData.branchId?.toString()}
							onChange={(value) => {
								// For non-central institutions, ensure the universityId is properly set
								if (!isCentralInstitution) {
									const universityId = (universities).find(u => u.institute == currentInstitute)?.id || null;
									
									setFilters({
										...filters,
										universityId: universityId,
										branchId: value ? value : null,
									});
									
									setFormData((prev) => ({
										...prev,
										universityId: universityId,
										branchId: value ? value : null,
										levelId: null,
									}));
								} else {
									setFilters({
										...filters,
										branchId: value ? value : null,
									});
									
									setFormData((prev) => ({
										...prev,
										branchId: value ? value : null,
										levelId: null,
									}));
								}
							}}
							disabled={(isCentralInstitution && !formData.universityId) || isLoading}
							required
							searchable
							nothingFoundMessage="Aucune filière disponible"
							size="md"
						/>

						<Select
							label="Niveau"
							placeholder="Sélectionner un niveau"
							data={availableLevels.map((l) => ({
								value: l.id.toString(),
								label: l.name,
							}))}
							value={formData.levelId?.toString()}
							onChange={(value) => {
								setFilters({
									...filters,
									levelId: value ? value : null,
								});
								setFormData((prev) => ({
									...prev,
									levelId: value ? value : null,
								}));
							}}
							disabled={!formData.branchId || isLoading}
							required
							searchable
							nothingFoundMessage="Aucun niveau disponible"
							size="md"
						/>
					</Group>

					{formData.levelId && (
						<Select
							label="Année académique"
							placeholder="Sélectionner l'année"
							data={availableYears.map((year) => ({
								value: year,
								label: year,
							}))}
							value={formData.year}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									year: value || currentYear.toString(),
								}))
							}
							required
							searchable
							leftSection={<IconCalendar size={16} />}
							disabled={isLoading}
							size="md"
							mt="md"
						/>
					)}
				</Paper>

				{programExists && (
					<Alert
						color="yellow"
						icon={<IconInfoCircle size={16} />}
						variant="light"
					>
						Ce programme {instituteType === "IPES" ? "IPES " : ""}existe déjà. Les modifications seront appliquées au
						programme existant.
					</Alert>
				)}

				{existingUes.length > 0 && (
					<Paper withBorder p="md">
						<Stack gap="xs">
							<Title order={6}>UEs existantes</Title>
							<Group gap="xs" wrap="wrap">
								{existingUes.map((ue) => (
									<Tooltip
										key={ue.id}
										label={`${ue.pivot.nbr_hrs}h - ${ue.pivot.credit} crédits - Année ${ue.pivot.year}`}
									>
										<Badge color="blue" size="lg" radius="sm" variant="light">
											{ue.name}
										</Badge>
									</Tooltip>
								))}
							</Group>
						</Stack>
					</Paper>
				)}

				<Paper withBorder p="md">
					<Stack gap="md">
						<Title order={6}>Sélection des UEs {instituteType === "IPES" ? "IPES" : ""}</Title>
						<MultiSelect
							label="UEs"
							placeholder="Sélectionner les UEs"
							data={[
								{
									group: "UEs déjà associées",
									items: ues
										.filter((c) => existingUes.some((eu) => eu.id === c.id))
										.map((c) => ({
											value: c.id.toString(),
											label: c.name.toString(),
										})),
								},
								{
									group: "Nouvelles UEs",
									items: ues
										.filter((c) => !existingUes.some((eu) => eu.id === c.id))
										.map((c) => ({
											value: c.id.toString(),
											label: c.name.toString(),
										})),
								},
							].filter((group) => group.items.length > 0)}
							value={formData.selectedUes}
							onChange={handleUeSelection}
							required
							searchable
							nothingFoundMessage="Aucune UE trouvée"
							disabled={!formData.levelId || isLoading}
							maxDropdownHeight={300}
							clearable
							size="md"
						/>

						{formData.selectedUes.map((ueId) => {
							const course = ues.find((c) => c.id.toString() === ueId);
							const isExisting = existingUes.some((eu) => eu.id === ueId);

							return (
								<Paper key={ueId} withBorder p="xs">
									<Group grow>
										<Text fw={500}>
											{course?.name}
											{isExisting && (
												<Badge size="xs" color="blue" variant="light" ml="xs">
													Existant
												</Badge>
											)}
										</Text>
										<NumberInput
											label="Heures"
											value={Number(formData.courseDetails[ueId]?.nbr_hrs) || 0}
											onChange={(value) =>
												setFormData((prev) => ({
													...prev,
													courseDetails: {
														...prev.courseDetails,
														[ueId]: {
															...prev.courseDetails[ueId],
															nbr_hrs: String(value) || "0",
														},
													},
												}))
											}
											min={0}
											disabled={isLoading}
											size="md"
										/>
										<NumberInput
											label="Crédits"
											value={Number(formData.courseDetails[ueId]?.credit) || 0}
											onChange={(value) =>
												setFormData((prev) => ({
													...prev,
													courseDetails: {
														...prev.courseDetails,
														[ueId]: {
															...prev.courseDetails[ueId],
															credit: String(value) || "0",
														},
													},
												}))
											}
											min={0}
											disabled={isLoading}
											size="md"
										/>
									</Group>
								</Paper>
							);
						})}
					</Stack>
				</Paper>

				<Group justify="flex-end" mt="md">
					<Button
						variant="light"
						onClick={() => {
							setFilters({
								universityId: null,
								branchId: null,
								levelId: null,
							});
							setFormData({
								universityId: null,
								branchId: null,
								levelId: null,
								selectedUes: [],
								year: currentYear.toString(),
								courseDetails: {},
							});
							setStatusMessage(null);
							onClose();
						}}
						disabled={isLoading}
						size="md"
					>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						loading={isLoading}
						disabled={
							!formData.universityId ||
							!formData.branchId ||
							!formData.levelId ||
							formData.selectedUes.length === 0
						}
						size="md"
					>
						{isUpdating ? "Mettre à jour" : "Ajouter"}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
