"use client";

import { Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import IpessPage from "@/components/IpesPage/IpesPage";

const items = [{ title: "Ipes", href: "#" }];

function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<>
				<title>Ipes | IPES-SCpro</title>
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
