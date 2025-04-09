"use client";

import { Anchor, Box, Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import ProfilesTable from "@/components/ProfilesTable/ProfilesTable";
import Logs from "@/components/Logs/page";

const items = [{ title: "Logs", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();

	return (
		<>
			<>
				<title>Logs | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Box mb="lg">
					<PageHeader title="Logs" breadcrumbItems={items} />
				</Box>
				<Logs />
			</Container>
		</>
	);
}

export default Page;
