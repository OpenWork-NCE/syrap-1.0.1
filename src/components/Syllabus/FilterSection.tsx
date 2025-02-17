"use client";

import { Group, Select, Button } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
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
	availableYears: String[];
	setAvailableYears: (availableYears: String[]) => void;
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
		fetchDatas();
		console.log("Voici les universities: ", availableBranches);
		console.log("Voici les filieres: ", availableBranches);
		console.log("Voici les niveau: ", availableLevels);
	}, [filters]);

	return (
		<Group align="end" grow>
			<Select
				label="Choix une université"
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
					})
				}
				clearable
			/>

			<Select
				label="Choix de la Filière"
				placeholder="Choisir une filière"
				data={availableBranches.map((d: any) => ({
					value: d.id.toString(),
					label: d.name,
				}))}
				value={filters.branchId?.toString() || null}
				onChange={(value) =>
					onFilter({
						...filters,
						branchId: value ? value : null,
					})
				}
				disabled={!filters.universityId}
				clearable
			/>

			<Select
				label="Choisir un Niveau"
				placeholder="Choisir un niveau"
				data={availableLevels.map((l: any) => ({
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
				disabled={!filters.branchId}
				clearable
			/>

			<Select
				label="Choisir une Année"
				placeholder="Choisir une Année"
				data={availableYears.map((l: any, index) => ({
					value: index.toString(),
					label: l,
				}))}
				value={filters.year?.toString() || null}
				onChange={(value) =>
					onFilter({
						...filters,
						year: value ? String(value) : null,
					})
				}
				disabled={!filters.universityId}
				clearable
			/>

			<Group>
				<Button leftSection={<IconPlus size={14} />} onClick={onAddClick}>
					Ajouter un programme
				</Button>
				{/*<Button leftSection={<IconSearch size={14} />} variant="light">*/}
				{/*	Rechercher le programme*/}
				{/*</Button>*/}
			</Group>
		</Group>
	);
}
