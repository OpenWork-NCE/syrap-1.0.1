"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import UniversityPage from "@/components/UniversityPage/UniversityPage";

const items = [{ title: "Université", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<>
				<title>Université | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Université" breadcrumbItems={items} />
					<UniversityPage id={params.id} />
				</Stack>
			</Container>
		</>
	);
}

export default Page;
