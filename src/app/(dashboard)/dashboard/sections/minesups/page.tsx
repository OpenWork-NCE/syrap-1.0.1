"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import MinesupsTable from "@/components/MinesupsTable/MinesupsTable";

const items = [{ title: "MinesupsTable", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Minesups | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Minesups" breadcrumbItems={items} />
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
