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
	const { institution } = useInstitution();
	console.log("institution : ", institution);

	return (
		<>
			<>
				<title>Programmes d'Universités | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Programmes d'Universités"
						breadcrumbItems={items}
					/>
					<Syllabus
						instituteId={institution.id}
						instituteName={institution.name}
						instituteType={"University"}
						userType={(institution.model).includes("cenadi") ? "Cenadi" : (institution.model).includes("minsup") ? "Minesup" : (institution.model).includes("University") ? "University" : "IPES"}
					/>
					{/* <Syllabus
						instituteId={"16"}
						instituteName={"Université de Yaoundé 1"}
					/> */}
				</Stack>
			</Container>
		</>
	);
}

export default Page;
