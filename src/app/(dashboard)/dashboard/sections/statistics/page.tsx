"use client";

import { Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { StatisticsPage } from "@/components/Statistics/StatisticsPage";

const items = [{ title: "Statistiques", href: "#" }];

export default function Statistics() {
	return (
		<>
			<>
				<title>Statistiques | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Statistiques & Analyses"
						breadcrumbItems={items}
					/>
					<StatisticsPage />
				</Stack>
			</Container>
		</>
	);
}
