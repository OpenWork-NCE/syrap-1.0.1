"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import BranchesTable from "@/components/BranchesTable/BranchesTable";

const items = [{ title: "Niveaux", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Niveaux | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Niveaux" breadcrumbItems={items} />
					<BranchesTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("branches"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
