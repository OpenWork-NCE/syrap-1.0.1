"use client";

import {
	IconCategory,
	IconSchool,
	IconStack3,
	TablerIconsProps,
} from "@tabler/icons-react";
import { Box, Paper, SimpleGrid, Title } from "@mantine/core";
import { StatsCard } from "@/components/StatsCard/StasCard";
import { CardGradient } from "@/components/CardGradientUniversity/CardGradient";
import { ShowUniversity } from "@/types";
import { useEffect, useState } from "react";
import { internalApiUrl } from "@/app/lib/utils";
import { undefined } from "zod";
import ClassroomsTable from "@/components/ClassroomsTable/ClassroomsTable";
import { useInstitution } from "@/app/context/InstitutionContext";

const mockStats = [
	{
		icon: IconSchool,
		title: "Nombre d'IPES",
		count: 10,
	},
	{
		icon: IconCategory,
		title: "Nombre de filières",
		count: 15,
	},
	{
		icon: IconStack3,
		title: "Nombre de niveaux",
		count: 7,
	},
];

interface CardDataProps {
	icon: React.FC<any>;
	title: string;
	count: string;
}

interface UniversityPageProps {
	id: string;
}

const UniversityPage = ({ id }: UniversityPageProps) => {
	const [university, setUniversity] = useState<ShowUniversity>({
		arrondissement: {
			id: "",
			name: "",
			slug: "",
			created_at: "",
			department_id: "",
			updated_at: "",
		},
		code: "",
		description: "",
		email: "",
		id: "",
		institute: "",
		name: "",
		phone: "",
		salles: {
			id: "",
			designation: "",
			branch: {
				id: "",
				name: "",
				author: { user_id: "" },
				description: "",
				validate: "",
			},
			level: {
				id: "",
				name: "",
				description: "",
				author: { user_id: "" },
				validate: "",
			},
		},
		user: "",
		branches_count: "",
		global_matching: "",
		levels_count: "",
	});
	console.log("Voici l'université ", university);

	const [cardDatas, setCardDatas] = useState<CardDataProps[]>([]);

	useEffect(() => {
		async function fetchUniversity() {
			const response = await fetch(internalApiUrl(`/api/universities/${id}`));
			const data = await response.json();
			setUniversity(data);
			setCardDatas([
				{
					icon: IconCategory,
					title: "Nombre de filières",
					count: data.branches_count,
				},
				{
					icon: IconStack3,
					title: "Nombre de niveaux",
					count: data.levels_count,
				},
			]);
		}
		fetchUniversity();
	}, []);

	console.log("Voici l'Id en question ", id);
	console.log("Et voici l'université ", university);

	return (
		<>
			<SimpleGrid
				cols={{ base: 1, md: 1, lg: 3 }}
				spacing={{ base: 10, sm: "xl" }}
				verticalSpacing={{ base: "md", sm: "xl" }}
			>
				{cardDatas.map((item) => (
					<StatsCard
						key={item.title}
						icon={item.icon}
						title={item.title}
						count={item.count}
					/>
				))}
			</SimpleGrid>
			<CardGradient
				title={"Informations Générales sur l'Université"}
				datas={{
					code: university.code,
					name: university.name,
					phone: university.phone,
					email: university.email,
					levels_count: university.levels_count,
					branches_count: university.branches_count,
					global_matching: university.global_matching,
				}}
			/>
			<ClassroomsTable
				institute={"University"}
				instituteId={id}
				parentInstitute={university.institute}
			/>
		</>
	);
};

export default UniversityPage;
