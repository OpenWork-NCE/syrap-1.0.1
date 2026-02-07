"use client";

import { useState } from "react";
import {
	Stack,
	Text,
	Avatar,
	Group,
	Badge,
	Box,
	TextInput,
	ScrollArea,
	Skeleton,
	Center,
	SegmentedControl,
} from "@mantine/core";
import { IconSearch, IconMessageCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { Conversation, ConversationParticipant } from "@/types";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import classes from "./Messages.module.css";

interface ConversationListProps {
	selectedId?: string;
	onSelect: (conversation: Conversation) => void;
	currentUserId: string;
}

function getAvatarColor(institutionType?: string): string {
	switch (institutionType) {
		case "cenadi": return "teal";
		case "minesup": return "blue";
		case "university": return "orange";
		case "ipes": return "violet";
		default: return "gray";
	}
}

function formatConversationDate(dateStr: string): string {
	const date = new Date(dateStr);
	if (isToday(date)) {
		return format(date, "HH:mm", { locale: fr });
	}
	if (isYesterday(date)) {
		return "Hier";
	}
	return format(date, "d MMM", { locale: fr });
}

export function ConversationList({
	selectedId,
	onSelect,
	currentUserId,
}: ConversationListProps) {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("all");

	const { data, isLoading, error } = useQuery({
		queryKey: ["conversations"],
		queryFn: async () => {
			const res = await fetch("/api/messages/conversations");
			if (!res.ok) throw new Error("Erreur de chargement");
			return res.json();
		},
		refetchInterval: 30000,
		refetchOnWindowFocus: true,
	});

	const conversations: Conversation[] = data?.data || [];

	const filtered = conversations
		.filter((c) => {
			if (filter === "unread") return c.unread_count > 0;
			return true;
		})
		.filter((c) =>
			c.participants.some((p) =>
				p.name?.toLowerCase().includes(search.toLowerCase())
			) ||
			c.subject?.toLowerCase().includes(search.toLowerCase())
		);

	if (isLoading) {
		return (
			<Stack gap="xs" p="md" h="100%">
				<TextInput
					placeholder="Rechercher..."
					leftSection={<IconSearch size={16} />}
					disabled
				/>
				<Stack gap="xs" flex={1}>
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} height={80} radius="sm" />
					))}
				</Stack>
			</Stack>
		);
	}

	if (error) {
		return (
			<Center py="xl" h="100%">
				<Text c="red" size="sm">
					Erreur de chargement des conversations
				</Text>
			</Center>
		);
	}

	return (
		<Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
			{/* Barre de recherche */}
			<Box px="md" pt="sm" style={{ flexShrink: 0 }}>
				<TextInput
					placeholder="Rechercher une conversation..."
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="sm"
				/>
			</Box>

			{/* Filtres */}
			<Box className={classes.filterTabs} pt="xs">
				<SegmentedControl
					value={filter}
					onChange={setFilter}
					size="xs"
					fullWidth
					data={[
						{ label: "Tous", value: "all" },
						{ label: "Non lus", value: "unread" },
					]}
				/>
			</Box>

			{/* Liste des conversations */}
			<ScrollArea flex={1} style={{ minHeight: 0 }}>
				<Stack gap={0}>
					{filtered.length === 0 ? (
						<Center py="xl">
							<Stack align="center" gap="xs">
								<IconMessageCircle size={40} color="gray" opacity={0.5} />
								<Text c="dimmed" size="sm" ta="center">
									{filter === "unread"
										? "Aucun message non lu"
										: search
											? "Aucune conversation trouvée"
											: "Aucune conversation"}
								</Text>
							</Stack>
						</Center>
					) : (
						filtered.map((conversation) => {
							const otherParticipant = conversation.participants.find(
								(p) => String(p.id) !== String(currentUserId)
							);
							const displayName = otherParticipant?.name || "Utilisateur";
							const isSelected = String(selectedId) === String(conversation.id);
							const hasUnread = conversation.unread_count > 0;
							const institution = (otherParticipant as ConversationParticipant)?.institution;
							const role = (otherParticipant as ConversationParticipant)?.role;

							return (
								<Box
									key={conversation.id}
									px="md"
									py="sm"
									className={`${classes.conversationItem} ${
										isSelected ? classes.selected : ""
									}`}
									onClick={() => onSelect(conversation)}
								>
									<div style={{ display: "grid", gridTemplateColumns: "38px 1fr auto", gap: "var(--mantine-spacing-sm)", alignItems: "start" }}>
										{/* Avatar */}
										<Avatar
											color={getAvatarColor(institution?.type)}
											radius="xl"
											size={38}
											src={otherParticipant?.avatar}
											mt={2}
										>
											{displayName.charAt(0).toUpperCase()}
										</Avatar>

										{/* Contenu texte */}
										<div style={{ minWidth: 0, overflow: "hidden" }}>
											<Text truncate size="sm" lh={1.3}>
												<span style={{ fontWeight: hasUnread ? 700 : 500 }}>{displayName}</span>
												{role && (
													<span style={{ color: "var(--mantine-color-dimmed)", fontWeight: 400, fontSize: "var(--mantine-font-size-xs)" }}> · {role}</span>
												)}
											</Text>

											{conversation.subject && (
												<Text
													size="xs"
													truncate
													lh={1.3}
													mt={1}
													className={`${classes.conversationSubject} ${
														hasUnread ? classes.conversationSubjectUnread : ""
													}`}
												>
													{conversation.subject}
												</Text>
											)}

											<Text
												size="xs"
												c="dimmed"
												truncate
												lh={1.3}
												mt={1}
											>
												{conversation.latest_message?.body || "Aucun message"}
											</Text>
										</div>

										{/* Date + badge non-lu */}
										<Stack gap={4} align="flex-end" style={{ flexShrink: 0, minWidth: 45 }}>
											<Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
												{conversation.latest_message &&
													formatConversationDate(conversation.latest_message.created_at)}
											</Text>
											{hasUnread && (
												<Badge size="md" circle variant="filled" color="red">
													{conversation.unread_count}
												</Badge>
											)}
										</Stack>
									</div>
								</Box>
							);
						})
					)}
				</Stack>
			</ScrollArea>
		</Stack>
	);
}
