"use client";

import {
	Container,
	Stack,
	Title,
	Text,
	Accordion,
	Paper,
	Group,
	ThemeIcon,
	Anchor,
	SimpleGrid,
	Box,
} from "@mantine/core";
import {
	IconHelp,
	IconSchool,
	IconBuildingBank,
	IconArrowsExchange,
	IconFileText,
	IconUsers,
	IconMail,
	IconHeadset,
	IconBook,
} from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";

const items = [{ title: "Aide", href: "#" }];

const faqItems = [
	{
		question: "Comment ajouter un nouvel IPES ?",
		answer:
			"Rendez-vous dans la section IPES depuis le menu latéral, puis cliquez sur le bouton \"Ajouter\". Remplissez les informations requises (nom, adresse, contact) et validez le formulaire.",
	},
	{
		question: "Comment comparer les programmes de deux institutions ?",
		answer:
			"Accédez à la page \"Croisement et Comparaison\" depuis le menu. Sélectionnez les deux institutions à comparer, choisissez la filière et le niveau, puis le système affichera automatiquement les différences et similitudes entre les programmes.",
	},
	{
		question: "Comment gérer les unités d'enseignement (UE) ?",
		answer:
			"Les UE sont accessibles depuis la section \"UE\" du menu latéral. Vous pouvez y créer, modifier ou supprimer des unités d'enseignement, et les associer à des filières et niveaux spécifiques.",
	},
	{
		question: "Comment exporter un rapport de comparaison ?",
		answer:
			"Après avoir effectué une comparaison de programmes, cliquez sur le bouton \"Exporter en PDF\" disponible dans la page de résultats. Le document généré contiendra le détail complet de la comparaison.",
	},
	{
		question: "Comment gérer les rôles et permissions ?",
		answer:
			"La gestion des autorisations est accessible depuis la section \"Autorisations\" du menu. Vous pouvez y créer des rôles, leur attribuer des permissions spécifiques, et assigner ces rôles aux utilisateurs.",
	},
	{
		question: "Comment consulter les logs du système ?",
		answer:
			"Les logs sont disponibles dans la section \"Documents > Logs\" du menu latéral. Ils permettent de suivre l'historique des actions effectuées sur la plateforme.",
	},
];

const contactCards = [
	{
		icon: IconMail,
		title: "Email",
		description: "Envoyez-nous un email pour toute question",
		action: "support@ipes-scpro.cm",
		href: "mailto:support@ipes-scpro.cm",
	},
	{
		icon: IconHeadset,
		title: "Support technique",
		description: "Assistance pour les problèmes techniques",
		action: "support@ipes-scpro.cm",
		href: "mailto:support@ipes-scpro.cm",
	},
	{
		icon: IconBook,
		title: "Documentation",
		description: "Consultez la documentation complète",
		action: "Voir la documentation",
		href: "/documentation",
	},
];

export default function AidePage() {
	return (
		<>
			<>
				<title>Aide | IPES-SCpro</title>
				<meta
					name="description"
					content="Centre d'aide de la plateforme IPES-SCpro"
				/>
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader title="Centre d'aide" breadcrumbItems={items} />

					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
						{contactCards.map((card) => (
							<Paper key={card.title} p="lg" radius="md" withBorder>
								<Group gap="md" mb="sm">
									<ThemeIcon size="lg" variant="light" color="blue">
										<card.icon size={20} />
									</ThemeIcon>
									<Box>
										<Text fw={600} size="sm">
											{card.title}
										</Text>
										<Text size="xs" c="dimmed">
											{card.description}
										</Text>
									</Box>
								</Group>
								<Anchor href={card.href} size="sm">
									{card.action}
								</Anchor>
							</Paper>
						))}
					</SimpleGrid>

					<Paper p="xl" radius="md" withBorder>
						<Group gap="sm" mb="lg">
							<ThemeIcon size="lg" variant="light" color="blue">
								<IconHelp size={20} />
							</ThemeIcon>
							<Title order={3}>Questions fréquentes</Title>
						</Group>

						<Accordion variant="separated" radius="md">
							{faqItems.map((item, index) => (
								<Accordion.Item key={index} value={`faq-${index}`}>
									<Accordion.Control>
										<Text fw={500} size="sm">
											{item.question}
										</Text>
									</Accordion.Control>
									<Accordion.Panel>
										<Text size="sm" c="dimmed">
											{item.answer}
										</Text>
									</Accordion.Panel>
								</Accordion.Item>
							))}
						</Accordion>
					</Paper>

					<Paper p="xl" radius="md" withBorder>
						<Group gap="sm" mb="md">
							<ThemeIcon size="lg" variant="light" color="blue">
								<IconSchool size={20} />
							</ThemeIcon>
							<Title order={3}>Fonctionnalités principales</Title>
						</Group>
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
							{[
								{
									icon: IconBuildingBank,
									title: "Gestion des institutions",
									desc: "Gérez les IPES, universités et organismes de tutelle depuis un tableau de bord centralisé.",
								},
								{
									icon: IconArrowsExchange,
									title: "Comparaison de programmes",
									desc: "Comparez les programmes d'enseignement entre institutions pour identifier les écarts.",
								},
								{
									icon: IconFileText,
									title: "Gestion documentaire",
									desc: "Centralisez et organisez les rapports et documents officiels de la plateforme.",
								},
								{
									icon: IconUsers,
									title: "Rôles et permissions",
									desc: "Configurez les accès utilisateurs avec un système de rôles granulaire.",
								},
								{
									icon: IconSchool,
									title: "Programmes (Syllabus)",
									desc: "Consultez et gérez les programmes d'enseignement par filière et niveau.",
								},
								{
									icon: IconHelp,
									title: "Statistiques",
									desc: "Visualisez les indicateurs clés et les analyses de la plateforme.",
								},
							].map((feature) => (
								<Paper key={feature.title} p="md" radius="sm" withBorder>
									<Group gap="sm" mb="xs">
										<ThemeIcon
											size="md"
											variant="light"
											color="blue"
										>
											<feature.icon size={16} />
										</ThemeIcon>
										<Text fw={600} size="sm">
											{feature.title}
										</Text>
									</Group>
									<Text size="xs" c="dimmed">
										{feature.desc}
									</Text>
								</Paper>
							))}
						</SimpleGrid>
					</Paper>
				</Stack>
			</Container>
		</>
	);
}
