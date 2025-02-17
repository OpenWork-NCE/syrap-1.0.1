"use client";

import { IconCategory, IconSchool, IconStack3 } from "@tabler/icons-react";
import { Box, Paper, SimpleGrid, Title } from "@mantine/core";
import { StatsCard } from "@/components/StatsCard/StasCard";
import { CardGradient } from "@/components/CardGradientIpes/CardGradient";
import { ShowIpes } from "@/types";
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

interface IpesPageProps {
	id: string;
}

const IpesPage = ({ id }: IpesPageProps) => {
	const [ipes, setIpes] = useState<ShowIpes>({
		arrondissement: {
			id: "",
			name: "",
			slug: "",
			created_at: "",
			department_id: "",
			updated_at: "",
		},
		code: "",
		email: "",
		id: "",
		// institute_id: "",
		name: "",
		phone: "",
		salles: {
			id: "",
			designation: "",
			filiere: {
				id: "",
				name: "",
				author: { user_id: "" },
				description: "",
				validate: "",
			},
			niveau: {
				id: "",
				name: "",
				description: "",
				author: { user_id: "" },
				validate: "",
			},
		},
		university: {
			id: "",
			name: "",
			code: "",
			phone: "",
			description: "",
			email: "",
			arrondissement_id: "",
			user_id: "",
			cenadi_id: "",
		},
		user_id: "",
		arrete_ouverture: "",
		decret_creation: "",
		promoteur_id: "",
		cenadi_id: "",
	});

	useEffect(() => {
		async function fetchIpes() {
			const response = await fetch(internalApiUrl(`/api/ipess/${id}`));
			const data = await response.json();
			setIpes(data);
		}
		fetchIpes();
	}, []);

	console.log("Voici l'Id en question ", id);
	console.log("Et voici l'université ", ipes);

	return (
		<>
			<SimpleGrid
				cols={{ base: 1, md: 1, lg: 3 }}
				spacing={{ base: 10, sm: "xl" }}
				verticalSpacing={{ base: "md", sm: "xl" }}
			>
				{mockStats.map((item) => (
					<StatsCard
						key={item.title}
						icon={item.icon}
						title={item.title}
						count={item.count}
					/>
				))}
			</SimpleGrid>
			<CardGradient
				title={"Informations Générales sur l'IPES"}
				datas={{
					code: ipes.code,
					name: ipes.name,
					phone: ipes.phone,
					email: ipes.email,
					decret_creation: ipes.decret_creation,
					arrete_ouverture: ipes.arrete_ouverture,
					university: ipes.university?.name,
				}}
			/>
			<ClassroomsTable institute={"Ipes"} instituteId={id} />
		</>
	);
};

export default IpesPage;
