"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import { useInstitution } from "@/app/context/SessionContext";
import { Container, Box } from "@mantine/core";
import { DocumentsPage } from "@/components/Files";

const items = [
	{ title: "Documents", href: "#" },
	{ title: "Rapports", href: "#" },
];

function Page() {
	const { institution } = useInstitution();

	// Prepare institution data for DocumentsPage
	const institutionData = institution
		? {
				id: String(institution.id),
				name: institution.name || "",
				slug: institution.slug || "",
				type: institution.slug?.includes("cenadi")
					? "cenadi"
					: institution.slug?.includes("minsup")
						? "minsup"
						: "institute",
			}
		: null;

	return (
		<>
			<>
				<title>Documents | SYRAP</title>
				<meta name="description" content="Gestion des documents" />
			</>
			<Container fluid>
				<Box mb="lg">
					<PageHeader title="Gestion des documents" breadcrumbItems={items} />
				</Box>
				<DocumentsPage institution={institutionData} />
			</Container>
		</>
	);
}

export default Page;
