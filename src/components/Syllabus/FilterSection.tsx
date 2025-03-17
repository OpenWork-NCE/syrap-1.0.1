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
import { ShowUniversitWihClassrooms } from "@/types";
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
	universities: ShowUniversitWihClassrooms[];
	availableBranches: Branch[];
	setAvailableBranches: (availableBranches: Branch[]) => void;
	availableLevels: Level[];
	setAvailableLevels: (availableLevels: Level[]) => void;
	availableYears: string[];
	setAvailableYears: (availableYears: string[]) => void;
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
}: FilterSectionProps) {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				if (filters.universityId) {
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

				if (filters.branchId && filters.universityId) {
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
	]);

	return (
		<>
			<Title order={4} mb="md">
				Filtrer les programmes
			</Title>

			<Paper p="md" withBorder>
				<Stack gap="md">
					<Group grow align="flex-start">
						<Select
							label="Université"
							placeholder="Choisir une université"
							data={universities.map((u) => ({
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
							nothingFoundMessage="Aucune université trouvée"
							disabled={isLoading}
							size="md"
						/>

						<Select
							label="Filière"
							placeholder="Choisir une filière"
							data={availableBranches.map((d) => ({
								value: d.id.toString(),
								label: d.name,
							}))}
							value={filters.branchId?.toString() || null}
							onChange={(value) =>
								onFilter({
									...filters,
									branchId: value ? value : null,
									levelId: null,
								})
							}
							disabled={!filters.universityId || isLoading}
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
									{filters.universityId && (
										<>
											{
												universities.find(
													(u) => u.id.toString() === filters.universityId,
												)?.name
											}
										</>
									)}
									{filters.branchId && (
										<>
											{" > "}
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
										universityId: null,
										branchId: null,
										levelId: null,
										year: null,
									})
								}
								disabled={
									!filters.universityId &&
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
								Ajouter un programme
							</Button>
						</Group>
					</Group>
				</Stack>
			</Paper>
		</>
	);
}
