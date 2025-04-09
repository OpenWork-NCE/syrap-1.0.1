"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import ProfilesTable from "@/components/ProfilesTable/ProfilesTable";

const items = [{ title: "Rôles", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Rôles | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Rôles" breadcrumbItems={items} />
					<ProfilesTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("role"),
						)}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
