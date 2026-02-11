"use client";

import {
	IconHash,
	IconBuilding,
	IconPhone,
	IconMail,
	IconFileDescription,
	IconCertificate,
	IconSchool,
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
import { ShowIpes } from "@/types";
import { useEffect, useState } from "react";
import { internalApiUrl } from "@/app/lib/utils";
import ClassroomsTable from "@/components/ClassroomsTable/ClassroomsTable";

interface IpesPageProps {
	id: string;
}

const IpesPage = ({ id }: IpesPageProps) => {
	const [ipes, setIpes] = useState<ShowIpes>({
		arrondissement: {
			id: "",
			name: "",
			created_at: "",
			department: "",
			region: "",
		},
		university: {
			id: "",
			name: "",
			code: "",
			phone: "",
			description: "",
			email: "",
			arrondissement: {
				id: "",
				name: "",
				created_at: "",
				department: "",
				region: "",
			},
			institute: "",
			user: "",
			branches_count: "",
			levels_count: "",
		},
		code: "",
		email: "",
		id: "",
		institute: "",
		name: "",
		phone: "",
		user: "",
		arrete_ouverture: "",
		decret_creation: "",
		promoteur: "",
	});

	useEffect(() => {
		async function fetchIpes() {
			const response = await fetch(internalApiUrl(`/api/ipes/${id}`));
			const data = await response.json();
			setIpes(data);
		}
		fetchIpes();
	}, []);

	const infoItems = [
		{ icon: IconHash, label: "Sigle", value: ipes.code },
		{ icon: IconBuilding, label: "Intitulé", value: ipes.name },
		{ icon: IconPhone, label: "Téléphone", value: ipes.phone },
		{ icon: IconMail, label: "Email", value: ipes.email },
		{
			icon: IconCertificate,
			label: "Décret de création",
			value: ipes.decret_creation,
		},
		{
			icon: IconFileDescription,
			label: "Arrêté d'ouverture",
			value: ipes.arrete_ouverture,
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
					<Paper withBorder p="lg" radius="md" h="100%">
						<Title order={5} mb="md">
							Université de tutelle
						</Title>
						<Group gap="md">
							<ThemeIcon
								variant="light"
								size={48}
								radius="md"
								color="green"
							>
								<IconSchool
									style={{ width: rem(24), height: rem(24) }}
									stroke={1.5}
								/>
							</ThemeIcon>
							<div>
								<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
									Rattachement
								</Text>
								<Text size="md" fw={700}>
									{ipes.university?.name || "—"}
								</Text>
								{ipes.university?.code && (
									<Text size="xs" c="dimmed">
										{ipes.university.code}
									</Text>
								)}
							</div>
						</Group>
					</Paper>
				</Grid.Col>
			</Grid>

			<ClassroomsTable
				institute={"Ipes"}
				instituteId={id}
				parentInstitute={ipes.institute}
			/>
		</>
	);
};

export default IpesPage;
