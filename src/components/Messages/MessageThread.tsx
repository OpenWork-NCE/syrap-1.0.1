"use client";

import { useState, useEffect, useRef } from "react";
import {
	Stack,
	Paper,
	Text,
	Avatar,
	Group,
	Textarea,
	ActionIcon,
	ScrollArea,
	Skeleton,
	Center,
	Divider,
	Box,
} from "@mantine/core";
import { IconSend, IconPaperclip } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import type { Conversation, Message, ConversationWithMessages } from "@/types";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import classes from "./Messages.module.css";

interface MessageThreadProps {
	conversation: Conversation;
	currentUserId: string;
}

function formatMessageDate(date: Date): string {
	if (isToday(date)) {
		return format(date, "HH:mm", { locale: fr });
	}
	if (isYesterday(date)) {
		return `Hier ${format(date, "HH:mm", { locale: fr })}`;
	}
	return format(date, "d MMM HH:mm", { locale: fr });
}

function formatDayDivider(date: Date): string {
	if (isToday(date)) {
		return "Aujourd'hui";
	}
	if (isYesterday(date)) {
		return "Hier";
	}
	return format(date, "EEEE d MMMM yyyy", { locale: fr });
}

export function MessageThread({
	conversation,
	currentUserId,
}: MessageThreadProps) {
	const [newMessage, setNewMessage] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<ConversationWithMessages>({
		queryKey: ["messages", conversation.id],
		queryFn: async () => {
			const res = await fetch(
				`/api/messages/conversations/${conversation.id}`
			);
			if (!res.ok) throw new Error("Erreur de chargement");
			return res.json();
		},
		refetchInterval: 10000,
		refetchOnWindowFocus: true,
	});

	const messages: Message[] = data?.messages?.data || [];

	const sendMutation = useMutation({
		mutationFn: async (body: string) => {
			const res = await fetch(
				`/api/messages/conversations/${conversation.id}/messages`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ body }),
				}
			);
			if (!res.ok) throw new Error("Erreur d'envoi");
			return res.json();
		},
		onSuccess: () => {
			setNewMessage("");
			queryClient.invalidateQueries({
				queryKey: ["messages", conversation.id],
			});
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			queryClient.invalidateQueries({ queryKey: ["unread-count"] });
		},
		onError: () => {
			notifications.show({
				title: "Erreur",
				message: "Impossible d'envoyer le message",
				color: "red",
			});
		},
	});

	// Scroll to bottom on new messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages.length]);

	const handleSend = () => {
		const trimmed = newMessage.trim();
		if (trimmed) {
			sendMutation.mutate(trimmed);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const otherParticipant = conversation.participants.find(
		(p) => String(p.id) !== String(currentUserId)
	);

	// Group messages by day
	const groupedMessages: { date: Date; messages: Message[] }[] = [];
	messages.forEach((message) => {
		const msgDate = new Date(message.created_at);
		const lastGroup = groupedMessages[groupedMessages.length - 1];
		if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
			lastGroup.messages.push(message);
		} else {
			groupedMessages.push({ date: msgDate, messages: [message] });
		}
	});

	if (isLoading) {
		return (
			<Stack h="100%" gap={0}>
				<Paper p="md" withBorder className={classes.threadHeader}>
					<Group gap="sm">
						<Skeleton circle height={40} />
						<Skeleton height={20} width={150} />
					</Group>
				</Paper>
				<Stack flex={1} p="md" gap="sm">
					{[1, 2, 3, 4].map((i) => (
						<Group key={i} justify={i % 2 === 0 ? "flex-end" : "flex-start"}>
							<Skeleton height={50} width="60%" radius="lg" />
						</Group>
					))}
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack h="100%" gap={0} style={{ overflow: "hidden" }}>
			{/* Header - Fixe */}
			<Paper p="md" withBorder className={classes.threadHeader}>
				<Group gap="sm">
					<Avatar
						color="blue"
						radius="xl"
						size="md"
						src={otherParticipant?.avatar}
					>
						{otherParticipant?.name?.charAt(0).toUpperCase() || "?"}
					</Avatar>
					<div>
						<Text fw={500} size="sm">
							{conversation.type === "group"
								? conversation.subject
								: otherParticipant?.name}
						</Text>
						<Text size="xs" c="dimmed">
							{conversation.type === "group"
								? `${conversation.participants.length} participants`
								: otherParticipant?.email}
						</Text>
					</div>
				</Group>
			</Paper>

			{/* Messages - Zone scrollable */}
			<ScrollArea
				flex={1}
				p="md"
				viewportRef={scrollRef}
				className={classes.messagesScrollArea}
				style={{ minHeight: 0 }}
			>
				<Stack gap="md">
					{groupedMessages.length === 0 ? (
						<Center py="xl">
							<Text c="dimmed" size="sm">
								Commencez la conversation
							</Text>
						</Center>
					) : (
						groupedMessages.map((group, groupIndex) => (
							<Stack key={groupIndex} gap="sm">
								<Divider
									label={formatDayDivider(group.date)}
									labelPosition="center"
									className={classes.dateDivider}
								/>
								{group.messages.map((message) => {
									// Comparaison avec conversion en string pour éviter les problèmes de type
									const isOwn = String(message.sender_id) === String(currentUserId);

									return (
										<Box
											key={message.id}
											className={isOwn ? classes.messageWrapperOwn : classes.messageWrapperOther}
										>
											<Group
												justify={isOwn ? "flex-end" : "flex-start"}
												wrap="nowrap"
												align="flex-end"
												gap="xs"
											>
												{!isOwn && (
													<Avatar
														color="blue"
														radius="xl"
														size="sm"
														src={message.sender?.avatar}
													>
														{message.sender?.name?.charAt(0).toUpperCase() || "?"}
													</Avatar>
												)}
												<Box>
													<Paper
														p="sm"
														className={isOwn ? classes.messageOwn : classes.messageOther}
													>
														<Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
															{message.body}
														</Text>
													</Paper>
													<Text
														size="xs"
														c="dimmed"
														ta={isOwn ? "right" : "left"}
														mt={4}
														px={4}
													>
														{formatMessageDate(new Date(message.created_at))}
													</Text>
												</Box>
											</Group>
										</Box>
									);
								})}
							</Stack>
						))
					)}
				</Stack>
			</ScrollArea>

			{/* Input - Fixe en bas */}
			<Paper p="md" withBorder className={classes.inputArea}>
				<Group gap="sm" align="flex-end">
					<ActionIcon
						variant="subtle"
						color="gray"
						size="lg"
						disabled
						title="Pièces jointes (bientôt disponible)"
					>
						<IconPaperclip size={20} />
					</ActionIcon>
					<Textarea
						placeholder="Écrivez votre message..."
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						autosize
						minRows={1}
						maxRows={4}
						style={{ flex: 1 }}
						disabled={sendMutation.isPending}
						styles={{
							input: {
								borderRadius: 20,
							}
						}}
					/>
					<ActionIcon
						size="lg"
						color="blue"
						variant="filled"
						radius="xl"
						onClick={handleSend}
						loading={sendMutation.isPending}
						disabled={!newMessage.trim()}
					>
						<IconSend size={18} />
					</ActionIcon>
				</Group>
			</Paper>
		</Stack>
	);
}
