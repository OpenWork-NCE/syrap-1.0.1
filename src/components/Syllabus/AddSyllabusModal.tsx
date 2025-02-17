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
} from "@mantine/core";
import { Branch, Level } from "@/components/Syllabus/Syllabus";
import { ShowUniversitWihClassrooms } from "@/types";

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
}

export function AddSyllabusModal({
	opened,
	onClose,
	onSubmitted,
	universities,
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

	const handleFilter = (newFilters: typeof filters) => {
		setFilters(newFilters);
	};

	useEffect(() => {
		async function getUes() {
			try {
				const u = await fetch("http://localhost:3000/api/ues").then((res) =>
					res.json(),
				);
				const fetchedUes: Ue[] = u.data;
				console.log("Voici les Ues : ", fetchedUes);
				setUes(fetchedUes);
			} catch (e) {
				console.log("Error to get Ues", e);
			}
		}
		getUes();
	}, []);

	useEffect(() => {
		const fetchDatas = async () => {
			try {
				if (filters.universityId) {
					const branches: Branch[] = [];
					const university = universities.find(
						(university: ShowUniversitWihClassrooms) =>
							university.id == filters.universityId,
					);
					university?.salles.forEach((salle) => {
						const filiere = salle.filiere;
						const exists = branches.some((branch) => branch.id === filiere.id);
						if (!exists) {
							branches.push({
								id: filiere.id,
								name: filiere.name,
							});
						}
					});
					console.log(
						"Voici les university",
						university,
						" l'identifiant de l'université",
						filters.universityId,
					);
					setAvailableBranches(branches);
				}
				if (filters.branchId) {
					const levels: Level[] = [];
					const university = universities.find(
						(university: ShowUniversitWihClassrooms) =>
							university.id == filters.universityId,
					);

					university?.salles.forEach((salle) => {
						const filiere = salle.filiere;
						const niveau = salle.niveau;
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
				console.log("Erreur lors de la recuperation des filieres ", error);
			}
		};
		const fetchExistCourses = async () => {
			const classrooms = universities.find(
				(university: ShowUniversitWihClassrooms) =>
					university.id == filters.universityId,
			)?.salles;
			const classroomId = classrooms?.find(
				(s) =>
					s.niveau.id == filters.levelId && s.filiere.id == filters.branchId,
			)?.id;
			console.log("Voici l'identifiant de la salle : ", classroomId);
			if (classroomId) {
				const request = await fetch(
					`http://localhost:3000/api/syllabus/${classroomId}/classroom`,
				).then((res) => res.json());
				console.log("Voici les données recus : ", request);
				const courses: FetchedCourse[] = request.data;
				console.log("Courses ", courses);
				courses?.map((course) => {
					setFormData((prev) => ({
						universityId: filters.universityId,
						levelId: filters.levelId,
						branchId: filters.branchId,
						selectedUes: [...formData.selectedUes, course.id],
						courseDetails: {
							...prev.courseDetails,
							[course.id]: {
								nbr_hrs: course.pivot.nbr_hrs,
								year: course.pivot.year,
								credit: course.pivot.credit,
							},
						},
					}));
				});
			}
		};
		fetchDatas();
		if (filters.levelId) {
			fetchExistCourses();
		}
		console.log("Voici les universities: ", availableBranches);
		console.log("Voici les filieres: ", availableBranches);
		console.log("Voici les niveau: ", availableLevels);
	}, [filters]);

	const handleSubmit = async () => {
		const programCourses = formData.selectedUes.map((ueId) => {
			const ue = ues.find((c) => c.id == ueId);
			const details = formData.courseDetails[ueId];
			return {
				courseId: Number.parseInt(ueId),
				name: ue?.name,
				description: ue?.description,
				...details,
			};
		});

		const classrooms = universities.find(
			(university: ShowUniversitWihClassrooms) =>
				university.id == formData.universityId,
		)?.salles;
		const classroom = classrooms?.find(
			(s) =>
				s.niveau.id == formData.levelId && s.filiere.id == formData.branchId,
		);
		const classroomId = classroom?.id;
		try {
			const datas = programCourses.map((programCourse) => ({
				ue: String(programCourse.courseId),
				credit: programCourse.credit,
				nbr_hrs: programCourse.nbr_hrs,
				year: programCourse.year,
			}));
			console.log("Voici les données a passer : ", datas);
			const requests = datas.map((data) =>
				fetch(`http://localhost:3000/api/syllabus/${classroomId}/addue`, {
					method: "POST",
					body: JSON.stringify(data),
				}),
			);
			console.log("Voici donc les requettes la : ", requests);
			const addue = await Promise.all(requests);
			console.log("Voici le resultat donc :", addue);
		} catch (e) {
			console.log("Error on adding Ue to program : ", e);
		}

		onSubmitted({
			universityId: formData.universityId,
			branchId: formData.branchId,
			levelId: formData.levelId,
			branchName: classroom?.filiere.name,
			levelName: classroom?.niveau.name,
			classroomId: classroom?.id,
			courses: programCourses,
		});

		setFormData({
			universityId: null,
			branchId: null,
			levelId: null,
			selectedUes: [],
			courseDetails: {},
		});
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title="Ajouter un programme"
			size="lg"
		>
			<Stack>
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
					disabled={!formData.universityId}
					required
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
					disabled={!formData.branchId}
					required
				/>

				<MultiSelect
					label="UEs"
					placeholder="Sélectionner les UEs"
					data={ues.map((c) => ({
						value: c.id.toString(),
						label: c.name.toString(),
					}))}
					value={formData.selectedUes}
					onChange={(value) => {
						console.log("Voici la valeur :, ", value);
						setFormData((prev) => ({
							...prev,
							selectedUes: value,
							courseDetails: value.reduce(
								(acc, courseId) => ({
									...acc,
									[courseId]: prev.courseDetails[courseId] || {
										nbr_hrs: "0",
										year: "2025",
										credit: "0",
									},
								}),
								{},
							),
						}));
					}}
					required
				/>

				{formData.selectedUes.map((ueId) => {
					const course = ues.find((c) => c.id.toString() === ueId);
					return (
						<Group key={ueId} grow>
							<TextInput
								label={`${course?.name} - Année`}
								value={
									formData.courseDetails[ueId]?.year ||
									String(new Date().getFullYear())
								}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										courseDetails: {
											...prev.courseDetails,
											[ueId]: {
												...prev.courseDetails[ueId],
												year: e.target.value,
											},
										},
									}))
								}
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
							/>
						</Group>
					);
				})}

				<Group justify="flex-end">
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
							onClose();
						}}
					>
						Annuler
					</Button>
					<Button onClick={handleSubmit}>Ajouter</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
