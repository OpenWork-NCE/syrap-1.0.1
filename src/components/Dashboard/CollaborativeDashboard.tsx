"use client";

import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Grid,
	Group,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	ActionIcon,
	Indicator,
	Tabs,
	Tooltip,
	Skeleton,
	Drawer,
	ScrollArea,
	Divider,
	Menu,
	UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBell,
	IconBook,
	IconBuildingCommunity,
	IconCheckbox,
	IconChevronRight,
	IconCircleCheck,
	IconFileDescription,
	IconGitPullRequest,
	IconMessageCircle,
	IconSchool,
	IconUsers,
	IconUserPlus,
	IconFileUpload,
	IconEdit,
	IconSettings,
	IconClipboardCheck,
	IconFile,
	IconFileTypePdf,
	IconFileTypeDoc,
	IconFileTypeXls,
	IconPhoto,
	IconDownload,
	IconBuilding,
	IconBuildingSkyscraper,
	IconShield,
	IconCalendar,
	IconCalendarEvent,
	IconCheck,
	IconX,
	IconDots,
	IconTrash,
	IconAlertCircle,
	IconInfoCircle,
	IconMessage,
	IconFileCheck,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";
import { innerUrl } from "@/app/lib/utils";
import { useInstitution } from "@/app/context/InstitutionContext";
import { FileDocument, FileType } from "@/types";
import classes from "./CollaborativeDashboard.module.css";

interface DashboardStats {
	universities_count: number;
	ipes_count: number;
	salles_count?: number;
	users_count: number;
}

// Données simulées pour les tâches en attente - à remplacer par API
const mockPendingTasks = [
	{
		id: 1,
		title: "Valider le programme de Licence Informatique",
		institution: "IPES Cameroun",
		type: "validation",
		priority: "high",
		dueDate: "2 jours",
	},
	{
		id: 2,
		title: "Réviser les UEs du Master Finance",
		institution: "Université de Yaoundé",
		type: "revision",
		priority: "medium",
		dueDate: "5 jours",
	},
	{
		id: 3,
		title: "Approuver les modifications du syllabus",
		institution: "IPES Douala",
		type: "approval",
		priority: "low",
		dueDate: "1 semaine",
	},
];

// Fonction pour calculer l'année académique en cours
const getAcademicYear = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth(); // 0 = janvier, 8 = septembre

	// L'année académique commence en septembre
	// Si on est entre janvier et août, on est dans l'année académique qui a commencé l'année précédente
	if (month < 8) { // Avant septembre
		return `${year - 1}-${year}`;
	} else { // Septembre ou après
		return `${year}-${year + 1}`;
	}
};

// Fonction pour générer des dates dynamiques basées sur l'année académique
const generateAcademicDates = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Déterminer l'année de début de l'année académique
	const academicStartYear = month < 8 ? year - 1 : year;

	return {
		rentree: `${academicStartYear}-09-16`,
		depotProgrammes: `${academicStartYear}-10-15`,
		miSession: `${academicStartYear}-11-20`,
		finSemestre1: `${academicStartYear + 1}-01-31`,
		debutSemestre2: `${academicStartYear + 1}-02-10`,
		examensFinaux: `${academicStartYear + 1}-06-15`,
		vacancesNoel: `${academicStartYear}-12-20`,
		vacancesPaques: `${academicStartYear + 1}-04-01`,
	};
};

const academicDates = generateAcademicDates();

// Données simulées pour le calendrier académique - à remplacer par API
const mockCalendarEvents = [
	{
		id: 1,
		title: "Fin du premier semestre",
		date: academicDates.finSemestre1,
		type: "academic",
		source: "MINESUP",
		color: "blue",
	},
	{
		id: 2,
		title: "Début du second semestre",
		date: academicDates.debutSemestre2,
		type: "academic",
		source: "MINESUP",
		color: "blue",
	},
	{
		id: 3,
		title: "Date limite révision des programmes",
		date: academicDates.depotProgrammes,
		type: "deadline",
		source: "MINESUP",
		color: "red",
	},
	{
		id: 4,
		title: "Examens finaux",
		date: academicDates.examensFinaux,
		type: "exam",
		source: "MINESUP",
		color: "orange",
	},
	{
		id: 5,
		title: "Congés de Pâques",
		date: academicDates.vacancesPaques,
		type: "holiday",
		source: "MINESUP",
		color: "green",
	},
];

// Équipe en ligne simulée
const mockOnlineUsers = [
	{ id: 1, name: "Dr. Kamga Jean", role: "Coordinateur", status: "online" },
	{ id: 2, name: "Prof. Mbarga Pierre", role: "Directeur", status: "online" },
	{ id: 3, name: "Mme. Fouda Marie", role: "Secrétaire", status: "away" },
];

// Types de notifications
type NotificationType = "validation" | "comment" | "document" | "system" | "calendar";

interface Notification {
	id: number;
	type: NotificationType;
	title: string;
	message: string;
	time: string;
	read: boolean;
	sender?: string;
	link?: string;
}

// Notifications simulées - à remplacer par API
const initialNotifications: Notification[] = [
	{
		id: 1,
		type: "validation",
		title: "Demande de validation",
		message: "Le programme Master IA de l'IPES Yaoundé attend votre approbation",
		time: "Il y a 5 min",
		read: false,
		sender: "Dr. Kamga Jean",
		link: "/dashboard/sections/universities/syllabus",
	},
	{
		id: 2,
		type: "comment",
		title: "Nouveau commentaire",
		message: "Prof. Mbarga a commenté sur le syllabus Licence Informatique",
		time: "Il y a 30 min",
		read: false,
		sender: "Prof. Mbarga Pierre",
	},
	{
		id: 3,
		type: "document",
		title: "Document partagé",
		message: "Un nouveau rapport a été partagé avec vous par le MINESUP",
		time: "Il y a 1h",
		read: false,
		sender: "MINESUP",
		link: "/dashboard/sections/reports",
	},
	{
		id: 4,
		type: "calendar",
		title: "Rappel d'événement",
		message: "Conseil d'établissement demain à 10h00",
		time: "Il y a 2h",
		read: true,
	},
	{
		id: 5,
		type: "system",
		title: "Mise à jour système",
		message: "De nouvelles fonctionnalités sont disponibles sur la plateforme",
		time: "Il y a 1 jour",
		read: true,
	},
	{
		id: 6,
		type: "validation",
		title: "Programme validé",
		message: "Votre programme de Licence Économie a été approuvé",
		time: "Il y a 2 jours",
		read: true,
		sender: "MINESUP",
	},
];

export function CollaborativeDashboard() {
	const { institution } = useInstitution();
	const [stats, setStats] = useState<DashboardStats>({
		universities_count: 0,
		ipes_count: 0,
		salles_count: 0,
		users_count: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [greeting, setGreeting] = useState("");
	const [documents, setDocuments] = useState<FileDocument[]>([]);
	const [documentsLoading, setDocumentsLoading] = useState(true);
	const [activeVisibility, setActiveVisibility] = useState<string>("all");

	// Notifications state
	const [notificationDrawerOpened, { open: openNotifications, close: closeNotifications }] = useDisclosure(false);
	const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

	// Computed values for notifications
	const unreadCount = notifications.filter((n) => !n.read).length;

	// Fetch documents
	const fetchDocuments = useCallback(async () => {
		setDocumentsLoading(true);
		try {
			const response = await fetch("/api/files");
			if (response.ok) {
				const data = await response.json();
				const formattedFiles = data.data?.map((item: any) => {
					const fileData = item.file || (item.files && item.files.length > 0 ? item.files[0] : null);
					return {
						id: item.id.toString(),
						title: item.title,
						description: item.description,
						size: fileData?.size || 0,
						type: determineFileType(fileData?.mime_type, fileData?.name),
						author: item.owner?.name || "Inconnu",
						uploadDate: item.created_at,
						visibility: determineVisibility(item.model?.type),
						url: fileData?.download_url || "",
					};
				}) || [];
				setDocuments(formattedFiles);
			}
		} catch (err) {
			console.error("Error fetching documents:", err);
		} finally {
			setDocumentsLoading(false);
		}
	}, []);

	const determineFileType = (mimeType: string, fileName: string): FileType => {
		if (!mimeType) return "other";
		if (mimeType.includes("pdf")) return "pdf";
		if (mimeType.includes("word") || mimeType.includes("docx")) return "word";
		if (mimeType.includes("excel") || mimeType.includes("xlsx")) return "excel";
		if (mimeType.includes("image")) return "image";
		return "other";
	};

	const determineVisibility = (modelType: string): ("CENADI" | "MINESUP" | "IPES")[] => {
		if (!modelType) return ["CENADI", "MINESUP", "IPES"];
		if (modelType.includes("Cenadi")) return ["CENADI"];
		if (modelType.includes("Minesup")) return ["MINESUP"];
		if (modelType.includes("Ipes")) return ["IPES"];
		return ["CENADI", "MINESUP", "IPES"];
	};

	useEffect(() => {
		const hour = new Date().getHours();
		if (hour < 12) setGreeting("Bonjour");
		else if (hour < 18) setGreeting("Bon après-midi");
		else setGreeting("Bonsoir");

		const fetchStats = async () => {
			try {
				const response = await fetch(innerUrl("/api/dashboard"));
				if (response.ok) {
					const data = await response.json();
					setStats(data);
				}
			} catch (err) {
				console.error("Error fetching dashboard stats:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
		fetchDocuments();
	}, [fetchDocuments]);

	// Filtrer les documents par visibilité
	const filteredDocuments = documents.filter((doc) => {
		if (activeVisibility === "all") return true;
		return doc.visibility.includes(activeVisibility as "CENADI" | "MINESUP" | "IPES");
	}).slice(0, 5); // Limiter à 5 documents

	// Compter les documents par visibilité
	const countByVisibility = {
		all: documents.length,
		CENADI: documents.filter((d) => d.visibility.includes("CENADI")).length,
		MINESUP: documents.filter((d) => d.visibility.includes("MINESUP")).length,
		IPES: documents.filter((d) => d.visibility.includes("IPES")).length,
	};

	const getFileIcon = (type: FileType) => {
		switch (type) {
			case "pdf":
				return <IconFileTypePdf size={20} />;
			case "word":
				return <IconFileTypeDoc size={20} />;
			case "excel":
				return <IconFileTypeXls size={20} />;
			case "image":
				return <IconPhoto size={20} />;
			default:
				return <IconFile size={20} />;
		}
	};

	const getFileColor = (type: FileType) => {
		switch (type) {
			case "pdf":
				return "red";
			case "word":
				return "blue";
			case "excel":
				return "green";
			case "image":
				return "violet";
			default:
				return "gray";
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
	};

	const getEventTypeLabel = (type: string) => {
		switch (type) {
			case "academic":
				return "Académique";
			case "deadline":
				return "Échéance";
			case "exam":
				return "Examen";
			case "meeting":
				return "Réunion";
			case "holiday":
				return "Congé";
			default:
				return "Événement";
		}
	};

	const formatEventDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) {
			return "Passé";
		} else if (diffDays === 0) {
			return "Aujourd'hui";
		} else if (diffDays === 1) {
			return "Demain";
		} else if (diffDays <= 7) {
			return `Dans ${diffDays} jours`;
		} else {
			return date.toLocaleDateString("fr-FR", {
				day: "numeric",
				month: "short",
			});
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "red";
			case "medium":
				return "yellow";
			case "low":
				return "green";
			default:
				return "gray";
		}
	};

	const getVisibilityIcon = (visibility: string) => {
		switch (visibility) {
			case "CENADI":
				return <IconShield size={14} />;
			case "MINESUP":
				return <IconBuildingSkyscraper size={14} />;
			case "IPES":
				return <IconBuilding size={14} />;
			default:
				return <IconFile size={14} />;
		}
	};

	// Notification functions
	const getNotificationIcon = (type: NotificationType) => {
		switch (type) {
			case "validation":
				return <IconFileCheck size={20} />;
			case "comment":
				return <IconMessage size={20} />;
			case "document":
				return <IconFileDescription size={20} />;
			case "calendar":
				return <IconCalendarEvent size={20} />;
			case "system":
				return <IconInfoCircle size={20} />;
			default:
				return <IconBell size={20} />;
		}
	};

	const getNotificationColor = (type: NotificationType) => {
		switch (type) {
			case "validation":
				return "green";
			case "comment":
				return "blue";
			case "document":
				return "violet";
			case "calendar":
				return "orange";
			case "system":
				return "gray";
			default:
				return "gray";
		}
	};

	const markAsRead = (id: number) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n))
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	const deleteNotification = (id: number) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const clearAllNotifications = () => {
		setNotifications([]);
	};

	return (
		<div className={classes.container}>
			{/* Header Section */}
			<div className={classes.header}>
				<div className={classes.headerContent}>
					<div className={classes.greeting}>
						<Text className={classes.greetingText}>
							{greeting}, <span className={classes.userName}>Administrateur</span>
						</Text>
						<Text className={classes.greetingSubtext}>
							Voici un aperçu de votre espace de travail
						</Text>
					</div>
					<Group gap="sm">
						<Tooltip label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}>
							<Indicator processing color="red" size={8} disabled={unreadCount === 0}>
								<ActionIcon
									variant="light"
									size="lg"
									radius="xl"
									className={classes.headerAction}
									onClick={openNotifications}
								>
									<IconBell size={20} />
								</ActionIcon>
							</Indicator>
						</Tooltip>
						<ActionIcon
							variant="light"
							size="lg"
							radius="xl"
							className={classes.headerAction}
						>
							<IconSettings size={20} />
						</ActionIcon>
					</Group>
				</div>
			</div>

			{/* Stats Cards */}
			<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" className={classes.statsGrid}>
				<Card className={classes.statCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.statLabel}>Universités</Text>
							<Text className={classes.statValue}>
								{isLoading ? "..." : stats.universities_count}
							</Text>
						</div>
						<ThemeIcon size={48} radius="xl" variant="light" color="blue">
							<IconSchool size={24} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card className={classes.statCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.statLabel}>IPES</Text>
							<Text className={classes.statValue}>
								{isLoading ? "..." : stats.ipes_count}
							</Text>
						</div>
						<ThemeIcon size={48} radius="xl" variant="light" color="teal">
							<IconBuildingCommunity size={24} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card className={classes.statCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.statLabel}>Programmes</Text>
							<Text className={classes.statValue}>
								{isLoading ? "..." : stats.salles_count ?? 0}
							</Text>
						</div>
						<ThemeIcon size={48} radius="xl" variant="light" color="violet">
							<IconBook size={24} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card className={classes.statCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.statLabel}>Utilisateurs</Text>
							<Text className={classes.statValue}>
								{isLoading ? "..." : stats.users_count}
							</Text>
						</div>
						<ThemeIcon size={48} radius="xl" variant="light" color="orange">
							<IconUsers size={24} />
						</ThemeIcon>
					</Group>
				</Card>
			</SimpleGrid>

			{/* Main Content */}
			<Grid gutter="lg">
				{/* Left Column - Documents & Tasks */}
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<Stack gap="lg">
						{/* Documents Widget with Visibility Tabs */}
						<Card className={classes.card} padding="lg" radius="lg">
							<Group justify="space-between" mb="md">
								<Group gap="xs">
									<ThemeIcon size={32} radius="xl" color="blue" variant="light">
										<IconFileDescription size={18} />
									</ThemeIcon>
									<div>
										<Text fw={600} size="lg">
											Documents récents
										</Text>
										<Text size="xs" c="dimmed">
											Filtrer par destinataire
										</Text>
									</div>
								</Group>
								<Button
									variant="subtle"
									size="xs"
									rightSection={<IconChevronRight size={14} />}
									component="a"
									href="/dashboard/sections/reports"
								>
									Tous les documents
								</Button>
							</Group>

							{/* Visibility Tabs */}
							<Tabs
								value={activeVisibility}
								onChange={(value) => setActiveVisibility(value || "all")}
								variant="pills"
								radius="xl"
								className={classes.visibilityTabs}
							>
								<Tabs.List mb="md">
									<Tabs.Tab value="all" leftSection={<IconFile size={14} />}>
										Tous ({countByVisibility.all})
									</Tabs.Tab>
									<Tabs.Tab value="CENADI" leftSection={<IconShield size={14} />}>
										CENADI ({countByVisibility.CENADI})
									</Tabs.Tab>
									<Tabs.Tab value="MINESUP" leftSection={<IconBuildingSkyscraper size={14} />}>
										MINESUP ({countByVisibility.MINESUP})
									</Tabs.Tab>
									<Tabs.Tab value="IPES" leftSection={<IconBuilding size={14} />}>
										IPES ({countByVisibility.IPES})
									</Tabs.Tab>
								</Tabs.List>
							</Tabs>

							{/* Documents List */}
							{documentsLoading ? (
								<Stack gap="sm">
									{[1, 2, 3].map((i) => (
										<Skeleton key={i} height={60} radius="md" />
									))}
								</Stack>
							) : filteredDocuments.length === 0 ? (
								<Box py="xl" ta="center">
									<ThemeIcon size={48} radius="xl" variant="light" color="gray" mx="auto" mb="sm">
										<IconFileDescription size={24} />
									</ThemeIcon>
									<Text c="dimmed" size="sm">
										Aucun document pour cette catégorie
									</Text>
								</Box>
							) : (
								<Stack gap="sm">
									{filteredDocuments.map((doc) => (
										<Card
											key={doc.id}
											className={classes.documentCard}
											padding="sm"
											radius="md"
										>
											<Group justify="space-between" wrap="nowrap">
												<Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
													<ThemeIcon
														size={40}
														radius="md"
														variant="light"
														color={getFileColor(doc.type)}
													>
														{getFileIcon(doc.type)}
													</ThemeIcon>
													<div style={{ flex: 1, minWidth: 0 }}>
														<Text fw={500} size="sm" truncate>
															{doc.title}
														</Text>
														<Group gap="xs">
															<Text size="xs" c="dimmed">
																{doc.author}
															</Text>
															<Text size="xs" c="dimmed">
																•
															</Text>
															<Text size="xs" c="dimmed">
																{formatFileSize(doc.size)}
															</Text>
															<Text size="xs" c="dimmed">
																•
															</Text>
															<Text size="xs" c="dimmed">
																{formatDate(doc.uploadDate)}
															</Text>
														</Group>
													</div>
												</Group>
												<Group gap={4} wrap="nowrap">
													{doc.visibility.map((v) => (
														<Tooltip key={v} label={v}>
															<Badge
																size="xs"
																variant="light"
																color={
																	v === "CENADI"
																		? "red"
																		: v === "MINESUP"
																		? "blue"
																		: "green"
																}
															>
																{v}
															</Badge>
														</Tooltip>
													))}
													<ActionIcon variant="subtle" size="sm" ml="xs">
														<IconDownload size={14} />
													</ActionIcon>
												</Group>
											</Group>
										</Card>
									))}
								</Stack>
							)}

							<Button
								fullWidth
								variant="light"
								mt="md"
								leftSection={<IconFileUpload size={16} />}
								component="a"
								href="/dashboard/sections/reports"
							>
								Uploader un document
							</Button>
						</Card>

						{/* Academic Calendar */}
						<Card className={classes.card} padding="lg" radius="lg">
							<Group justify="space-between" mb="md">
								<Group gap="xs">
									<ThemeIcon size={32} radius="xl" color="violet" variant="light">
										<IconCalendar size={18} />
									</ThemeIcon>
									<div>
										<Group gap="xs" align="center">
											<Text fw={600} size="lg">
												Calendrier académique
											</Text>
											<Badge size="sm" variant="filled" color="violet">
												{getAcademicYear()}
											</Badge>
										</Group>
										<Text size="xs" c="dimmed">
											Événements à venir
										</Text>
									</div>
								</Group>
								<Button
									variant="subtle"
									size="xs"
									rightSection={<IconChevronRight size={14} />}
								>
									Voir tout
								</Button>
							</Group>

							<Stack gap="sm">
								{mockCalendarEvents
									.filter((event) => new Date(event.date) >= new Date())
									.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
									.slice(0, 4)
									.map((event) => (
									<Card
										key={event.id}
										className={classes.calendarCard}
										padding="sm"
										radius="md"
									>
										<Group justify="space-between" wrap="nowrap">
											<Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
												<Box
													className={classes.calendarDateBox}
													style={{
														borderColor: `var(--mantine-color-${event.color}-5)`,
													}}
												>
													<Text size="xs" fw={700} c={event.color}>
														{new Date(event.date).toLocaleDateString("fr-FR", {
															day: "numeric",
														})}
													</Text>
													<Text size="xs" c="dimmed" tt="uppercase">
														{new Date(event.date).toLocaleDateString("fr-FR", {
															month: "short",
														})}
													</Text>
												</Box>
												<div style={{ flex: 1, minWidth: 0 }}>
													<Text fw={500} size="sm" truncate>
														{event.title}
													</Text>
													<Group gap={4}>
														<Badge size="xs" variant="light" color={event.color}>
															{getEventTypeLabel(event.type)}
														</Badge>
														<Text size="xs" c="dimmed">
															{event.source}
														</Text>
													</Group>
												</div>
											</Group>
											<Badge
												size="sm"
												variant="outline"
												color={event.color}
											>
												{formatEventDate(event.date)}
											</Badge>
										</Group>
									</Card>
								))}
							</Stack>

							<Button
								fullWidth
								variant="light"
								mt="md"
								leftSection={<IconCalendarEvent size={16} />}
								color="violet"
							>
								Ajouter un événement
							</Button>
						</Card>

						{/* Quick Actions */}
						<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
							<Card
								className={classes.quickActionCard}
								padding="md"
								radius="lg"
								component="a"
								href="/dashboard/sections/ues/list"
							>
								<ThemeIcon size={40} radius="xl" color="blue" variant="light" mb="sm">
									<IconBook size={20} />
								</ThemeIcon>
								<Text fw={500} size="sm">
									Gérer les UEs
								</Text>
								<Text size="xs" c="dimmed">
									Ajouter ou modifier
								</Text>
							</Card>

							<Card
								className={classes.quickActionCard}
								padding="md"
								radius="lg"
								component="a"
								href="/dashboard/sections/universities/syllabus"
							>
								<ThemeIcon size={40} radius="xl" color="teal" variant="light" mb="sm">
									<IconFileDescription size={20} />
								</ThemeIcon>
								<Text fw={500} size="sm">
									Programmes
								</Text>
								<Text size="xs" c="dimmed">
									Consulter les syllabus
								</Text>
							</Card>

							<Card
								className={classes.quickActionCard}
								padding="md"
								radius="lg"
								component="a"
								href="/dashboard/sections/crosscompare"
							>
								<ThemeIcon size={40} radius="xl" color="violet" variant="light" mb="sm">
									<IconGitPullRequest size={20} />
								</ThemeIcon>
								<Text fw={500} size="sm">
									Comparer
								</Text>
								<Text size="xs" c="dimmed">
									Analyser les différences
								</Text>
							</Card>

							<Card
								className={classes.quickActionCard}
								padding="md"
								radius="lg"
								component="a"
								href="/dashboard/sections/reports"
							>
								<ThemeIcon size={40} radius="xl" color="orange" variant="light" mb="sm">
									<IconFileUpload size={20} />
								</ThemeIcon>
								<Text fw={500} size="sm">
									Documents
								</Text>
								<Text size="xs" c="dimmed">
									Partager des fichiers
								</Text>
							</Card>
						</SimpleGrid>
					</Stack>
				</Grid.Col>

				{/* Right Column - Team & Activity */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<Stack gap="lg">
						{/* Team Online */}
						<Card className={classes.card} padding="lg" radius="lg">
							<Group justify="space-between" mb="md">
								<Group gap="xs">
									<ThemeIcon size={32} radius="xl" color="green" variant="light">
										<IconUsers size={18} />
									</ThemeIcon>
									<div>
										<Text fw={600} size="lg">
											Équipe en ligne
										</Text>
										<Text size="xs" c="dimmed">
											{mockOnlineUsers.filter((u) => u.status === "online").length} actifs
										</Text>
									</div>
								</Group>
							</Group>

							<Stack gap="sm">
								{mockOnlineUsers.map((user) => (
									<Group key={user.id} justify="space-between">
										<Group gap="sm">
											<Indicator
												color={user.status === "online" ? "green" : "yellow"}
												size={10}
												offset={4}
												position="bottom-end"
												withBorder
											>
												<Avatar size={38} radius="xl" color="blue">
													{user.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.slice(0, 2)}
												</Avatar>
											</Indicator>
											<div>
												<Text size="sm" fw={500}>
													{user.name}
												</Text>
												<Text size="xs" c="dimmed">
													{user.role}
												</Text>
											</div>
										</Group>
										<ActionIcon variant="subtle" size="sm">
											<IconMessageCircle size={16} />
										</ActionIcon>
									</Group>
								))}
							</Stack>

							<Button
								fullWidth
								variant="light"
								mt="md"
								leftSection={<IconUserPlus size={16} />}
							>
								Inviter un membre
							</Button>
						</Card>

						{/* Pending Tasks */}
						<Card className={classes.card} padding="lg" radius="lg">
							<Group justify="space-between" mb="md">
								<Group gap="xs">
									<ThemeIcon size={32} radius="xl" color="red" variant="light">
										<IconClipboardCheck size={18} />
									</ThemeIcon>
									<div>
										<Text fw={600} size="lg">
											Tâches en attente
										</Text>
										<Text size="xs" c="dimmed">
											{mockPendingTasks.length} actions requises
										</Text>
									</div>
								</Group>
							</Group>

							<Stack gap="xs">
								{mockPendingTasks.map((task) => (
									<Card
										key={task.id}
										className={classes.taskCard}
										padding="xs"
										radius="md"
									>
										<Group justify="space-between" wrap="nowrap">
											<Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
												<ThemeIcon
													size={28}
													radius="md"
													variant="light"
													color={getPriorityColor(task.priority)}
												>
													{task.type === "validation" ? (
														<IconCheckbox size={14} />
													) : task.type === "revision" ? (
														<IconEdit size={14} />
													) : (
														<IconCircleCheck size={14} />
													)}
												</ThemeIcon>
												<div style={{ flex: 1, minWidth: 0 }}>
													<Text fw={500} size="xs" truncate>
														{task.title}
													</Text>
													<Text size="xs" c="dimmed">
														{task.institution}
													</Text>
												</div>
											</Group>
											<Badge
												size="xs"
												variant="light"
												color={getPriorityColor(task.priority)}
											>
												{task.dueDate}
											</Badge>
										</Group>
									</Card>
								))}
							</Stack>

							<Button
								fullWidth
								variant="subtle"
								mt="md"
								size="xs"
								rightSection={<IconChevronRight size={14} />}
							>
								Voir toutes les tâches
							</Button>
						</Card>
					</Stack>
				</Grid.Col>
			</Grid>

			{/* Notifications Drawer */}
			<Drawer
				opened={notificationDrawerOpened}
				onClose={closeNotifications}
				title={
					<Group justify="space-between" w="100%">
						<Group gap="xs">
							<IconBell size={20} />
							<Text fw={600}>Notifications</Text>
							{unreadCount > 0 && (
								<Badge size="sm" color="red" variant="filled">
									{unreadCount}
								</Badge>
							)}
						</Group>
					</Group>
				}
				position="right"
				size="md"
				padding="md"
				className={classes.notificationDrawer}
			>
				{/* Header Actions */}
				<Group justify="space-between" mb="md">
					<Button
						variant="subtle"
						size="xs"
						onClick={markAllAsRead}
						disabled={unreadCount === 0}
						leftSection={<IconCheck size={14} />}
					>
						Tout marquer comme lu
					</Button>
					<Menu position="bottom-end" withArrow>
						<Menu.Target>
							<ActionIcon variant="subtle" size="sm">
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								color="red"
								onClick={clearAllNotifications}
							>
								Supprimer toutes les notifications
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>

				<Divider mb="md" />

				{/* Notifications List */}
				<ScrollArea h="calc(100vh - 180px)" offsetScrollbars>
					{notifications.length === 0 ? (
						<Box py="xl" ta="center">
							<ThemeIcon size={64} radius="xl" variant="light" color="gray" mx="auto" mb="md">
								<IconBell size={32} />
							</ThemeIcon>
							<Text fw={500} size="lg" mb="xs">
								Aucune notification
							</Text>
							<Text c="dimmed" size="sm">
								Vous n'avez pas de nouvelles notifications
							</Text>
						</Box>
					) : (
						<Stack gap="xs">
							{notifications.map((notification) => (
								<Card
									key={notification.id}
									className={`${classes.notificationItem} ${
										!notification.read ? classes.unreadNotification : ""
									}`}
									padding="sm"
									radius="md"
									onClick={() => markAsRead(notification.id)}
								>
									<Group justify="space-between" wrap="nowrap" align="flex-start">
										<Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
											<ThemeIcon
												size={40}
												radius="xl"
												variant="light"
												color={getNotificationColor(notification.type)}
											>
												{getNotificationIcon(notification.type)}
											</ThemeIcon>
											<div style={{ flex: 1, minWidth: 0 }}>
												<Group justify="space-between" wrap="nowrap" mb={2}>
													<Text fw={notification.read ? 500 : 600} size="sm" truncate>
														{notification.title}
													</Text>
													<Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
														{notification.time}
													</Text>
												</Group>
												<Text size="xs" c="dimmed" lineClamp={2}>
													{notification.message}
												</Text>
												{notification.sender && (
													<Text size="xs" c={getNotificationColor(notification.type)} mt={4}>
														{notification.sender}
													</Text>
												)}
											</div>
										</Group>
										<ActionIcon
											variant="subtle"
											size="sm"
											color="gray"
											onClick={(e) => {
												e.stopPropagation();
												deleteNotification(notification.id);
											}}
										>
											<IconX size={14} />
										</ActionIcon>
									</Group>
								</Card>
							))}
						</Stack>
					)}
				</ScrollArea>
			</Drawer>
		</div>
	);
}
