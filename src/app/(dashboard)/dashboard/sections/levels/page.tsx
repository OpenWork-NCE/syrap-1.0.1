"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import CenadisTable from "@/components/CenadisTable/CenadisTable";

const items = [{ title: "CenadisTable", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Cenadis | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Cenadis" breadcrumbItems={items} />
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
