"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import IpessPage from "@/components/IpesPage/IpesPage";

const items = [{ title: "Ipes", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<>
				<title>Ipes | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Ipes" breadcrumbItems={items} />
					<IpessPage id={params.id} />
				</Stack>
			</Container>
		</>
	);
}

export default Page;