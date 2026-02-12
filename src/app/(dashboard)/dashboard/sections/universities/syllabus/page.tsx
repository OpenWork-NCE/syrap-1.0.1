"use client";

import { Container, Stack, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useInstitution, useAuthorizations } from "@/app/context/SessionContext";
import Syllabus from "@/components/Syllabus/Syllabus";

const items = [
	{ title: "Universités", href: "/dashboard/sections/universities" },
	{ title: "Programmes", href: "#" },
];

function Page() {
	const { institution } = useInstitution();
	const { authorizations } = useAuthorizations();

	// Vérifier si l'utilisateur a la permission de voir les programmes des universités
	const hasPermission = authorizations?.includes("list-universities") ||
		authorizations?.includes("list-programmes");

	// Déterminer le type d'utilisateur en fonction du nom de l'institution ou des permissions
	const getUserType = (): "Cenadi" | "Minesup" | "IPES" | "University" => {
		const name = institution?.name?.toLowerCase() || "";
		if (name.includes("cenadi")) return "Cenadi";
		if (name.includes("minsup") || name.includes("minesup")) return "Minesup";
		if (name.includes("university") || name.includes("université")) return "University";
		// Si pas d'institution mais a les permissions, considérer comme Cenadi (vue centrale)
		if (!institution?.name && hasPermission) return "Cenadi";
		return "IPES";
	};

	// Si l'utilisateur a une institution, utiliser son ID, sinon utiliser "0" pour vue centrale
	const instituteId = institution?.id ? String(institution.id) : "0";
	const instituteName = institution?.name || "Administration centrale";

	return (
		<>
			<>
				<title>Programmes d'Universités | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Programmes d'Universités"
						breadcrumbItems={items}
					/>
					{hasPermission ? (
						<Syllabus
							instituteId={instituteId}
							instituteName={instituteName}
							instituteType={"University"}
							userType={getUserType()}
						/>
					) : (
						<Alert
							icon={<IconInfoCircle size={16} />}
							title="Accès refusé"
							color="red"
						>
							Vous n'avez pas la permission d'accéder aux programmes des universités.
						</Alert>
					)}
				</Stack>
			</Container>
		</>
	);
}

export default Page;
