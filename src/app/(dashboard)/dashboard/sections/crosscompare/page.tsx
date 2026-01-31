"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations, useInstitution, useUser } from "@/app/context/SessionContext";
import UniversitiesTable from "@/components/UniversitiesTable/UniversitiesTable";
import Syllabus from "@/components/Syllabus/Syllabus";
import ComparePage from "@/components/Compare/ComparePage";

const items = [{ title: "CrossCompare", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();
	const { user } = useUser();

	return (
		<>
			<>
				<title>Croisement et Comparaison | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Croisement et Comparaison"
						breadcrumbItems={items}
					/>
					<ComparePage />
				</Stack>
			</Container>
		</>
	);
}

export default Page;
