"use client";

import {
	Container,
	Stack,
} from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { LazyUsersTable } from "@/components/tables";
import { useAuthorizations, useInstitution } from "@/app/context/SessionContext";

const breadcrumbItems = [
	{ title: "Administration", href: "/dashboard" },
	{ title: "Utilisateurs", href: "#" },
];

// function StatCard({ title, value, description, icon, color }: { title: string; value: string; description: string; icon: React.ReactNode; color: string }) {
// 	return (
// 		<Card withBorder p="md" radius="md">
// 			<Group justify="space-between">
// 				<Text fw={500} fz="md" c="dimmed">
// 					{title}
// 				</Text>
// 				<ThemeIcon color={color} variant="light" size={38} radius="md">
// 					{icon}
// 				</ThemeIcon>
// 			</Group>
// 			<Text fw={700} fz="xl" mt="md">
// 				{value}
// 			</Text>
// 			<Text fz="xs" c="dimmed" mt={4}>
// 				{description}
// 			</Text>
// 		</Card>
// 	);
// }

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();

	return (
		<>
			<title>Utilisateurs | IPES-SCpro</title>
			<meta name="description" content="Gestion des utilisateurs de la plateforme IPES-SCpro" />
			
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Gestion des Utilisateurs"
						description="Administrez les comptes utilisateurs, rôles et permissions."
						icon={<IconUsers size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					
					{/* <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
						<StatCard 
							title="Total Utilisateurs"
							value={userStats.total}
							description="Tous les utilisateurs enregistrés"
							icon={<IconUsers size={18} />}
							color="blue"
						/>
						<StatCard 
							title="Utilisateurs Actifs"
							value={userStats.active}
							description="Utilisateurs actifs ce mois"
							icon={<IconUserCheck size={18} />}
							color="green"
						/>
						<StatCard 
							title="Nouveaux Utilisateurs"
							value={userStats.new}
							description="Nouveaux utilisateurs ce mois"
							icon={<IconUserPlus size={18} />}
							color="teal"
						/>
						<StatCard 
							title="Utilisateurs Inactifs"
							value={userStats.inactive}
							description="Utilisateurs inactifs"
							icon={<IconUserX size={18} />}
							color="orange"
						/>
					</SimpleGrid> */}
					
						<LazyUsersTable
							authorizations={authorizations?.filter((authorization) =>
								authorization.includes("user")
							) ?? []}
							institution={institution}
						/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
