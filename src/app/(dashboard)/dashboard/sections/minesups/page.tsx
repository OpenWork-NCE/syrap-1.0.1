"use client";

import { Container, Stack } from "@mantine/core";
import { IconBuildingCommunity } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/SessionContext";
import MinesupsTable from "@/components/MinesupsTable/MinesupsTable";

const breadcrumbItems = [
	{ title: "Acteurs", href: "/dashboard" },
	{ title: "MINESUP", href: "#" },
];

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>MINESUP | IPES-SCpro</title>
				<meta name="description" content="Gestion du MINESUP" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Ministère de l'Enseignement Supérieur"
						description="Gérez les entités du Ministère de l'Enseignement Supérieur."
						icon={<IconBuildingCommunity size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>
					<MinesupsTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("minesups"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
