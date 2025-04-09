"use client";

import {
	Group,
	Select,
	Button,
	Title,
	Text,
	Paper,
	Stack,
} from "@mantine/core";
import { IconPlus, IconFilter, IconCalendar } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ShowUniversitWihClassrooms, ShowIpesWithClassrooms } from "@/types";
import { Level, Branch } from "@/components/Syllabus/Syllabus";

interface FilterSectionProps {
	filters: {
		universityId: string | null;
		branchId: string | null;
		levelId: string | null;
		year: string | null;
	};
	onFilter: (filters: any) => void;
	onAddClick: () => void;
	universities: ShowUniversitWihClassrooms[] | ShowIpesWithClassrooms[];
	availableBranches: Branch[];
	setAvailableBranches: (availableBranches: Branch[]) => void;
	availableLevels: Level[];
	setAvailableLevels: (availableLevels: Level[]) => void;
	availableYears: string[];
	setAvailableYears: (availableYears: string[]) => void;
	isCentralInstitution: boolean;
	currentInstitute: string;
	instituteName: string;
	instituteType?: "IPES" | "University";
}

export function FilterSection({
	filters,
	onFilter,
	onAddClick,
	universities,
	availableBranches,
	availableLevels,
	setAvailableLevels,
	setAvailableBranches,
	availableYears,
	setAvailableYears,
	isCentralInstitution,
	currentInstitute,
	instituteName,
	instituteType = "University",  // Default to University for backward compatibility
}: FilterSectionProps) {
	const [isLoading, setIsLoading] = useState(false);
	//log all the parameters
	console.log("filters", filters);
	console.log("universities", universities);
	console.log("availableBranches", availableBranches);
	console.log("availableLevels", availableLevels);
	console.log("availableYears", availableYears);
	console.log("isCentralInstitution", isCentralInstitution);	

	// Get the appropriate institution label based on type
	const getInstitutionLabel = () => {
		return instituteType === "University" ? "Université" : "IPES";
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				if (filters.universityId) {
					const branches: Branch[] = [];
					const university = universities.find(
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

					setAvailableBranches(branches);
				}

				// For non-central institutions, load branches for the current institution
				if (!isCentralInstitution && currentInstitute) {
					
					const branches: Branch[] = [];
					const university = universities.find(
						(university: any) =>
							university.institute == currentInstitute,
					);
					if (university) {
						const salles = university.salles;
						salles.forEach((salle) => {
							const filiere = salle.branch;
							const exists = branches.some((branch) => branch.id === filiere.id);
							if (!exists) {
								branches.push({
									id: filiere.id,
									name: filiere.name,
								});
							}
						});
					}
					setAvailableBranches(branches);
				}

				if (filters.branchId && filters.universityId) {
					const levels: Level[] = [];
					const university = universities.find(
						(university: any) =>
							university.id == filters.universityId,
					);
					
					console.log("Voici la university dans laquelle on va extraire les niveaux : ", university)
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
					console.log("Voici les niveaux que j'ai récupéré : ", levels)

					setAvailableLevels(levels);
				}
			} catch (error) {
				console.error("Erreur lors de la récupération des données:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [
		filters.universityId,
		filters.branchId,
		universities,
		setAvailableBranches,
		setAvailableLevels,
		isCentralInstitution,
		currentInstitute,
	]);

	// Display the institution name for non-central institutions
	const institutionDisplay = !isCentralInstitution ? (
		<Paper p="sm" withBorder>
			<Group>
				<Text size="sm" fw={500}>{instituteType === "University" ? "Institution :" : "IPES :"}</Text>
				<Text>{instituteName}</Text>
			</Group>
		</Paper>
	) : null;

	return (
		<>
			<Title order={4} mb="md">
				Filtrer les programmes {instituteType === "IPES" ? "IPES" : ""}
			</Title>

			<Paper p="md" withBorder>
				<Stack gap="md">
					{institutionDisplay}

					<Group grow align="flex-start">
						{isCentralInstitution && (
							<Select
								label={getInstitutionLabel()}
								placeholder={`Choisir ${instituteType === "University" ? "une université" : "un IPES"}`}
								data={universities.map((u: any) => ({
									value: u.id.toString(),
									label: u.name,
								}))}
								value={filters.universityId?.toString() || null}
								onChange={(value) =>
									onFilter({
										...filters,
										universityId: value ? String(value) : null,
										branchId: null,
										levelId: null,
									})
								}
								clearable
								searchable
								nothingFoundMessage={`Aucun${instituteType === "IPES" ? "" : "e"} ${instituteType === "University" ? "université" : "IPES"} trouvé${instituteType === "IPES" ? "" : "e"}`}
								disabled={isLoading}
								size="md"
							/>
						)}

						<Select
							label="Filière"
							placeholder="Choisir une filière"
							data={availableBranches.map((d) => ({
								value: d.id.toString(),
								label: d.name,
							}))}
							value={filters.branchId?.toString() || null}
							onChange={(value) =>
							{
								if(isCentralInstitution == false){
									onFilter({
										...filters,
										universityId: String(universities.find(
											(university: any) =>
												university.institute == currentInstitute,
										)?.id) || null,
										branchId: value ? value : null,
										levelId: null,
									})
								} else {
									onFilter({
										...filters,
										branchId: value ? value : null,
										levelId: null,
									})
								}
							}
							}
							disabled={(isCentralInstitution && !filters.universityId) || isLoading}
							clearable
							searchable
							nothingFoundMessage="Aucune filière disponible"
							size="md"
						/>

						<Select
							label="Niveau"
							placeholder="Choisir un niveau"
							data={availableLevels.map((l) => ({
								value: l.id.toString(),
								label: l.name,
							}))}
							value={filters.levelId?.toString() || null}
							onChange={(value) =>
								onFilter({
									...filters,
									levelId: value ? value : null,
								})
							}
							disabled={!filters.branchId || isLoading}
							clearable
							searchable
							nothingFoundMessage="Aucun niveau disponible"
							size="md"
						/>

						<Select
							label="Année académique"
							placeholder="Choisir une année"
							data={availableYears.map((year) => ({
								value: year,
								label: year,
							}))}
							value={filters.year || null}
							onChange={(value) =>
								onFilter({
									...filters,
									year: value,
								})
							}
							clearable
							searchable
							leftSection={<IconCalendar size={16} />}
							nothingFoundMessage="Aucune année disponible"
							size="md"
						/>
					</Group>

					<Group justify="space-between" align="center">
						<Group>
							{(filters.universityId ||
								filters.branchId ||
								filters.levelId ||
								filters.year) && (
								<Text size="sm" c="dimmed">
									Filtres actifs:{" "}
									{filters.universityId && isCentralInstitution && (
										<>
											{
												(universities as any[]).find(
													(u) => u.id.toString() === filters.universityId,
												)?.name
											}
										</>
									)}
									{filters.branchId && (
										<>
											{!isCentralInstitution || filters.universityId ? " > " : ""}
											{
												availableBranches.find(
													(b) => b.id.toString() === filters.branchId,
												)?.name
											}
										</>
									)}
									{filters.levelId && (
										<>
											{" > "}
											{
												availableLevels.find(
													(l) => l.id.toString() === filters.levelId,
												)?.name
											}
										</>
									)}
									{filters.year && ` (${filters.year})`}
								</Text>
							)}
						</Group>

						<Group>
							<Button
								leftSection={<IconFilter size={14} />}
								variant="light"
								onClick={() =>
									onFilter({
										universityId: isCentralInstitution ? null : currentInstitute,
										branchId: null,
										levelId: null,
										year: null,
									})
								}
								disabled={
									(!isCentralInstitution || !filters.universityId) &&
									!filters.branchId &&
									!filters.levelId &&
									!filters.year
								}
							>
								Réinitialiser les filtres
							</Button>
							<Button
								leftSection={<IconPlus size={14} />}
								onClick={onAddClick}
								variant="filled"
							>
								Ajouter un programme{instituteType === "IPES" ? " IPES" : ""}
							</Button>
						</Group>
					</Group>
				</Stack>
			</Paper>
		</>
	);
}
