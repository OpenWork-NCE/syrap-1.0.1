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
	useMantineTheme,
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
	IconTrendingUp,
	IconArrowUpRight,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { innerUrl } from "@/app/lib/utils";
import { useInstitution } from "@/app/context/SessionContext";
import { FileDocument, FileType, AppNotification, NotificationsResponse, NotificationType, UnreadCountResponse } from "@/types";
import { PATH_SECTIONS } from "@/routes";
import Link from "next/link";
import classes from "./CollaborativeDashboard.module.css";

interface DashboardStats {
	universities_count: number;
	ipes_count: number;
	salles_count?: number;
	users_count: number;
}


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


// Formatage relatif des dates de notification
const formatRelativeTime = (dateStr: string): string => {
	const now = new Date();
	const date = new Date(dateStr);
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMin < 1) return "À l'instant";
	if (diffMin < 60) return `Il y a ${diffMin} min`;
	if (diffHours < 24) return `Il y a ${diffHours}h`;
	if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
	return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};


export function CollaborativeDashboard() {
	const { institution } = useInstitution();
	const theme = useMantineTheme();
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
	const queryClient = useQueryClient();

	// Fetch notifications (paginées, polling 60s)
	const { data: notificationsData } = useQuery<NotificationsResponse>({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await fetch("/api/notifications?per_page=20");
			if (!res.ok) return { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } };
			return res.json();
		},
		refetchInterval: 60000,
		refetchOnWindowFocus: true,
	});

	// Fetch unread count (polling 30s - plus fréquent, requête légère)
	const { data: unreadData } = useQuery<{ unread_count: number }>({
		queryKey: ["notifications-unread-count"],
		queryFn: async () => {
			const res = await fetch("/api/notifications/unread-count");
			if (!res.ok) return { unread_count: 0 };
			return res.json();
		},
		refetchInterval: 30000,
		refetchOnWindowFocus: true,
	});

	const notifications = notificationsData?.data ?? [];
	const unreadCount = unreadData?.unread_count ?? 0;

	// Mutation: marquer une notification comme lue
	const markAsReadMutation = useMutation({
		mutationFn: async (id: string) => {
			await fetch(`/api/notifications/${id}/read`, { method: "POST" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
		},
	});

	// Mutation: marquer toutes comme lues
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			await fetch("/api/notifications/read-all", { method: "POST" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
		},
	});

	// Mutation: supprimer une notification
	const deleteNotificationMutation = useMutation({
		mutationFn: async (id: string) => {
			await fetch(`/api/notifications/${id}`, { method: "DELETE" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
		},
	});

	// Style dynamique pour le header basé sur le thème de l'organisation
	const primaryColor = theme.primaryColor;
	const headerGradientStyle = {
		background: `linear-gradient(135deg, ${theme.colors[primaryColor][6]} 0%, ${theme.colors[primaryColor][7]} 50%, ${theme.colors[primaryColor][8]} 100%)`,
	};

	// Upcoming events count for header summary
	const upcomingEventsCount = mockCalendarEvents.filter(
		(e) => new Date(e.date) >= new Date()
	).length;

	// Fetch unread messages count (polling 60s)
	const { data: unreadMessagesData } = useQuery<UnreadCountResponse>({
		queryKey: ["unread-count"],
		queryFn: async () => {
			const res = await fetch("/api/messages/unread-count");
			if (!res.ok) return { unread_count: 0 };
			return res.json();
		},
		refetchInterval: 60000,
		refetchOnWindowFocus: true,
	});

	const unreadMessagesCount = unreadMessagesData?.unread_count ?? 0;

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
			return date.toLocaleDateString("fr-FR", {
				day: "numeric",
				month: "short",
			});
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

	const markAsRead = (id: string) => {
		markAsReadMutation.mutate(id);
	};

	const markAllAsRead = () => {
		markAllAsReadMutation.mutate();
	};

	const deleteNotification = (id: string) => {
		deleteNotificationMutation.mutate(id);
	};

	// Calendar events sorted chronologically
	const upcomingEvents = [...mockCalendarEvents]
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(0, 5);

	return (
		<div className={classes.container}>
			{/* Header Section */}
			<div className={classes.header} style={headerGradientStyle}>
				<div className={classes.headerContent}>
					<div className={classes.greeting}>
						<Text className={classes.greetingText}>
							{greeting}, <span className={classes.userName}>Administrateur</span>
						</Text>
					</div>
					<Group gap="sm">
						<Tooltip label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}>
							<Indicator label={unreadCount > 0 ? unreadCount : undefined} color="red" size={18} disabled={unreadCount === 0} offset={4}>
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
						<Tooltip label={unreadMessagesCount > 0 ? `${unreadMessagesCount} message${unreadMessagesCount > 1 ? "s" : ""} non lu${unreadMessagesCount > 1 ? "s" : ""}` : "Messagerie"}>
							<Indicator label={unreadMessagesCount > 0 ? unreadMessagesCount : undefined} color="blue" size={18} disabled={unreadMessagesCount === 0} offset={4}>
								<ActionIcon
									component={Link}
									href={PATH_SECTIONS.messages}
									variant="light"
									size="lg"
									radius="xl"
									className={classes.headerAction}
								>
									<IconMessageCircle size={20} />
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
			<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" className={classes.statsGrid}>
				{[
					{
						label: "Universités",
						value: stats.universities_count,
						icon: <IconSchool size={22} />,
					},
					{
						label: "IPES",
						value: stats.ipes_count,
						icon: <IconBuildingCommunity size={22} />,
					},
					{
						label: "Programmes",
						value: stats.salles_count ?? 0,
						icon: <IconBook size={22} />,
					},
					{
						label: "Utilisateurs",
						value: stats.users_count,
						icon: <IconUsers size={22} />,
					},
				].map((stat, index) => (
					<Card key={index} className={classes.statCard} padding="lg" radius="md">
						<Group justify="space-between" align="flex-start">
							<div>
								<Text className={classes.statLabel}>{stat.label}</Text>
								<Text className={classes.statValue}>
									{isLoading ? "—" : stat.value}
								</Text>
							</div>
							<ThemeIcon size={44} radius="md" variant="light" color={primaryColor}>
								{stat.icon}
							</ThemeIcon>
						</Group>
					</Card>
				))}
			</SimpleGrid>

			{/* Main Content */}
			<Grid gutter="md">
				{/* Documents Widget */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card className={classes.card} padding="lg" radius="md" h="100%">
							<Group justify="space-between" mb="md">
								<div className={classes.sectionHeader}>
									<ThemeIcon size={32} radius="md" color={primaryColor} variant="light">
										<IconFileDescription size={18} />
									</ThemeIcon>
									<div>
										<Text className={classes.sectionTitle}>Documents récents</Text>
										<Text className={classes.sectionSubtitle}>Filtrer par destinataire</Text>
									</div>
								</div>
								<Button
									variant="subtle"
									size="xs"
									color="gray"
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
								color={primaryColor}
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
										<Skeleton key={i} height={56} radius="md" />
									))}
								</Stack>
							) : filteredDocuments.length === 0 ? (
								<div className={classes.emptyState}>
									<div className={classes.emptyStateIcon}>
										<IconFileDescription size={24} color="var(--mantine-color-dimmed)" />
									</div>
									<Text className={classes.emptyStateTitle}>
										Aucun document pour cette catégorie
									</Text>
									<Text className={classes.emptyStateText}>
										Les documents partagés avec votre organisation apparaîtront ici
									</Text>
								</div>
							) : (
								<Stack gap="xs">
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
														size={38}
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
																&middot;
															</Text>
															<Text size="xs" c="dimmed">
																{formatFileSize(doc.size)}
															</Text>
															<Text size="xs" c="dimmed">
																&middot;
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
															<Badge size="xs" variant="light" color="gray">
																{v}
															</Badge>
														</Tooltip>
													))}
													<ActionIcon variant="subtle" size="sm" color="gray" ml="xs">
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
								color={primaryColor}
								leftSection={<IconFileUpload size={16} />}
								component="a"
								href="/dashboard/sections/reports"
							>
								Uploader un document
							</Button>
					</Card>
				</Grid.Col>

				{/* Academic Calendar */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card className={classes.card} padding="lg" radius="md" h="100%">
						<Group justify="space-between" mb="lg">
								<div className={classes.sectionHeader}>
									<ThemeIcon size={32} radius="md" color={primaryColor} variant="light">
										<IconCalendar size={18} />
									</ThemeIcon>
									<div>
										<Group gap="xs" align="center">
											<Text className={classes.sectionTitle}>Calendrier académique</Text>
											<Badge size="sm" variant="light" color={primaryColor}>
												{getAcademicYear()}
											</Badge>
										</Group>
										<Text className={classes.sectionSubtitle}>
											{upcomingEvents.length} événements
										</Text>
									</div>
								</div>
								<Button
									variant="subtle"
									size="xs"
									color="gray"
									rightSection={<IconChevronRight size={14} />}
								>
									Voir tout
								</Button>
							</Group>

							{/* Timeline */}
							<div className={classes.timelineContainer}>
								<div
									className={classes.timelineLine}
									style={{ background: `var(--mantine-color-${primaryColor}-2)` }}
								/>
								<Stack gap="sm">
									{upcomingEvents.map((event) => (
										<div key={event.id} className={classes.timelineItem}>
											<div
												className={classes.timelineDot}
												style={{
													borderColor: `var(--mantine-color-${event.color}-5)`,
												}}
											/>
											<Group justify="space-between" wrap="nowrap">
												<div style={{ flex: 1, minWidth: 0 }}>
													<Text fw={500} size="sm" truncate>
														{event.title}
													</Text>
													<Group gap={6} mt={2}>
														<Badge size="xs" variant="light" color={event.color}>
															{getEventTypeLabel(event.type)}
														</Badge>
														<Text size="xs" c="dimmed">
															{event.source}
														</Text>
													</Group>
												</div>
												<Badge size="sm" variant="outline" color="gray">
													{formatEventDate(event.date)}
												</Badge>
											</Group>
										</div>
									))}
								</Stack>
							</div>

							<Button
								fullWidth
								variant="light"
								mt="lg"
								color={primaryColor}
								leftSection={<IconCalendarEvent size={16} />}
							>
								Ajouter un événement
							</Button>
					</Card>
				</Grid.Col>

				{/* Quick Actions */}
				<Grid.Col span={12}>
					<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
							{[
								{
									icon: <IconBook size={20} />,
									title: "Gérer les UEs",
									subtitle: "Ajouter ou modifier",
									href: "/dashboard/sections/ues/list",
								},
								{
									icon: <IconFileDescription size={20} />,
									title: "Programmes",
									subtitle: "Consulter les syllabus",
									href: "/dashboard/sections/universities/syllabus",
								},
								{
									icon: <IconGitPullRequest size={20} />,
									title: "Comparer",
									subtitle: "Analyser les différences",
									href: "/dashboard/sections/crosscompare",
								},
								{
									icon: <IconFileUpload size={20} />,
									title: "Documents",
									subtitle: "Partager des fichiers",
									href: "/dashboard/sections/reports",
								},
							].map((action, index) => (
								<Card
									key={index}
									className={classes.quickActionCard}
									padding="md"
									radius="md"
									component="a"
									href={action.href}
									style={{
										["--action-color" as any]: `var(--mantine-color-${primaryColor}-6)`,
									}}
								>
									<div
										className={classes.quickActionCard}
										style={{ all: "unset", display: "block", textAlign: "center" }}
									>
										<ThemeIcon size={40} radius="md" color={primaryColor} variant="light" mb="sm" mx="auto">
											{action.icon}
										</ThemeIcon>
										<Text fw={500} size="sm">
											{action.title}
										</Text>
										<Text size="xs" c="dimmed" mt={2}>
											{action.subtitle}
										</Text>
									</div>
									<Box
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											height: 3,
											background: `var(--mantine-color-${primaryColor}-5)`,
											opacity: 0,
											transition: "opacity 0.15s ease",
										}}
									/>
								</Card>
							))}
						</SimpleGrid>
				</Grid.Col>
			</Grid>

			{/* Notifications Drawer */}
			<Drawer
				opened={notificationDrawerOpened}
				onClose={() => {
					closeNotifications();
					if (unreadCount > 0) {
						markAllAsRead();
					}
				}}
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
								onClick={() => {
									// Supprimer toutes les notifications une par une
									notifications.forEach((n) => deleteNotification(n.id));
								}}
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
														{formatRelativeTime(notification.created_at)}
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
