"use client";

import { useEffect, useState } from "react";
import {
	Container,
	Title,
	Stack,
	Paper,
	Text,
	Alert,
	Loader,
	Group,
} from "@mantine/core";
import { FilterSection } from "@/components/Syllabus/FilterSection";
import { ProgramTable } from "@/components/Syllabus/ProgramTable";
import { AddSyllabusModal } from "@/components/Syllabus/AddSyllabusModal";
// import {
// 	programs,
// 	universities,
// 	departments,
// 	levels,
// 	courses,
// } from "@/components/Syllabus/universities";
import { ShowUniversitWihClassrooms } from "@/types";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";

export interface Program {
	id: string;
	institute: string;
	universityId: string;
	branchId: string;
	branchName: string;
	levelId: string;
	levelName: string;
	classroomId: string;
	courses: {
		courseId: string;
		name: string;
		description: string;
		nbr_hrs: string;
		year: string;
		credit: string;
	}[];
}

export interface Course {
	courseId: string;
	name: string;
	description: string;
	nbr_hrs: string;
	year: string;
	credit: string;
}

export interface Branch {
	id: string;
	name: string;
}

export interface Level {
	id: string;
	name: string;
}

// Extend the UE type to include pivot data
interface UE {
	id: string;
	name: string;
	slug: string;
	description: string;
	pivot?: {
		year?: string;
		nbr_hrs?: string;
		credit?: string;
	};
}

export default function ProgramsPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [universities, setUniversities] = useState<
		ShowUniversitWihClassrooms[]
	>([]);
	const [availableBranches, setAvalaibleBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvalaibleLevels] = useState<Level[]>([]);
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		universityId: null as string | null,
		branchId: null as string | null,
		levelId: null as string | null,
		year: null as string | null,
	});

	// Add a helper function to check if a program has courses for a specific year
	const programHasCoursesForYear = (
		program: Program,
		year: string | null,
	): boolean => {
		if (!year) return true;
		return program.courses.some((course) => course.year === year);
	};

	// Function to fetch data from the API
	const fetchData = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const u = await fetch("http://localhost:3000/api/universities").then(
				(res) => res.json(),
			);

			console.log("Fetched universities data:", u.data);

			if (!u.data) {
				throw new Error("Failed to fetch universities data");
			}

			const universities: ShowUniversitWihClassrooms[] = u.data;
			setUniversities(universities);

			// Extract years and programs
			const yearsSet = new Set<string>();
			const programs: Program[] = [];

			console.log("Processing universities:", universities.length);

			universities.forEach((university) => {
				university.salles.forEach((salle) => {
					// Group UEs by year
					const coursesByYear: Record<string, Course[]> = {};

					salle.ues.forEach((ue: UE) => {
						// For each UE, determine its year (default to current year if not specified)
						const year = ue.pivot?.year || new Date().getFullYear().toString();

						// Add year to the set of available years
						yearsSet.add(year);

						// Create course object
						const course: Course = {
							courseId: ue.id,
							name: ue.name,
							description: ue.description,
							nbr_hrs: ue.pivot?.nbr_hrs || "30",
							year: year,
							credit: ue.pivot?.credit || "3",
						};

						// Add course to the appropriate year group
						if (!coursesByYear[year]) {
							coursesByYear[year] = [];
						}
						coursesByYear[year].push(course);
					});

					// Create a program for each classroom, including all courses
					const allCourses = Object.values(coursesByYear).flat();
					if (allCourses.length > 0) {
						programs.push({
							id: salle.id,
							universityId: university.id,
							branchId: salle.branch.id,
							branchName: salle.branch.name,
							levelId: salle.level.id,
							levelName: salle.level.name,
							classroomId: salle.id,
							institute: university.institute_id,
							courses: allCourses,
						});
					}
				});
			});

			// Convert Set to Array and sort years in descending order
			const sortedYears = Array.from(yearsSet).sort(
				(a, b) => parseInt(b) - parseInt(a),
			);
			setAvailableYears(sortedYears);

			console.log("Available years:", sortedYears);
			console.log("Generated programs:", programs);

			// Sort programs by university, branch, level
			const sortedPrograms = programs.sort((a, b) => {
				// First sort by university
				if (a.universityId !== b.universityId) {
					return a.universityId.localeCompare(b.universityId);
				}

				// Then by branch
				if (a.branchId !== b.branchId) {
					return a.branchName.localeCompare(b.branchName);
				}

				// Then by level
				if (a.levelId !== b.levelId) {
					return a.levelName.localeCompare(b.levelName);
				}

				return 0;
			});

			setPrograms(sortedPrograms);

			// Apply current filters if they exist
			if (
				filters.universityId ||
				filters.branchId ||
				filters.levelId ||
				filters.year
			) {
				handleFilter(filters);
			} else {
				setFilteredPrograms(sortedPrograms);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			setError(
				"Une erreur est survenue lors du chargement des données. Veuillez réessayer.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Initial data fetch
	useEffect(() => {
		fetchData();
	}, []);

	const handleFilter = (newFilters: typeof filters) => {
		console.log("Applying filters:", newFilters);
		setFilters(newFilters);
		let filtered = [...programs];

		if (newFilters.universityId) {
			filtered = filtered.filter(
				(p) => p.universityId == newFilters.universityId,
			);
			console.log("After university filter:", filtered.length, "programs");
		}
		if (newFilters.branchId) {
			filtered = filtered.filter((p) => p.branchId == newFilters.branchId);
		}
		if (newFilters.levelId) {
			filtered = filtered.filter((p) => p.levelId == newFilters.levelId);
		}
		if (newFilters.year) {
			filtered = filtered.filter((p) =>
				programHasCoursesForYear(p, newFilters.year),
			);

			// If filtering by year, sort courses to prioritize the selected year
			filtered = filtered.map((program) => {
				// Create a copy of the program
				const programCopy = { ...program };

				// Sort courses to prioritize the selected year
				programCopy.courses = [...program.courses].sort((a, b) => {
					if (a.year === newFilters.year && b.year !== newFilters.year)
						return -1;
					if (a.year !== newFilters.year && b.year === newFilters.year)
						return 1;
					return parseInt(b.year) - parseInt(a.year); // Otherwise sort by year descending
				});

				return programCopy;
			});
		}

		console.log(
			`Filtered programs: ${filtered.length} programs match the criteria`,
		);
		if (newFilters.year) {
			console.log(
				`Year filter: ${newFilters.year}, Programs with this year: ${filtered.length}`,
			);
		}

		setFilteredPrograms(filtered);
	};

	const handleAddProgram = async (newProgram: Program) => {
		// First, refresh the data to get the latest state from the server
		await fetchData();

		// Close the modal
		setIsModalOpen(false);

		// Apply current filters to updated programs
		handleFilter(filters);
	};

	return (
		<>
			{/*<Container size="xl" py="md">*/}
			<Stack gap="md">
				<Paper p="md" shadow="md" withBorder>
					<FilterSection
						filters={filters}
						onFilter={handleFilter}
						onAddClick={() => setIsModalOpen(true)}
						universities={universities}
						availableBranches={availableBranches}
						setAvailableBranches={setAvalaibleBranches}
						availableLevels={availableLevels}
						setAvailableLevels={setAvalaibleLevels}
						availableYears={availableYears}
						setAvailableYears={setAvailableYears as any}
					/>
				</Paper>

				{isLoading && (
					<Group justify="center" py="xl">
						<Loader size="md" />
						<Text>Chargement des programmes...</Text>
					</Group>
				)}

				{error && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title="Erreur"
						color="red"
					>
						{error}
					</Alert>
				)}

				{!isLoading && !error && filteredPrograms.length === 0 && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title="Information"
						color="blue"
					>
						Aucun programme ne correspond aux critères de filtrage. Veuillez
						modifier vos filtres ou ajouter un nouveau programme.
					</Alert>
				)}

				{filteredPrograms.map((program) => (
					<ProgramTable
						key={program.id}
						university={String(
							universities.find((u) => u.id === program.universityId)?.name,
						)}
						year={
							program.courses[0]?.year || new Date().getFullYear().toString()
						}
						program={program}
						filteredPrograms={filteredPrograms}
						setFilteredPrograms={setFilteredPrograms}
						onUpdate={async (updatedProgram) => {
							// Refresh data after updating a program
							await fetchData();
							handleFilter(filters);
						}}
						onDelete={async (programId) => {
							// Refresh data after deleting a program
							await fetchData();
							handleFilter(filters);
						}}
					/>
				))}
			</Stack>

			<AddSyllabusModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmitted={handleAddProgram}
				universities={universities}
				existingPrograms={programs}
			/>
			{/*</Container>*/}
		</>
	);
}
