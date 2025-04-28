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
	Button,
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
import { Institution, ShowUniversitWihClassrooms, ShowIpesWithClassrooms } from "@/types";
import { IconAlertCircle, IconInfoCircle, IconRefresh, IconCheck } from "@tabler/icons-react";
import { innerUrl } from "@/app/lib/utils";

export interface Program {
	id: string;
	institute: string;
	instituteId: string;
	instituteName: string;
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
	guardianUniversity?: string; // University of guardianship for IPES
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

type ProgramPageProps = {
	instituteId: string;
	instituteName: string;
	classroomId?: string;
	instituteType: "IPES" | "University";
	userType: "Cenadi" | "Minesup" | "IPES" | "University"
};
/**
 * Validates the properties passed to the ProgramPage component.
 * Ensures that if a classroomId is provided, a universityId must also be provided.
 *
 * @param {ProgramPageProps} props - The properties to validate.
 * @throws {Error} If classroomId is provided without a universityId.
 */

export default function ProgramsPage({
	instituteId,	
	instituteName,
	classroomId,
	instituteType,
	userType
}: ProgramPageProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [universities, setUniversities] = useState<ShowUniversitWihClassrooms[]>([]);
	const [ipes, setIpes] = useState<ShowIpesWithClassrooms[]>([]);
	const [availableBranches, setAvalaibleBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvalaibleLevels] = useState<Level[]>([]);
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<{
		type: "info" | "success" | "error";
		message: string;
	} | null>(null);
	
	// Determine if this is a central institution based on the new conditions
	const determineIsCentralInstitution = (): boolean => {
		// Base condition: CENADI or MINESUP are always central institutions
		const isCenadiOrMinesup = instituteName.toLowerCase().includes('cenadi') || 
								 instituteName.toLowerCase().includes('minesup');
		
		if (isCenadiOrMinesup) return true;
		
		// New conditions based on userType and instituteType
		if (userType === "IPES" && instituteType === "University") return true;
		if (userType === "IPES" && instituteType === "IPES") return false;
		if (userType === "University" && instituteType === "IPES") return true;
		if (userType === "University" && instituteType === "University") return false;
		
		// Default to false for any other cases
		return false;
	};
	
	const isCentralInstitution = determineIsCentralInstitution();
	
	const [filters, setFilters] = useState({
		// instituteId: isCentralInstitution ? null : null,
		instituteId: null as string | null,
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

	// Function to fetch data from the API based on instituteType
	const fetchData = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Fetch the appropriate data based on instituteType
			if (instituteType === "University") {
				const u = await fetch(innerUrl("/api/universities")).then(
					(res) => res.json(),
				);
				console.log("Voici les universités : ", u.data);

				console.log("Fetched universities data:", u.data);

				if (!u.data) {
					throw new Error("Failed to fetch universities data");
				}

				const universities: ShowUniversitWihClassrooms[] = u.data;
				setUniversities(universities);

				processUniversitiesData(universities);
			} else if (instituteType === "IPES") {
				const ipesResponse = await fetch(innerUrl("/api/ipess")).then(
					(res) => res.json(),
				);

				console.log("Fetched IPES data:", ipesResponse.data);

				if (!ipesResponse.data) {
					throw new Error("Failed to fetch IPES data");
				}

				const ipesData: ShowIpesWithClassrooms[] = ipesResponse.data;
				setIpes(ipesData);

				processIPESData(ipesData);
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

	// Helper function to process universities data
	const processUniversitiesData = (universities: ShowUniversitWihClassrooms[]) => {
		// Extract years and programs
		const yearsSet = new Set<string>();
		const programs: Program[] = [];

		console.log("Processing universities:", universities.length);

		universities.forEach((university) => {
			// For non-central institutions, only process the current instituteId
			if (!isCentralInstitution && university.institute != instituteId) {
				return;
			}
			
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
						nbr_hrs: ue.pivot?.nbr_hrs || "Non renseigné",
						year: year,
						credit: ue.pivot?.credit || "Non renseigné",
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
						instituteId: university.id,
						instituteName: university.name,
						branchId: salle.branch.id,
						branchName: salle.branch.name,
						levelId: salle.level.id,
						levelName: salle.level.name,
						classroomId: salle.id,
						institute: university.institute,
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
		
		// Sort programs by university, branch, level
		const normalizedPrograms = programs.map(p => ({
			...p,
			instituteId: String(p.instituteId),
		}));
		const sortedPrograms = normalizedPrograms.sort((a, b) => {
			// First sort by university
			if (a.instituteId !== b.instituteId) {
				return a.instituteId.localeCompare(b.instituteId);
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

		sortedPrograms.forEach(p => {
			if (typeof p.instituteId !== 'string') {
				console.warn('Non-string instituteId:', p.instituteId, typeof p.instituteId, p);
			}
		});

		setPrograms(sortedPrograms);

		// Apply current filters if they exist
		if (
			filters.instituteId ||
			filters.branchId ||
			filters.levelId ||
			filters.year
		) {
			handleFilter(filters);
		} else {
			setFilteredPrograms(sortedPrograms);
		}
	};

	// Helper function to process IPES data
	const processIPESData = (ipesData: ShowIpesWithClassrooms[]) => {
		// Extract years and programs
		const yearsSet = new Set<string>();
		const programs: Program[] = [];

		console.log("Processing IPES:", ipesData.length);

		ipesData.forEach((ipes) => {
			// For non-central institutions, only process the current instituteId
			if (!isCentralInstitution && ipes.institute != instituteId) {
				return;
			}
			
			ipes.salles.forEach((salle) => {
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
						nbr_hrs: ue.pivot?.nbr_hrs || "Non renseigné",
						year: year,
						credit: ue.pivot?.credit || "Non renseigné",
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
						instituteId: ipes.id,
						instituteName: ipes.name,
						branchId: salle.branch.id,
						branchName: salle.branch.name,
						levelId: salle.level.id,
						levelName: salle.level.name,
						classroomId: salle.id,
						institute: ipes.institute,
						courses: allCourses,
						guardianUniversity: ipes.university?.name, // Add the university of guardianship
					});
				}
			});
		});

		// Convert Set to Array and sort years in descending order
		const sortedYears = Array.from(yearsSet).sort(
			(a, b) => parseInt(b) - parseInt(a),
		);
		setAvailableYears(sortedYears);
		
		// Sort programs by ipes, branch, level
		const normalizedPrograms = programs.map(p => ({
			...p,
			instituteId: String(p.instituteId),
		}));
		const sortedPrograms = normalizedPrograms.sort((a, b) => {
			// First sort by ipes
			if (a.instituteId !== b.instituteId) {
				return a.instituteId.localeCompare(b.instituteId);
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

		sortedPrograms.forEach(p => {
			if (typeof p.instituteId !== 'string') {
				console.warn('Non-string instituteId:', p.instituteId, typeof p.instituteId, p);
			}
		});

		setPrograms(sortedPrograms);

		// Apply current filters if they exist
		if (
			filters.instituteId ||
			filters.branchId ||
			filters.levelId ||
			filters.year
		) {
			handleFilter(filters);
		} else {
			setFilteredPrograms(sortedPrograms);
		}
	};

	// Initial data fetch
	useEffect(() => {
		fetchData();
	}, [instituteType]);

	// Update filters when data is loaded
	useEffect(() => {
		if (programs.length > 0) {
			// For non-central institutions, set the default universityId
			if (!isCentralInstitution) {
				const defaultUniversityId = programs.find(p => p.institute === instituteId)?.instituteId;
				if (defaultUniversityId) {
					handleFilter({
						...filters,
						instituteId: defaultUniversityId,
						branchId: null,
						levelId: null,
					});
				}
			}
		}
	}, [programs, isCentralInstitution, instituteId]);

	const handleFilter = (newFilters: typeof filters) => {
		console.log("Applying filters:", newFilters);
		setFilters(newFilters);
		let filtered = [...programs];

		// For non-central institutions, always filter by the institution's ID
		if (!isCentralInstitution) {
			filtered = filtered.filter(p => p.institute == instituteId);
		} else if (newFilters.instituteId) {
			filtered = filtered.filter(
				(p) => p.instituteId == newFilters.instituteId,
			);
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

	const handleRefresh = async () => {
		setIsLoading(true);
		setError(null);
		setStatusMessage(null);
		try {
			await fetchData();
			setStatusMessage({
				type: "success",
				message: "Les programmes ont été rechargés avec succès",
			});
			// Clear success message after 3 seconds
			setTimeout(() => {
				setStatusMessage(null);
			}, 3000);
		} catch (error) {
			console.error("Error refreshing data:", error);
			setError("Une erreur est survenue lors du rechargement des données.");
		} finally {
			setIsLoading(false);
		}
	};

	// Get the institutions list based on instituteType
	const getInstitutions = () => {
		return instituteType === "University" ? universities : ipes;
	};

	return (
		<>
			{/*<Container size="xl" py="md">*/}
			<Stack gap="md">
				<Paper p="md" shadow="md" withBorder>
					<Group mb="md">
						<Button
							variant="light"
							leftSection={<IconRefresh size={16} />}
							onClick={handleRefresh}
							loading={isLoading}
							disabled={isLoading}
						>
							Actualiser les programmes
						</Button>
					</Group>
					<FilterSection
						filters={filters}
						onFilter={handleFilter}
						onAddClick={() => setIsModalOpen(true)}
						universities={getInstitutions()}
						availableBranches={availableBranches}
						setAvailableBranches={setAvalaibleBranches}
						availableLevels={availableLevels}
						setAvailableLevels={setAvalaibleLevels}
						availableYears={availableYears}
						setAvailableYears={setAvailableYears as any}
						isCentralInstitution={isCentralInstitution}
						currentInstitute={instituteId}
						instituteName={instituteName}
						instituteType={instituteType}
					/>
				</Paper>

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

				{filteredPrograms.map((program) => {
					
					return (
						<ProgramTable
							key={program.id}
							institutionName={program.instituteName || program.branchName + " - " + program.levelName}
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
							instituteType={instituteType}
						/>
					);
				})}
			</Stack>

			<AddSyllabusModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmitted={handleAddProgram}
				universities={getInstitutions()}
				existingPrograms={programs}
				isCentralInstitution={isCentralInstitution}
				currentInstitute={instituteId}
				instituteName={instituteName}
				instituteType={instituteType}
			/>
			{/*</Container>*/}
		</>
	);
}
