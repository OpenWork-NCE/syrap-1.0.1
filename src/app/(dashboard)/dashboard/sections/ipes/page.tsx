"use client";

import { Anchor, Container, Stack } from "@mantine/core";
import { PATH_BOARD } from "@/routes";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import IpessTable from "@/components/IpessTable/IpessTable";
import { useInstitution } from "@/app/context/InstitutionContext";
import { useUser } from "@/app/context/UserContext";

const items = [{ title: "Ipes", href: "#" }].map((item, index) => (
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
				<title>Ipes | SYHPUI</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Ipes" breadcrumbItems={items} />
					<IpessTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("ipes"),
						)}
						institution={institution}
						user={user}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
