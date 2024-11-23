"use client";

import { Anchor, Container, PaperProps, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import UsersTable from "@/components/UsersTable/UsersTable";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

const items = [{ title: "Users", href: "#" }].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

const PAPER_PROPS: PaperProps = {
	p: "md",
	shadow: "md",
	radius: "md",
};

function Page() {
	const { authorizations } = useAuthorizations();
	const { institution } = useInstitution();

	return (
		<>
			<>
				<title>Utilisateurs | SYRAP</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Utilisateurs" breadcrumbItems={items} />
					<UsersTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("user"),
						)}
						institution={institution}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
