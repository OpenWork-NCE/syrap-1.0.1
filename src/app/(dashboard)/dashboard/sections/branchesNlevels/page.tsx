"use client";

import { Container, Grid, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import BranchesTable from "@/components/BranchesTable/BranchesTable";
import LevelsTable from "@/components/LevelsTable/LevelsTable";

const items = [{ title: "Filières et Niveaux", href: "#" }];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Filières et Niveaux | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Filières et Niveaux" breadcrumbItems={items} />
					<Grid my={10}>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<PageHeader title="Filières" />
							<BranchesTable
								authorizations={authorizations.filter((authorization) =>
									authorization.includes("branchs"),
								)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<PageHeader title="Niveaux" />
							<LevelsTable
								authorizations={authorizations.filter((authorization) =>
									authorization.includes("levels"),
								)}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
