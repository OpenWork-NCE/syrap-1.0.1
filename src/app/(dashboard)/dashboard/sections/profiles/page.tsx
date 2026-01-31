"use client";

import { Container, Stack } from "@mantine/core";
import { IconUserCog } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import ProfilesTable from "@/components/ProfilesTable/ProfilesTable";

const breadcrumbItems = [
	{ title: "Administration", href: "/dashboard" },
	{ title: "Rôles", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Rôles | IPES-SCpro</title>
				<meta name="description" content="Gestion des rôles" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Gestion des Rôles"
						description="Définissez les rôles et leurs niveaux d'accès dans l'application."
						icon={<IconUserCog size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<ProfilesTable
						authorizations={authorizations?.filter((authorization) =>
							authorization.includes("role"),
						) ?? []}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
