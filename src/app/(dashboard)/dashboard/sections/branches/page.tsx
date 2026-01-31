"use client";

import { Container, Stack } from "@mantine/core";
import { IconGitBranch } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import BranchesTable from "@/components/BranchesTable/BranchesTable";

const breadcrumbItems = [
	{ title: "Programmes", href: "/dashboard" },
	{ title: "Filières", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Filières | IPES-SCpro</title>
				<meta name="description" content="Gestion des filières" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Filières"
						description="Gérez les filières et parcours académiques de votre établissement."
						icon={<IconGitBranch size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<BranchesTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("branchs"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
