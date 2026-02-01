"use client";

import { useState, useMemo } from "react";
import {
	Container,
	Stack,
	Paper,
	Group,
	Title,
	Text,
	Button,
	Select,
	Badge,
	ActionIcon,
	Tooltip,
	Modal,
	TextInput,
	Textarea,
	Switch,
	MultiSelect,
	Grid,
	ThemeIcon,
	Divider,
	Box,
	ScrollArea,
	Alert,
	rem,
	UnstyledButton,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import {
	IconCalendar,
	IconCalendarEvent,
	IconList,
	IconPlus,
	IconFilter,
	IconChevronLeft,
	IconChevronRight,
	IconEdit,
	IconTrash,
	IconClock,
	IconMapPin,
	IconUsers,
	IconRefresh,
	IconAlertCircle,
	IconCheck,
	IconRepeat,
	IconBell,
	IconSchool,
	IconBuildingSkyscraper,
	IconLayoutGrid,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	isSameMonth,
	addMonths,
	subMonths,
	isToday,
	isPast,
	parseISO,
	differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import PageHeader from "@/components/PageHeader/PageHeader";
import type {
	CalendarEvent,
	CalendarEventFormData,
	EventType,
	EventVisibility,
} from "@/types/calendar";
import {
	EVENT_TYPES,
	EVENT_VISIBILITY,
	getEventTypeColor,
	getEventTypeLabel,
} from "@/types/calendar";

// ===== MOCK DATA =====
const generateMockEvents = (): CalendarEvent[] => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const academicStartYear = month < 8 ? year - 1 : year;

	return [
		{
			id: "1",
			title: "Rentrée académique",
			description: "Début de l'année académique pour tous les établissements",
			start_date: `${academicStartYear}-09-16`,
			all_day: true,
			type: "academic",
			color: "blue",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "2",
			title: "Date limite dépôt des programmes",
			description: "Les IPES doivent soumettre leurs programmes pour validation",
			start_date: `${academicStartYear}-10-15`,
			all_day: true,
			type: "deadline",
			color: "red",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			reminder_days: 7,
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "3",
			title: "Examens mi-session",
			description: "Période des examens de mi-session",
			start_date: `${academicStartYear}-11-20`,
			end_date: `${academicStartYear}-11-30`,
			all_day: true,
			type: "exam",
			color: "orange",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "4",
			title: "Congés de Noël",
			description: "Vacances de fin d'année",
			start_date: `${academicStartYear}-12-20`,
			end_date: `${academicStartYear + 1}-01-05`,
			all_day: true,
			type: "holiday",
			color: "teal",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "5",
			title: "Fin du premier semestre",
			description: "Clôture des cours du premier semestre",
			start_date: `${academicStartYear + 1}-01-31`,
			all_day: true,
			type: "academic",
			color: "blue",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "6",
			title: "Début du second semestre",
			description: "Reprise des cours pour le second semestre",
			start_date: `${academicStartYear + 1}-02-10`,
			all_day: true,
			type: "academic",
			color: "blue",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "7",
			title: "Réunion de coordination CENADI",
			description: "Réunion mensuelle de coordination avec les chargés d'études",
			start_date: `${year}-${String(month + 1).padStart(2, "0")}-15T10:00:00`,
			end_date: `${year}-${String(month + 1).padStart(2, "0")}-15T12:00:00`,
			all_day: false,
			type: "meeting",
			color: "violet",
			source: "CENADI",
			source_name: "Centre National de Développement de l'Informatique",
			visibility: ["cenadi", "minesup"],
			recurrence: "none",
			created_by: { id: "2", name: "Dr. Kamga Jean" },
			created_at: "2024-01-15",
		},
		{
			id: "8",
			title: "Validation programmes Licence Informatique",
			description: "Session de validation des programmes de Licence Informatique",
			start_date: `${year}-${String(month + 1).padStart(2, "0")}-20`,
			all_day: true,
			type: "validation",
			color: "green",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "none",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-20",
		},
		{
			id: "9",
			title: "Journée portes ouvertes IPES Yaoundé",
			description: "Journée de présentation des formations aux futurs étudiants",
			start_date: `${year}-${String(month + 1).padStart(2, "0")}-25`,
			all_day: true,
			type: "academic",
			color: "blue",
			source: "IPES",
			source_name: "IPES Yaoundé",
			source_id: "ipes-1",
			visibility: ["ipes"],
			recurrence: "none",
			created_by: { id: "3", name: "Directeur IPES Yaoundé" },
			created_at: "2024-02-01",
		},
		{
			id: "10",
			title: "Congés de Pâques",
			description: "Vacances de Pâques",
			start_date: `${academicStartYear + 1}-04-01`,
			end_date: `${academicStartYear + 1}-04-15`,
			all_day: true,
			type: "holiday",
			color: "teal",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "11",
			title: "Examens finaux",
			description: "Période des examens de fin d'année",
			start_date: `${academicStartYear + 1}-06-15`,
			end_date: `${academicStartYear + 1}-06-30`,
			all_day: true,
			type: "exam",
			color: "orange",
			source: "MINESUP",
			source_name: "Ministère de l'Enseignement Supérieur",
			visibility: ["all"],
			recurrence: "yearly",
			created_by: { id: "1", name: "MINESUP" },
			created_at: "2024-01-01",
		},
		{
			id: "12",
			title: "Date limite rapprochement programmes",
			description: "Dernier délai pour soumettre les rapports de rapprochement",
			start_date: `${year}-${String(month + 1).padStart(2, "0")}-28`,
			all_day: true,
			type: "deadline",
			color: "red",
			source: "CENADI",
			source_name: "Centre National de Développement de l'Informatique",
			visibility: ["all"],
			recurrence: "none",
			reminder_days: 3,
			created_by: { id: "2", name: "CENADI" },
			created_at: "2024-02-01",
		},
	];
};

const MOCK_EVENTS = generateMockEvents();
const USE_MOCK_DATA = true;
// ===== END MOCK DATA =====

const breadcrumbItems = [{ title: "Calendrier", href: "#" }];

type ViewMode = "list" | "calendar";

// Source icon mapping
const getSourceIcon = (source: string) => {
	switch (source) {
		case "MINESUP":
			return IconBuildingSkyscraper;
		case "CENADI":
			return IconSchool;
		case "IPES":
			return IconSchool;
		default:
			return IconCalendarEvent;
	}
};

export function CalendarPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [sourceFilter, setSourceFilter] = useState<string | null>(null);
	const [showPastEvents, setShowPastEvents] = useState<boolean>(false);
	const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);

	// Modal states
	const [eventModalOpened, { open: openEventModal, close: closeEventModal }] = useDisclosure(false);
	const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
	const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

	// Form state
	const [formData, setFormData] = useState<CalendarEventFormData>({
		title: "",
		description: "",
		start_date: null,
		end_date: null,
		all_day: true,
		type: "academic",
		visibility: ["all"],
		recurrence: "none",
	});

	// Filter events
	const filteredEvents = useMemo(() => {
		return events.filter((event) => {
			if (typeFilter && event.type !== typeFilter) return false;
			if (sourceFilter && event.source !== sourceFilter) return false;
			return true;
		});
	}, [events, typeFilter, sourceFilter]);

	// Get events for a specific day
	const getEventsForDay = (date: Date) => {
		return filteredEvents.filter((event) => {
			const startDate = parseISO(event.start_date);
			const endDate = event.end_date ? parseISO(event.end_date) : startDate;
			return date >= startDate && date <= endDate || isSameDay(startDate, date);
		});
	};

	// Get displayed events (sorted by date)
	const displayedEvents = useMemo(() => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		let eventsToShow = filteredEvents;
		if (!showPastEvents) {
			eventsToShow = filteredEvents.filter((event) => parseISO(event.start_date) >= now);
		}

		return eventsToShow.sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
	}, [filteredEvents, showPastEvents]);

	// Count past events for badge
	const pastEventsCount = useMemo(() => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		return filteredEvents.filter((event) => parseISO(event.start_date) < now).length;
	}, [filteredEvents]);

	// Navigation
	const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
	const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
	const goToToday = () => setCurrentDate(new Date());

	// Handlers
	const handleCreateEvent = () => {
		setEditingEvent(null);
		setFormData({
			title: "",
			description: "",
			start_date: selectedDate || new Date(),
			end_date: null,
			all_day: true,
			type: "academic",
			visibility: ["all"],
			recurrence: "none",
		});
		openEventModal();
	};

	const handleEditEvent = (event: CalendarEvent) => {
		setEditingEvent(event);
		setFormData({
			title: event.title,
			description: event.description || "",
			start_date: parseISO(event.start_date),
			end_date: event.end_date ? parseISO(event.end_date) : null,
			all_day: event.all_day,
			type: event.type,
			visibility: event.visibility,
			recurrence: event.recurrence,
			reminder_days: event.reminder_days,
		});
		closeDetailModal();
		openEventModal();
	};

	const handleDeleteEvent = (eventId: string) => {
		setEvents((prev) => prev.filter((e) => e.id !== eventId));
		closeDetailModal();
		notifications.show({
			title: "Événement supprimé",
			message: "L'événement a été supprimé du calendrier",
			color: "green",
			icon: <IconCheck size={16} />,
		});
	};

	const handleSubmitEvent = () => {
		if (!formData.title || !formData.start_date) {
			notifications.show({
				title: "Erreur",
				message: "Veuillez remplir les champs obligatoires",
				color: "red",
			});
			return;
		}

		const eventColor = getEventTypeColor(formData.type);

		if (editingEvent) {
			setEvents((prev) =>
				prev.map((e) =>
					e.id === editingEvent.id
						? {
								...e,
								...formData,
								start_date: format(formData.start_date!, "yyyy-MM-dd"),
								end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : undefined,
								color: eventColor,
								updated_at: new Date().toISOString(),
						  }
						: e
				)
			);
			notifications.show({
				title: "Événement modifié",
				message: "L'événement a été mis à jour",
				color: "green",
				icon: <IconCheck size={16} />,
			});
		} else {
			const newEvent: CalendarEvent = {
				id: `evt-${Date.now()}`,
				title: formData.title,
				description: formData.description,
				start_date: format(formData.start_date, "yyyy-MM-dd"),
				end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : undefined,
				all_day: formData.all_day,
				type: formData.type,
				color: eventColor,
				source: "IPES",
				source_name: "Mon Institution",
				visibility: formData.visibility,
				recurrence: formData.recurrence,
				reminder_days: formData.reminder_days,
				created_by: { id: "current", name: "Utilisateur actuel" },
				created_at: new Date().toISOString(),
			};
			setEvents((prev) => [...prev, newEvent]);
			notifications.show({
				title: "Événement créé",
				message: "L'événement a été ajouté au calendrier",
				color: "green",
				icon: <IconCheck size={16} />,
			});
		}

		closeEventModal();
	};

	const handleEventClick = (event: CalendarEvent) => {
		setSelectedEvent(event);
		openDetailModal();
	};

	const handleDayClick = (date: Date) => {
		setSelectedDate(date);
		const dayEvents = getEventsForDay(date);
		if (dayEvents.length === 1) {
			handleEventClick(dayEvents[0]);
		} else if (dayEvents.length > 1) {
			setViewMode("list");
		}
	};

	// Check if event is urgent (within 7 days)
	const isEventUrgent = (event: CalendarEvent) => {
		const startDate = parseISO(event.start_date);
		const daysUntil = differenceInDays(startDate, new Date());
		return daysUntil >= 0 && daysUntil <= 7 && event.type === "deadline";
	};

	// Render calendar day (for calendar view)
	const renderDay = (date: Date) => {
		const dayEvents = getEventsForDay(date);
		const isSelected = selectedDate && isSameDay(date, selectedDate);
		const isCurrentMonth = isSameMonth(date, currentDate);

		return (
			<Box
				onClick={() => handleDayClick(date)}
				style={{
					cursor: "pointer",
					opacity: isCurrentMonth ? 1 : 0.4,
					position: "relative",
					minHeight: 80,
					padding: 4,
					borderRadius: 8,
					backgroundColor: isSelected
						? "var(--mantine-color-blue-0)"
						: isToday(date)
						? "#fffbeb"
						: dayEvents.length > 0
						? `var(--mantine-color-${dayEvents[0].color}-0)`
						: "white",
					border: isToday(date)
						? "2px solid var(--mantine-color-orange-4)"
						: isSelected
						? "2px solid var(--mantine-color-blue-4)"
						: "1px solid var(--mantine-color-gray-2)",
					transition: "all 0.15s ease",
				}}
			>
				<Text
					size="xs"
					fw={isToday(date) ? 700 : 500}
					c={isToday(date) ? "orange" : isSelected ? "blue" : "dimmed"}
					ta="right"
					mb={2}
				>
					{format(date, "d")}
				</Text>
				<Stack gap={2}>
					{dayEvents.slice(0, 2).map((event) => (
						<Box
							key={event.id}
							style={{
								background: `var(--mantine-color-${event.color}-5)`,
								borderRadius: 4,
								padding: "1px 4px",
								cursor: "pointer",
							}}
							onClick={(e) => {
								e.stopPropagation();
								handleEventClick(event);
							}}
						>
							<Text size="10px" lineClamp={1} fw={500} c="white">
								{event.title}
							</Text>
						</Box>
					))}
					{dayEvents.length > 2 && (
						<Text size="10px" c="dimmed" ta="center" fw={500}>
							+{dayEvents.length - 2}
						</Text>
					)}
				</Stack>
			</Box>
		);
	};

	// Render compact event row (for list view)
	const renderEventRow = (event: CalendarEvent) => {
		const startDate = parseISO(event.start_date);
		const isPastEvent = isPast(startDate) && !isToday(startDate);
		const isUrgent = isEventUrgent(event);
		const daysUntil = differenceInDays(startDate, new Date());

		return (
			<UnstyledButton
				key={event.id}
				onClick={() => handleEventClick(event)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					padding: "10px 12px",
					borderRadius: 8,
					opacity: isPastEvent ? 0.6 : 1,
					background: isUrgent ? `var(--mantine-color-${event.color}-0)` : "white",
					border: `1px solid var(--mantine-color-gray-2)`,
					borderLeft: `3px solid var(--mantine-color-${event.color}-5)`,
					transition: "all 0.15s ease",
					width: "100%",
				}}
				className="event-row-hover"
			>
				{/* Date compact */}
				<Box
					style={{
						minWidth: 44,
						height: 44,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						background: `var(--mantine-color-${event.color}-1)`,
						borderRadius: 6,
					}}
				>
					<Text size="lg" fw={700} c={event.color} lh={1}>
						{format(startDate, "d")}
					</Text>
					<Text size="10px" c={event.color} tt="uppercase" fw={500}>
						{format(startDate, "MMM", { locale: fr })}
					</Text>
				</Box>

				{/* Event info */}
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Group gap={6} mb={2} wrap="nowrap">
						<Text size="sm" fw={600} lineClamp={1}>
							{event.title}
						</Text>
						{event.recurrence === "yearly" && (
							<IconRepeat size={12} color="gray" />
						)}
						{isUrgent && (
							<IconBell size={12} color="var(--mantine-color-red-5)" />
						)}
					</Group>
					<Group gap={8}>
						<Badge size="xs" variant="light" color={event.color}>
							{getEventTypeLabel(event.type)}
						</Badge>
						<Text size="xs" c="dimmed" lineClamp={1}>
							{event.source}
						</Text>
						{event.end_date && (
							<Text size="xs" c="dimmed">
								→ {format(parseISO(event.end_date), "d MMM", { locale: fr })}
							</Text>
						)}
					</Group>
				</Box>

				{/* Right badges */}
				{isToday(startDate) && (
					<Badge color="blue" variant="filled" size="xs">
						Aujourd'hui
					</Badge>
				)}
				{!isPastEvent && daysUntil > 0 && daysUntil <= 7 && (
					<Badge color={daysUntil <= 3 ? "red" : "orange"} variant="light" size="xs">
						J-{daysUntil}
					</Badge>
				)}
			</UnstyledButton>
		);
	};

	// Generate calendar grid
	const calendarDays = useMemo(() => {
		const start = startOfMonth(currentDate);
		const end = endOfMonth(currentDate);
		const days = eachDayOfInterval({ start, end });

		const firstDayOfWeek = start.getDay();
		const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
		for (let i = daysFromPrevMonth; i > 0; i--) {
			const date = new Date(start);
			date.setDate(date.getDate() - i);
			days.unshift(date);
		}

		const lastDayOfWeek = end.getDay();
		const daysFromNextMonth = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
		for (let i = 1; i <= daysFromNextMonth; i++) {
			const date = new Date(end);
			date.setDate(date.getDate() + i);
			days.push(date);
		}

		return days;
	}, [currentDate]);

	return (
		<Container fluid>
			<Stack gap="md">
				{/* Page Header - Simple */}
				<PageHeader
					title="Calendrier Académique"
					description="Planifiez et suivez les événements de l'année académique"
					breadcrumbItems={breadcrumbItems}
					icon={<IconCalendar size={24} />}
				/>

				{/* Controls Bar */}
				<Paper p="sm" withBorder radius="md">
					<Group justify="space-between" wrap="wrap" gap="sm">
						<Group gap="sm">
							{/* View Toggle - Compact icons */}
							<Group gap={4} p={4} style={{ background: "var(--mantine-color-gray-1)", borderRadius: 8 }}>
								<Tooltip label="Vue liste">
									<ActionIcon
										variant={viewMode === "list" ? "filled" : "subtle"}
										color={viewMode === "list" ? "blue" : "gray"}
										size="sm"
										onClick={() => setViewMode("list")}
									>
										<IconList size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label="Vue calendrier">
									<ActionIcon
										variant={viewMode === "calendar" ? "filled" : "subtle"}
										color={viewMode === "calendar" ? "blue" : "gray"}
										size="sm"
										onClick={() => setViewMode("calendar")}
									>
										<IconLayoutGrid size={16} />
									</ActionIcon>
								</Tooltip>
							</Group>

							<Divider orientation="vertical" />

							<Select
								placeholder="Type"
								leftSection={<IconFilter size={14} />}
								clearable
								size="xs"
								value={typeFilter}
								onChange={setTypeFilter}
								data={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
								style={{ width: 140 }}
							/>

							<Select
								placeholder="Source"
								clearable
								size="xs"
								value={sourceFilter}
								onChange={setSourceFilter}
								data={[
									{ value: "MINESUP", label: "MINESUP" },
									{ value: "CENADI", label: "CENADI" },
									{ value: "University", label: "Universités" },
									{ value: "IPES", label: "IPES" },
								]}
								style={{ width: 120 }}
							/>

							<Divider orientation="vertical" />

							<Tooltip label={showPastEvents ? "Masquer les événements passés" : "Afficher les événements passés"}>
								<UnstyledButton
									onClick={() => setShowPastEvents(!showPastEvents)}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 6,
										padding: "4px 10px",
										borderRadius: 6,
										background: showPastEvents ? "var(--mantine-color-gray-1)" : "transparent",
										border: showPastEvents ? "1px solid var(--mantine-color-gray-3)" : "1px solid transparent",
									}}
								>
									<IconClock size={14} color={showPastEvents ? "var(--mantine-color-blue-5)" : "gray"} />
									<Text size="xs" c={showPastEvents ? "blue" : "dimmed"}>
										Passés {pastEventsCount > 0 && `(${pastEventsCount})`}
									</Text>
								</UnstyledButton>
							</Tooltip>

							{viewMode === "calendar" && (
								<>
									<Divider orientation="vertical" />
									<Group gap={4}>
										<ActionIcon variant="subtle" size="sm" onClick={goToPreviousMonth}>
											<IconChevronLeft size={16} />
										</ActionIcon>
										<UnstyledButton onClick={goToToday}>
											<Text size="sm" fw={600} c="dimmed">
												{format(currentDate, "MMMM yyyy", { locale: fr })}
											</Text>
										</UnstyledButton>
										<ActionIcon variant="subtle" size="sm" onClick={goToNextMonth}>
											<IconChevronRight size={16} />
										</ActionIcon>
									</Group>
								</>
							)}
						</Group>

						<Group gap="sm">
							<Badge variant="light" color="gray" size="sm">
								{filteredEvents.length} événement(s)
							</Badge>
							<Button
								leftSection={<IconPlus size={14} />}
								size="xs"
								onClick={handleCreateEvent}
							>
								Ajouter
							</Button>
						</Group>
					</Group>
				</Paper>

				{/* Calendar View */}
				{viewMode === "calendar" && (
					<Paper p="md" withBorder radius="md">
						<Box>
							{/* Weekday headers */}
							<Grid gutter={4} mb="xs">
								{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
									<Grid.Col span={12 / 7} key={day}>
										<Text ta="center" fw={600} size="xs" c="dimmed">
											{day}
										</Text>
									</Grid.Col>
								))}
							</Grid>

							{/* Days grid */}
							<Grid gutter={4}>
								{calendarDays.map((day, index) => (
									<Grid.Col span={12 / 7} key={index}>
										{renderDay(day)}
									</Grid.Col>
								))}
							</Grid>
						</Box>
					</Paper>
				)}

				{/* List View */}
				{viewMode === "list" && (
					<Grid gutter="md">
						<Grid.Col span={{ base: 12, md: 8 }}>
							<Paper p="md" withBorder radius="md">
								<Group justify="space-between" mb="sm">
									<Group gap="xs">
										<ThemeIcon size={28} radius="xl" color="blue" variant="light">
											<IconCalendarEvent size={16} />
										</ThemeIcon>
										<Box>
											<Text fw={600} size="sm">
												{showPastEvents ? "Tous les événements" : "Événements à venir"}
											</Text>
											<Text size="xs" c="dimmed">{displayedEvents.length} événement(s)</Text>
										</Box>
									</Group>
									<Tooltip label="Actualiser">
										<ActionIcon variant="subtle" color="gray" size="sm">
											<IconRefresh size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>

								{displayedEvents.length === 0 ? (
									<Alert
										icon={<IconAlertCircle size={16} />}
										title="Aucun événement"
										color="gray"
										variant="light"
										radius="md"
									>
										Aucun événement ne correspond aux filtres.
									</Alert>
								) : (
									<ScrollArea h={420} offsetScrollbars>
										<Stack gap={6}>
											{displayedEvents.map((event) => renderEventRow(event))}
										</Stack>
									</ScrollArea>
								)}
							</Paper>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 4 }}>
							<Stack gap="md">
								{/* Mini Calendar - Enhanced */}
								<Paper p="sm" withBorder radius="md">
									<Group justify="space-between" mb="xs">
										<Text fw={600} size="sm">{format(currentDate, "MMMM yyyy", { locale: fr })}</Text>
										<Group gap={2}>
											<ActionIcon variant="subtle" size="xs" onClick={goToPreviousMonth}>
												<IconChevronLeft size={14} />
											</ActionIcon>
											<ActionIcon variant="subtle" size="xs" onClick={goToNextMonth}>
												<IconChevronRight size={14} />
											</ActionIcon>
										</Group>
									</Group>

									{/* Custom mini calendar grid */}
									<Box>
										<Grid gutter={2} mb={4}>
											{["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
												<Grid.Col span={12 / 7} key={i}>
													<Text ta="center" size="10px" c="dimmed" fw={500}>{day}</Text>
												</Grid.Col>
											))}
										</Grid>
										<Grid gutter={2}>
											{calendarDays.slice(0, 35).map((day, index) => {
												const dayEvents = getEventsForDay(day);
												const isSelected = selectedDate && isSameDay(day, selectedDate);
												const isCurrentMonth = isSameMonth(day, currentDate);
												const hasEvents = dayEvents.length > 0;

												return (
													<Grid.Col span={12 / 7} key={index}>
														<UnstyledButton
															onClick={() => {
																setSelectedDate(day);
																setCurrentDate(day);
															}}
															style={{
																width: "100%",
																aspectRatio: "1",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																borderRadius: 6,
																position: "relative",
																opacity: isCurrentMonth ? 1 : 0.3,
																background: isSelected
																	? "var(--mantine-color-blue-5)"
																	: isToday(day)
																	? "var(--mantine-color-orange-1)"
																	: hasEvents
																	? `var(--mantine-color-${dayEvents[0].color}-0)`
																	: "transparent",
																border: isToday(day) && !isSelected
																	? "1px solid var(--mantine-color-orange-4)"
																	: "none",
															}}
														>
															<Text
																size="xs"
																fw={isToday(day) || isSelected ? 700 : 400}
																c={isSelected ? "white" : isToday(day) ? "orange" : undefined}
															>
																{format(day, "d")}
															</Text>
															{hasEvents && !isSelected && (
																<Box
																	style={{
																		position: "absolute",
																		bottom: 2,
																		left: "50%",
																		transform: "translateX(-50%)",
																		display: "flex",
																		gap: 2,
																	}}
																>
																	{dayEvents.slice(0, 3).map((e, i) => (
																		<Box
																			key={i}
																			style={{
																				width: 4,
																				height: 4,
																				borderRadius: "50%",
																				background: `var(--mantine-color-${e.color}-5)`,
																			}}
																		/>
																	))}
																</Box>
															)}
														</UnstyledButton>
													</Grid.Col>
												);
											})}
										</Grid>
									</Box>
								</Paper>

								{/* Legend - Compact */}
								<Paper p="sm" withBorder radius="md">
									<Text fw={600} size="sm" mb="xs">Légende</Text>
									<Group gap={6} wrap="wrap">
										{EVENT_TYPES.map((type) => (
											<UnstyledButton
												key={type.value}
												onClick={() => setTypeFilter(typeFilter === type.value ? null : type.value)}
												style={{
													display: "flex",
													alignItems: "center",
													gap: 6,
													padding: "4px 8px",
													borderRadius: 6,
													background: typeFilter === type.value
														? `var(--mantine-color-${type.color}-1)`
														: "var(--mantine-color-gray-0)",
													border: typeFilter === type.value
														? `1px solid var(--mantine-color-${type.color}-3)`
														: "1px solid transparent",
												}}
											>
												<Box
													style={{
														width: 8,
														height: 8,
														borderRadius: 2,
														background: `var(--mantine-color-${type.color}-5)`,
													}}
												/>
												<Text size="xs">{type.label}</Text>
											</UnstyledButton>
										))}
									</Group>
								</Paper>

							</Stack>
						</Grid.Col>
					</Grid>
				)}
			</Stack>

			{/* Event Detail Modal */}
			<Modal
				opened={detailModalOpened}
				onClose={closeDetailModal}
				title={null}
				size="md"
				radius="md"
				padding={0}
				styles={{
					header: { display: "none" },
					body: { padding: 0 },
				}}
			>
				{selectedEvent && (
					<Box>
						{/* Modal Header */}
						<Box
							style={{
								background: `var(--mantine-color-${selectedEvent.color}-5)`,
								padding: "16px 20px",
								borderRadius: "8px 8px 0 0",
							}}
						>
							<Group justify="space-between" align="flex-start">
								<Box style={{ flex: 1 }}>
									<Text fw={600} size="lg" c="white" mb={4}>
										{selectedEvent.title}
									</Text>
									<Group gap={6}>
										<Badge size="xs" variant="white" color="dark">
											{getEventTypeLabel(selectedEvent.type)}
										</Badge>
										{selectedEvent.recurrence === "yearly" && (
											<Badge size="xs" variant="white" color="dark" leftSection={<IconRepeat size={10} />}>
												Annuel
											</Badge>
										)}
									</Group>
								</Box>
								<ActionIcon
									variant="transparent"
									c="white"
									onClick={closeDetailModal}
									style={{ opacity: 0.8 }}
								>
									×
								</ActionIcon>
							</Group>
						</Box>

						{/* Modal Content */}
						<Box p="md">
							{selectedEvent.description && (
								<Text size="sm" c="dimmed" mb="md">
									{selectedEvent.description}
								</Text>
							)}

							<Stack gap="sm">
								<Group gap="sm">
									<ThemeIcon size={28} radius="xl" color="gray" variant="light">
										<IconClock size={14} />
									</ThemeIcon>
									<Box>
										<Text size="xs" c="dimmed">Date</Text>
										<Text size="sm" fw={500}>
											{format(parseISO(selectedEvent.start_date), "EEEE d MMMM yyyy", { locale: fr })}
											{selectedEvent.end_date && (
												<> → {format(parseISO(selectedEvent.end_date), "d MMM yyyy", { locale: fr })}</>
											)}
										</Text>
									</Box>
								</Group>

								<Group gap="sm">
									<ThemeIcon size={28} radius="xl" color="gray" variant="light">
										<IconMapPin size={14} />
									</ThemeIcon>
									<Box>
										<Text size="xs" c="dimmed">Source</Text>
										<Text size="sm" fw={500}>{selectedEvent.source_name || selectedEvent.source}</Text>
									</Box>
								</Group>

								<Group gap="sm">
									<ThemeIcon size={28} radius="xl" color="gray" variant="light">
										<IconUsers size={14} />
									</ThemeIcon>
									<Box>
										<Text size="xs" c="dimmed">Visibilité</Text>
										<Text size="sm" fw={500}>
											{selectedEvent.visibility.includes("all")
												? "Tous les acteurs"
												: selectedEvent.visibility.join(", ")}
										</Text>
									</Box>
								</Group>
							</Stack>

							<Divider my="md" />

							<Group justify="space-between">
								<Text size="xs" c="dimmed">
									Créé par {selectedEvent.created_by.name}
								</Text>
								<Group gap="xs">
									<Button
										variant="light"
										size="xs"
										leftSection={<IconEdit size={14} />}
										onClick={() => handleEditEvent(selectedEvent)}
									>
										Modifier
									</Button>
									<Button
										variant="light"
										color="red"
										size="xs"
										leftSection={<IconTrash size={14} />}
										onClick={() => handleDeleteEvent(selectedEvent.id)}
									>
										Supprimer
									</Button>
								</Group>
							</Group>
						</Box>
					</Box>
				)}
			</Modal>

			{/* Create/Edit Event Modal */}
			<Modal
				opened={eventModalOpened}
				onClose={closeEventModal}
				title={
					<Group gap="sm">
						<ThemeIcon size={24} radius="xl" color="blue">
							<IconPlus size={14} />
						</ThemeIcon>
						<Text fw={600} size="sm">{editingEvent ? "Modifier l'événement" : "Nouvel événement"}</Text>
					</Group>
				}
				size="md"
				radius="md"
			>
				<Stack gap="sm">
					<TextInput
						label="Titre"
						placeholder="Titre de l'événement"
						required
						size="sm"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
					/>

					<Textarea
						label="Description"
						placeholder="Description (optionnel)"
						size="sm"
						minRows={2}
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					/>

					<Grid>
						<Grid.Col span={6}>
							<DatePickerInput
								label="Date de début"
								placeholder="Sélectionner"
								required
								size="sm"
								locale="fr"
								previousIcon={<IconChevronLeft size={14} />}
								nextIcon={<IconChevronRight size={14} />}
								value={formData.start_date}
								onChange={(date) => setFormData({ ...formData, start_date: date })}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<DatePickerInput
								label="Date de fin"
								placeholder="Optionnel"
								size="sm"
								locale="fr"
								previousIcon={<IconChevronLeft size={14} />}
								nextIcon={<IconChevronRight size={14} />}
								value={formData.end_date}
								onChange={(date) => setFormData({ ...formData, end_date: date })}
								minDate={formData.start_date || undefined}
							/>
						</Grid.Col>
					</Grid>

					<Switch
						label="Journée entière"
						size="sm"
						checked={formData.all_day}
						onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
					/>

					<Select
						label="Type d'événement"
						required
						size="sm"
						value={formData.type}
						onChange={(value) => setFormData({ ...formData, type: value as EventType })}
						data={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
					/>

					<MultiSelect
						label="Visibilité"
						description="Qui peut voir cet événement ?"
						size="sm"
						value={formData.visibility}
						onChange={(value) =>
							setFormData({ ...formData, visibility: value as EventVisibility[] })
						}
						data={EVENT_VISIBILITY}
					/>

					<Select
						label="Récurrence"
						size="sm"
						value={formData.recurrence}
						onChange={(value) =>
							setFormData({ ...formData, recurrence: value as "none" | "yearly" })
						}
						data={[
							{ value: "none", label: "Aucune" },
							{ value: "yearly", label: "Chaque année" },
						]}
					/>

					<Group justify="flex-end" mt="sm">
						<Button variant="subtle" size="sm" onClick={closeEventModal}>
							Annuler
						</Button>
						<Button
							size="sm"
							onClick={handleSubmitEvent}
							leftSection={<IconCheck size={14} />}
						>
							{editingEvent ? "Enregistrer" : "Créer"}
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Hover styles */}
			<style>{`
				.event-row-hover:hover {
					background: var(--mantine-color-gray-0) !important;
					border-color: var(--mantine-color-gray-3) !important;
				}
			`}</style>
		</Container>
	);
}
