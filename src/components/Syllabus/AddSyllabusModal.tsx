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
import { ShowUniversitWihClassrooms } from "@/types";
import {
	IconAlertCircle,
	IconCheck,
	IconInfoCircle,
	IconCalendar,
} from "@tabler/icons-react";

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
	universities: ShowUniversitWihClassrooms[];
	existingPrograms: any[]; // Add this to check for existing programs
}

export function AddSyllabusModal({
	opened,
	onClose,
	onSubmitted,
	universities,
	existingPrograms = [],
}: AddProgramModalProps) {
	const [formData, setFormData] = useState({
		universityId: null as string | null,
		branchId: null as string | null,
		levelId: null as string | null,
		selectedUes: [] as string[],
		courseDetails: {} as Record<
			string,
			{ nbr_hrs: string; year: string; credit: string }
		>,
	});
	const [ues, setUes] = useState<Ue[]>([]);
	const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
	const [filters, setFilters] = useState({
		universityId: null as string | null,
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

	// Fetch all UEs
	useEffect(() => {
		async function getUes() {
			try {
				setIsLoading(true);
				const u = await fetch("http://localhost:3000/api/ues").then((res) =>
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
				if (filters.universityId) {
					setIsLoading(true);
					const branches: Branch[] = [];
					const university = universities.find(
						(university: ShowUniversitWihClassrooms) =>
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
	}, [filters.universityId, universities]);

	// Fetch levels when branch changes
	useEffect(() => {
		const fetchData = async () => {
			try {
				if (filters.branchId && filters.universityId) {
					setIsLoading(true);
					const levels: Level[] = [];
					const university = universities.find(
						(university: ShowUniversitWihClassrooms) =>
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
					setAvailableLevels(levels);
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
	}, [filters.branchId, filters.universityId, universities]);

	// Check if program exists and fetch existing UEs when level changes
	useEffect(() => {
		const fetchExistCourses = async () => {
			try {
				if (filters.levelId && filters.branchId && filters.universityId) {
					setIsLoading(true);

					// Check if program already exists
					const classrooms = universities.find(
						(university: ShowUniversitWihClassrooms) =>
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
						`http://localhost:3000/api/syllabus/${classroom.id}/classroom`,
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
									year: course.pivot.year,
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

			// Validate that all UEs have a valid year
			const invalidYears = formData.selectedUes.filter((ueId) => {
				const yearValue = formData.courseDetails[ueId]?.year;
				return !yearValue || isNaN(Number(yearValue));
			});

			if (invalidYears.length > 0) {
				setStatusMessage({
					type: "error",
					message: "Veuillez sélectionner une année valide pour toutes les UEs",
				});
				setIsLoading(false);
				return;
			}

			// Check for duplicate UEs in the same year
			const duplicateUesInSameYear = [];
			const ueYearMap = new Map();

			formData.selectedUes.forEach((ueId) => {
				const year = formData.courseDetails[ueId]?.year;
				const key = `${ueId}-${year}`;

				if (ueYearMap.has(key)) {
					duplicateUesInSameYear.push(ueId);
				} else {
					ueYearMap.set(key, true);
				}
			});

			// Check if any UE already exists in the program with the same year
			const duplicatesWithExisting = formData.selectedUes.filter((ueId) => {
				const year = formData.courseDetails[ueId]?.year;
				return existingUes.some(
					(existingUe) =>
						existingUe.id === ueId &&
						existingUe.pivot.year === year &&
						!formData.selectedUes.includes(existingUe.id),
				);
			});

			if (duplicatesWithExisting.length > 0) {
				const duplicateNames = duplicatesWithExisting
					.map((id) => ues.find((ue) => ue.id === id)?.name)
					.join(", ");

				setStatusMessage({
					type: "error",
					message: `Les UEs suivantes existent déjà pour la même année: ${duplicateNames}. Vous pouvez ajouter la même UE uniquement pour une année différente.`,
				});
				setIsLoading(false);
				return;
			}

			const programCourses = formData.selectedUes.map((ueId) => {
				const ue = ues.find((c) => c.id == ueId);
				const details = formData.courseDetails[ueId];

				// Ensure we're using the selected year, not a hardcoded value
				return {
					courseId: Number.parseInt(ueId),
					name: ue?.name,
					description: ue?.description,
					nbr_hrs: details.nbr_hrs,
					credit: details.credit,
					year: details.year, // Make sure we're using the selected year
				};
			});

			const classrooms = universities.find(
				(university: ShowUniversitWihClassrooms) =>
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
				fetch(`http://localhost:3000/api/syllabus/${classroomId}/addue`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}),
			);

			await Promise.all(requests);

			// Notify parent component
			onSubmitted({
				universityId: formData.universityId,
				branchId: formData.branchId,
				levelId: formData.levelId,
				branchName: classroom.branch.name,
				levelName: classroom.level.name,
				classroomId: classroom.id,
				institute: universities.find((u) => u.id == formData.universityId)
					?.institute_id,
				courses: programCourses,
			});

			setStatusMessage({
				type: "success",
				message: isUpdating
					? "Programme mis à jour avec succès"
					: "Programme créé avec succès",
			});

			// Reset form after a delay
			setTimeout(() => {
				setFormData({
					universityId: null,
					branchId: null,
					levelId: null,
					selectedUes: [],
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
				message: "Erreur lors de l'enregistrement du programme",
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
							year: currentYear.toString(), // Default to current year
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
			title={isUpdating ? "Modifier un programme" : "Ajouter un programme"}
			size="xl"
			padding="lg"
			radius="md"
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
						Informations du programme
					</Title>
					<Group grow>
						<Select
							label="Université"
							placeholder="Sélectionner une université"
							data={universities.map((u) => ({
								value: u.id.toString(),
								label: u.name,
							}))}
							value={formData.universityId?.toString()}
							onChange={(value) => {
								handleFilter({
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
							nothingFoundMessage="Aucune université trouvée"
							disabled={isLoading}
							size="md"
						/>

						<Select
							label="Filière"
							placeholder="Sélectionner une filière"
							data={availableBranches.map((d) => ({
								value: d.id.toString(),
								label: d.name,
							}))}
							value={formData.branchId?.toString()}
							onChange={(value) => {
								handleFilter({
									...filters,
									branchId: value ? value : null,
								});
								setFormData((prev) => ({
									...prev,
									branchId: value ? value : null,
									levelId: null,
								}));
							}}
							disabled={!formData.universityId || isLoading}
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
								handleFilter({
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
				</Paper>

				{programExists && (
					<Alert
						color="yellow"
						icon={<IconInfoCircle size={16} />}
						variant="light"
					>
						Ce programme existe déjà. Les modifications seront appliquées au
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
						<Title order={6}>Sélection des UEs</Title>
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
										<Select
											label={
												<Group gap="xs">
													<Text fw={500}>{course?.name}</Text>
													{isExisting && (
														<Badge size="xs" color="blue" variant="light">
															Existant
														</Badge>
													)}
												</Group>
											}
											value={
												formData.courseDetails[ueId]?.year ||
												currentYear.toString()
											}
											onChange={(value) =>
												setFormData((prev) => ({
													...prev,
													courseDetails: {
														...prev.courseDetails,
														[ueId]: {
															...prev.courseDetails[ueId],
															year: value || currentYear.toString(),
														},
													},
												}))
											}
											data={availableYears.map((year) => ({
												value: year,
												label: year,
											}))}
											leftSection={<IconCalendar size={16} />}
											searchable
											disabled={isLoading}
											required
											size="md"
										/>
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
