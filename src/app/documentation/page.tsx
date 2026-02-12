"use client";

import {
	Container,
	SimpleGrid,
	Stack,
	Title,
	Text,
	Paper,
	Group,
	ThemeIcon,
	List,
	Divider,
	Box,
	Badge,
	Anchor,
} from "@mantine/core";
import {
	IconBook,
	IconBuildingBank,
	IconSchool,
	IconArrowsExchange,
	IconFileText,
	IconUsers,
	IconChartBar,
	IconCalendar,
	IconMessage,
	IconSettings,
} from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";

const items = [{ title: "Documentation", href: "#" }];

const sections = [
	{
		icon: IconBuildingBank,
		title: "Gestion des IPES",
		badge: "Institutions",
		content: [
			"Accédez à la liste complète des Instituts Privés d'Enseignement Supérieur depuis le menu latéral.",
			"Chaque fiche IPES contient les informations de l'établissement, ses filières, niveaux et programmes associés.",
			"Les utilisateurs avec les permissions appropriées peuvent ajouter, modifier ou supprimer des IPES.",
		],
		path: "/dashboard/sections/ipes",
	},
	{
		icon: IconSchool,
		title: "Gestion des Universités",
		badge: "Institutions",
		content: [
			"Les universités de tutelle sont gérées de manière similaire aux IPES.",
			"Chaque université peut avoir des programmes (syllabus) qui servent de référence pour la comparaison.",
			"La page de détail d'une université affiche ses filières, niveaux et salles de classe associés.",
		],
		path: "/dashboard/sections/universities",
	},
	{
		icon: IconArrowsExchange,
		title: "Croisement et Comparaison",
		badge: "Analyse",
		content: [
			"La fonctionnalité principale d'IPES-SCpro permet de comparer les programmes entre deux institutions.",
			"Sélectionnez deux institutions, une filière commune et un niveau pour lancer la comparaison.",
			"Le système identifie automatiquement les UE communes, les UE spécifiques à chaque institution et les écarts.",
			"Les résultats peuvent être exportés en PDF pour archivage ou partage.",
		],
		path: "/dashboard/sections/crosscompare",
	},
	{
		icon: IconFileText,
		title: "Unités d'Enseignement (UE)",
		badge: "Programmes",
		content: [
			"Les UE sont les briques fondamentales des programmes d'enseignement.",
			"Chaque UE est caractérisée par un code, un intitulé, un nombre de crédits et un volume horaire.",
			"Les UE sont rattachées à des filières et niveaux via les salles de classe (combinaison filière + niveau).",
		],
		path: "/dashboard/sections/ues",
	},
	{
		icon: IconUsers,
		title: "Rôles et Permissions",
		badge: "Administration",
		content: [
			"Le système utilise un modèle de permissions granulaire basé sur des rôles.",
			"Les rôles définissent un ensemble de permissions qui déterminent les actions autorisées.",
			"Les permissions couvrent : la gestion des institutions, des programmes, des utilisateurs et des documents.",
			"Seuls les administrateurs peuvent créer ou modifier des rôles.",
		],
		path: "/dashboard/sections/authorizations",
	},
	{
		icon: IconFileText,
		title: "Documents et Rapports",
		badge: "Documents",
		content: [
			"La section Documents centralise les rapports générés et les fichiers partagés.",
			"Les logs système permettent de suivre l'historique des actions sur la plateforme.",
			"Les documents peuvent être consultés et téléchargés selon vos permissions.",
		],
		path: "/dashboard/sections/reports",
	},
	{
		icon: IconChartBar,
		title: "Statistiques et Analyses",
		badge: "Analyse",
		content: [
			"Le tableau de bord statistique offre une vue d'ensemble des indicateurs clés.",
			"Visualisez la répartition des institutions, programmes et UE à travers des graphiques.",
			"Les données sont mises à jour en temps réel selon les modifications effectuées.",
		],
		path: "/dashboard/sections/statistics",
	},
	{
		icon: IconCalendar,
		title: "Calendrier",
		badge: "Organisation",
		content: [
			"Le calendrier permet de planifier et suivre les événements liés à la gestion des programmes.",
			"Visualisez les échéances, les réunions et les dates importantes.",
		],
		path: "/dashboard/sections/calendar",
	},
	{
		icon: IconMessage,
		title: "Messagerie",
		badge: "Communication",
		content: [
			"La messagerie intégrée permet la communication entre les utilisateurs de la plateforme.",
			"Les messages non lus sont signalés par un badge dans le menu latéral.",
			"Utilisez la messagerie pour coordonner les validations de programmes et les échanges institutionnels.",
		],
		path: "/dashboard/sections/messages",
	},
];

export default function DocumentationPage() {
	return (
		<>
			<>
				<title>Documentation | IPES-SCpro</title>
				<meta
					name="description"
					content="Documentation de la plateforme IPES-SCpro"
				/>
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Documentation" breadcrumbItems={items} />

					<Paper p="xl" radius="md" withBorder>
						<Group gap="sm" mb="sm">
							<ThemeIcon size="lg" variant="light" color="blue">
								<IconBook size={20} />
							</ThemeIcon>
							<Title order={3}>Présentation de la plateforme</Title>
						</Group>
						<Text size="sm" c="dimmed" mb="md">
							IPES-SCpro est le Système de Coordination des programmes des
							Instituts Privés d'Enseignement Supérieur. La plateforme permet
							les actions de consultations, coordination et conseils des
							programmes des IPES, en simplifiant la coordination des entités
							de structuration des programmes des Institutions Privées
							d'Enseignement Supérieur (IPES) au Cameroun.
						</Text>
						<Divider mb="md" />
						<Group gap="xs">
							<Badge variant="light" color="blue" size="sm">
								Consultations
							</Badge>
							<Badge variant="light" color="green" size="sm">
								Coordination
							</Badge>
							<Badge variant="light" color="orange" size="sm">
								Conseils
							</Badge>
						</Group>
					</Paper>

					<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
						{sections.map((section, index) => (
							<Paper key={index} p="lg" radius="md" withBorder>
								<Group justify="space-between" mb="md">
									<Group gap="sm">
										<ThemeIcon size="lg" variant="light" color="blue">
											<section.icon size={20} />
										</ThemeIcon>
										<Title order={4}>{section.title}</Title>
									</Group>
									<Badge variant="light" size="sm">
										{section.badge}
									</Badge>
								</Group>
								<List spacing="xs" size="sm" c="dimmed">
									{section.content.map((item, i) => (
										<List.Item key={i}>{item}</List.Item>
									))}
								</List>
								<Box mt="sm">
									<Anchor href={section.path} size="xs">
										Accéder à cette section →
									</Anchor>
								</Box>
							</Paper>
						))}
					</SimpleGrid>

					<Paper p="xl" radius="md" withBorder>
						<Group gap="sm" mb="md">
							<ThemeIcon size="lg" variant="light" color="blue">
								<IconSettings size={20} />
							</ThemeIcon>
							<Title order={3}>Besoin d'aide ?</Title>
						</Group>
						<Text size="sm" c="dimmed" mb="sm">
							Si vous avez des questions ou rencontrez un problème, plusieurs
							options s'offrent à vous :
						</Text>
						<List spacing="xs" size="sm" c="dimmed">
							<List.Item>
								Consultez le{" "}
								<Anchor href="/aide">centre d'aide</Anchor> pour les questions
								fréquentes.
							</List.Item>
							<List.Item>
								Contactez le support technique à{" "}
								<Anchor href="mailto:support@ipes-scpro.cm">
									support@ipes-scpro.cm
								</Anchor>
								.
							</List.Item>
						</List>
					</Paper>
				</Stack>
			</Container>
		</>
	);
}
