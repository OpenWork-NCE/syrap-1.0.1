"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import UesTable from "@/components/UesTable/UesTable";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";

const items = [{ title: "Ues", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Unitées d'Enseignement | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Unitées d'Enseignement" breadcrumbItems={items} />
					<UesTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("ues"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
