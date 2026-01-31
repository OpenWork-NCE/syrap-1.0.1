"use client";

import { Container, Stack } from "@mantine/core";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations, useInstitution, useUser } from "@/app/context/SessionContext";
import { LazyIpessTable } from "@/components/tables";

const breadcrumbItems = [
	{ title: "Acteurs", href: "/dashboard" },
	{ title: "IPES", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();
	const { user } = useUser();

	return (
		<>
			<>
				<title>IPES | IPES-SCpro</title>
				<meta name="description" content="Gestion des IPES" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Instituts Privés d'Enseignement Supérieur"
						description="Consultez et gérez les IPES rattachés à votre institution."
						icon={<IconBuildingSkyscraper size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<LazyIpessTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("ipes"),
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
