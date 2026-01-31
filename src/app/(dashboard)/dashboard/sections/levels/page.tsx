"use client";

import { Container, Stack } from "@mantine/core";
import { IconLayers } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import CenadisTable from "@/components/CenadisTable/CenadisTable";

const breadcrumbItems = [
	{ title: "Programmes", href: "/dashboard" },
	{ title: "Niveaux", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Niveaux | IPES-SCpro</title>
				<meta name="description" content="Gestion des niveaux académiques" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Niveaux Académiques"
						description="Gérez les niveaux d'études (Licence, Master, Doctorat, etc.)."
						icon={<IconLayers size={24} />}
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
