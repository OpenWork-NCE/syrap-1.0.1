"use client";

import { Box, Container } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import Logs from "@/components/Logs/page";

const items = [{ title: "Logs", href: "#" }];

function Page() {
	return (
		<>
			<>
				<title>Logs | IPES-SCpro</title>
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
