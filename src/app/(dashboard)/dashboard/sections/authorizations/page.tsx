"use client";

import { Container, Stack } from "@mantine/core";
import { IconShieldLock } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import AuthorizationsTable from "@/components/AuthorizationsTable/AuthorizationsTable";

const breadcrumbItems = [
	{ title: "Administration", href: "/dashboard" },
	{ title: "Permissions", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Permissions | IPES-SCpro</title>
				<meta name="description" content="Gestion des permissions" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Gestion des Permissions"
						description="Configurez les permissions d'accès aux fonctionnalités de l'application."
						icon={<IconShieldLock size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<AuthorizationsTable
						authorizations={authorizations?.filter((authorization) =>
							authorization.includes("permissions"),
						) ?? []}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
