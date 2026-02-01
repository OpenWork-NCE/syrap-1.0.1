"use client";

import { useState } from "react";
import {
	Stack,
	Text,
	Avatar,
	Group,
	Badge,
	Paper,
	TextInput,
	ScrollArea,
	Skeleton,
	Center,
	Box,
} from "@mantine/core";
import { IconSearch, IconMessageCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import classes from "./Messages.module.css";

interface ConversationListProps {
	selectedId?: string;
	onSelect: (conversation: Conversation) => void;
	currentUserId: string;
}

export function ConversationList({
	selectedId,
	onSelect,
	currentUserId,
}: ConversationListProps) {
	const [search, setSearch] = useState("");

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

	const filtered = conversations.filter((c) =>
		c.participants.some((p) =>
			p.name?.toLowerCase().includes(search.toLowerCase())
		)
	);

	if (isLoading) {
		return (
			<Stack gap="xs" p="md" h="100%">
				<TextInput
					placeholder="Rechercher une conversation..."
					leftSection={<IconSearch size={16} />}
					disabled
				/>
				<Stack gap="xs" flex={1}>
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} height={70} radius="md" />
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
			{/* Barre de recherche - Fixe */}
			<Box px="md" py="sm" style={{ flexShrink: 0 }}>
				<TextInput
					placeholder="Rechercher une conversation..."
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="sm"
					styles={{
						input: {
							borderRadius: 20,
						}
					}}
				/>
			</Box>

			{/* Liste des conversations - Scrollable */}
			<ScrollArea flex={1} px="md" pb="md" style={{ minHeight: 0 }}>
				<Stack gap="xs">
					{filtered.length === 0 ? (
						<Center py="xl">
							<Stack align="center" gap="xs">
								<IconMessageCircle size={40} color="gray" opacity={0.5} />
								<Text c="dimmed" size="sm" ta="center">
									{search
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
							const displayName =
								conversation.type === "group"
									? conversation.subject || "Groupe"
									: otherParticipant?.name || "Utilisateur";

							const isSelected = String(selectedId) === String(conversation.id);

							return (
								<Paper
									key={conversation.id}
									p="sm"
									className={`${classes.conversationItem} ${
										isSelected ? classes.selected : ""
									}`}
									onClick={() => onSelect(conversation)}
								>
									<Group justify="space-between" wrap="nowrap" gap="sm">
										<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
											<Avatar
												color="blue"
												radius="xl"
												size="md"
												src={otherParticipant?.avatar}
											>
												{displayName.charAt(0).toUpperCase()}
											</Avatar>
											<div style={{ flex: 1, minWidth: 0 }}>
												<Group gap="xs" wrap="nowrap">
													<Text fw={conversation.unread_count > 0 ? 600 : 500} truncate size="sm">
														{displayName}
													</Text>
													{conversation.unread_count > 0 && (
														<Badge size="xs" circle color="blue" variant="filled">
															{conversation.unread_count}
														</Badge>
													)}
												</Group>
												<Text
													size="xs"
													c={conversation.unread_count > 0 ? "dark" : "dimmed"}
													truncate
													fw={conversation.unread_count > 0 ? 500 : 400}
												>
													{conversation.latest_message?.body ||
														"Aucun message"}
												</Text>
											</div>
										</Group>

										<Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
											{conversation.latest_message &&
												formatDistanceToNow(
													new Date(conversation.latest_message.created_at),
													{
														addSuffix: false,
														locale: fr,
													}
												)}
										</Text>
									</Group>
								</Paper>
							);
						})
					)}
				</Stack>
			</ScrollArea>
		</Stack>
	);
}
