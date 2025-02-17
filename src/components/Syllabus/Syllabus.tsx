"use client";

import { useEffect, useState } from "react";
import { Container, Title, Stack, Paper } from "@mantine/core";
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
import { ShowUniversitWihClassrooms, ShowUniversity } from "@/types";

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

export default function ProgramsPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [universities, setUniversities] = useState<
		ShowUniversitWihClassrooms[]
	>([]);
	const [availableBranches, setAvalaibleBranches] = useState<Branch[]>([]);
	const [availableLevels, setAvalaibleLevels] = useState<Level[]>([]);
	const [availableYears, setAvailableYears] = useState<String[]>([]);
	const [filters, setFilters] = useState({
		universityId: null as string | null,
		branchId: null as string | null,
		levelId: null as string | null,
		year: null as string | null,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const u = await fetch("http://localhost:3000/api/universities").then(
					(res) => res.json(),
				);
				const universities: ShowUniversitWihClassrooms[] = u.data;
				console.log("Voici les données : ", universities);
				setUniversities(universities);
				const years: string[] = [];
				const programs: Program[] = [];
				universities.forEach((university) => {
					university.salles.forEach((salle) => {
						const courses: Course[] = salle.ues.map((ue, index) => ({
							courseId: ue.id,
							name: ue.name,
							description: ue.description,
							nbr_hrs: "30",
							year: "2024",
							credit: "3",
						}));
						for (const course of courses) {
							if (!years.includes(String(course.year))) {
								years.push(String(course.year));
							}
						}
						if (courses.length > 0) {
							programs.push({
								id: salle.id,
								universityId: university.id,
								branchId: salle.filiere.id,
								branchName: salle.filiere.name,
								levelId: salle.niveau.id,
								levelName: salle.niveau.name,
								classroomId: salle.id,
								institute: university.institute_id,
								courses: courses,
							});
						}
					});
				});
				setAvailableYears(years);
				setFilteredPrograms(programs);
				setPrograms(programs);
			} catch (error) {
				console.log("Error fetching universities : ", error);
			}
		};
		fetchData();
	}, []);

	const handleFilter = (newFilters: typeof filters) => {
		setFilters(newFilters);
		let filtered = [...programs];

		if (newFilters.universityId) {
			filtered = filtered.filter(
				(p) => p.universityId == newFilters.universityId,
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
				p.courses.some((c) => c.year == newFilters.year),
			);
		}

		console.log("Voici les programmes filitrés : ", filtered);
		setFilteredPrograms(filtered);
	};

	const handleAddProgram = (newProgram: Program) => {
		const updatedPrograms = [
			...programs,
			{ ...newProgram, id: String(programs.length + 1) },
		];
		setFilteredPrograms(updatedPrograms);
		setIsModalOpen(false);
	};

	return (
		<>
			{/*<Container size="xl" py="md">*/}
			<Stack>
				<Paper p={"md"} shadow={"md"}>
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
						setAvailableYears={setAvailableYears}
					/>
				</Paper>

				{filteredPrograms.map((program) => (
					<ProgramTable
						key={program.id}
						program={program}
						filteredPrograms={filteredPrograms}
						setFilteredPrograms={setFilteredPrograms}
						onUpdate={(updatedProgram) => {
							const updated = filteredPrograms.map((p) =>
								p.id == updatedProgram.id ? updatedProgram : p,
							);
							setFilteredPrograms(updated);
						}}
						onDelete={(programId) => {
							setFilteredPrograms(
								filteredPrograms.filter((p) => p.id !== programId),
							);
						}}
					/>
				))}
			</Stack>

			<AddSyllabusModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmitted={handleAddProgram}
				universities={universities}
			/>
			{/*</Container>*/}
		</>
	);
}
