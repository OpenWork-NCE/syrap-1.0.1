"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import AuthorizationsTable from "@/components/AuthorizationsTable/AuthorizationsTable";

const items = [{ title: "Permissions", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Permissions | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Permissions" breadcrumbItems={items} />
					<AuthorizationsTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("permissions"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
