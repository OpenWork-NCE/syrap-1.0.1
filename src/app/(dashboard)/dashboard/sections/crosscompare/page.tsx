"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import UniversitiesTable from "@/components/UniversitiesTable/UniversitiesTable";
import { useInstitution } from "@/app/context/InstitutionContext";
import { useUser } from "@/app/context/UserContext";
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
				<title>Croisement et Comparaison | SYRAP</title>
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
