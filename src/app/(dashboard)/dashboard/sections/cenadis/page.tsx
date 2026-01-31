"use client";

import { Container, Stack } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import CenadisTable from "@/components/CenadisTable/CenadisTable";

const breadcrumbItems = [
	{ title: "Acteurs", href: "/dashboard" },
	{ title: "CENADI", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>CENADI | IPES-SCpro</title>
				<meta name="description" content="Gestion des CENADI" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Centre National de Développement de l'Informatique"
						description="Gérez les entités CENADI et leurs attributions."
						icon={<IconBuilding size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<CenadisTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("cenadis"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
