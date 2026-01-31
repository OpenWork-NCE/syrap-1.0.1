"use client";

import { Container, Stack } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations, useInstitution, useUser } from "@/app/context/SessionContext";
import { LazyUniversitiesTable } from "@/components/tables";

const breadcrumbItems = [
	{ title: "Acteurs", href: "/dashboard" },
	{ title: "Universités", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();
	const { user } = useUser();

	// Ensure authorizations is always an array
	const safeAuthorizations = Array.isArray(authorizations) ? authorizations : [];

	return (
		<>
			<>
				<title>Universités | IPES-SCpro</title>
				<meta name="description" content="Gestion des universités" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Universités"
						description="Gérez les universités de tutelle et leurs rattachements."
						icon={<IconSchool size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<LazyUniversitiesTable
						authorizations={safeAuthorizations.filter((authorization) =>
							authorization.includes("universities"),
						)}
						institution={institution}
						user={user}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
