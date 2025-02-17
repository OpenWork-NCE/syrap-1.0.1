"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import UniversitiesTable from "@/components/UniversitiesTable/UniversitiesTable";
import { useInstitution } from "@/app/context/InstitutionContext";
import { useUser } from "@/app/context/UserContext";
import Syllabus from "@/components/Syllabus/Syllabus";

const items = [{ title: "Syllabus", href: "#" }].map((item, index) => (
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
				<title>Programmes d'Universités | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Programmes d'Universités"
						breadcrumbItems={items}
					/>
					<Syllabus />
				</Stack>
			</Container>
		</>
	);
}

export default Page;
