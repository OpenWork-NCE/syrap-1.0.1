"use client";

import { Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import UniversityPage from "@/components/UniversityPage/UniversityPage";

const items = [
	{ title: "Universités", href: "/dashboard/sections/universities" },
	{ title: "Détails", href: "#" },
];

function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<>
				<title>Université | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Université" breadcrumbItems={items} />
					<UniversityPage id={params.id} />
				</Stack>
			</Container>
		</>
	);
}

export default Page;
