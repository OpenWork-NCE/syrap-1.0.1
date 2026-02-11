"use client";

import {
	IconCategory,
	IconStack3,
	IconPhone,
	IconMail,
	IconMapPin,
	IconBuilding,
	IconHash,
} from "@tabler/icons-react";
import {
	Grid,
	Paper,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
	rem,
	SimpleGrid,
} from "@mantine/core";
import { ShowUniversity } from "@/types";
import { useEffect, useState } from "react";
import { internalApiUrl } from "@/app/lib/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import ClassroomsTable from "@/components/ClassroomsTable/ClassroomsTable";

interface UniversityPageProps {
	id: string;
}

const UniversityPage = ({ id }: UniversityPageProps) => {
	const [university, setUniversity] = useState<ShowUniversity>({
		arrondissement: {
			id: "",
			name: "",
			created_at: "",
			department: "",
			region: "",
		},
		code: "",
		description: "",
		email: "",
		id: "",
		institute: "",
		name: "",
		phone: "",
		user: "",
		branches_count: "",
		levels_count: "",
	});

	useEffect(() => {
		async function fetchUniversity() {
			const response = await fetch(internalApiUrl(`/api/universities/${id}`));
			const data = await response.json();
			setUniversity(data);
		}
		fetchUniversity();
	}, []);

	const infoItems = [
		{ icon: IconHash, label: "Sigle", value: university.code },
		{ icon: IconBuilding, label: "Intitulé", value: university.name },
		{ icon: IconPhone, label: "Téléphone", value: university.phone },
		{ icon: IconMail, label: "Email", value: university.email },
		{
			icon: IconMapPin,
			label: "Arrondissement",
			value: university.arrondissement?.name,
		},
	];

	const statItems = [
		{
			icon: IconCategory,
			label: "Filières",
			value: university.branches_count,
		},
		{
			icon: IconStack3,
			label: "Niveaux",
			value: university.levels_count,
		},
	];

	return (
		<>
			<Grid gutter="md">
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Paper withBorder p="lg" radius="md" h="100%">
						<Title order={5} mb="md">
							Informations générales
						</Title>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
							{infoItems.map((item) => (
								<Group key={item.label} gap="sm" wrap="nowrap">
									<ThemeIcon
										variant="light"
										size="lg"
										radius="md"
										color="green"
									>
										<item.icon
											style={{ width: rem(18), height: rem(18) }}
											stroke={1.5}
										/>
									</ThemeIcon>
									<div>
										<Text size="xs" c="dimmed">
											{item.label}
										</Text>
										<Text size="sm" fw={600}>
											{item.value || "—"}
										</Text>
									</div>
								</Group>
							))}
						</SimpleGrid>
					</Paper>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Stack gap="md" h="100%">
						{statItems.map((item) => (
							<Paper
								key={item.label}
								withBorder
								p="lg"
								radius="md"
								style={{ flex: 1 }}
							>
								<Group gap="md">
									<ThemeIcon
										variant="light"
										size={48}
										radius="md"
										color="green"
									>
										<item.icon
											style={{ width: rem(24), height: rem(24) }}
											stroke={1.5}
										/>
									</ThemeIcon>
									<div>
										<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
											{item.label}
										</Text>
										<Text size="xl" fw={700}>
											{item.value || "0"}
										</Text>
									</div>
								</Group>
							</Paper>
						))}
					</Stack>
				</Grid.Col>
			</Grid>

			<PageHeader title="Salles" />
			<ClassroomsTable
				institute={"University"}
				instituteId={id}
				parentInstitute={university.institute}
			/>
		</>
	);
};

export default UniversityPage;
