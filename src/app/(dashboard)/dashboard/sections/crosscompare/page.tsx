"use client";

import { Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import ComparePage from "@/components/Compare/ComparePage";

const items = [{ title: "Croisement et Comparaison", href: "#" }];

function Page() {
	return (
		<>
			<>
				<title>Croisement et Comparaison | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Croisement et Comparaison"
						breadcrumbItems={items}
					/>
					<ComparePage />
				</Stack>
			</Container>
		</>
	);
}

export default Page;
