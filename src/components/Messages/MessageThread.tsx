"use client";

import { useState, useEffect, useRef } from "react";
import {
	Stack,
	Paper,
	Text,
	Avatar,
	Group,
	Textarea,
	Button,
	ScrollArea,
	Skeleton,
	Center,
	Divider,
	Box,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import type { Conversation, Message, ConversationWithMessages, ConversationParticipant } from "@/types";
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
		return `Hier à ${format(date, "HH:mm", { locale: fr })}`;
	}
	return format(date, "d MMM à HH:mm", { locale: fr });
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

function getAvatarColor(institutionType?: string): string {
	switch (institutionType) {
		case "cenadi": return "teal";
		case "minesup": return "blue";
		case "university": return "orange";
		case "ipes": return "violet";
		default: return "gray";
	}
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
		refetchInterval: 60000,
		refetchOnWindowFocus: true,
	});

	const messages: Message[] = data?.messages?.data || [];
	const conversationData = data?.conversation || conversation;

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

	// Build a map of participant info by id
	const participantMap = new Map<string, ConversationParticipant>();
	for (const p of conversationData.participants) {
		participantMap.set(String(p.id), p);
	}

	const otherParticipants = conversationData.participants.filter(
		(p) => String(p.id) !== String(currentUserId)
	);

	// Group messages by day
	const groupedMessages: { date: Date; messages: Message[] }[] = [];
	for (const message of messages) {
		const msgDate = new Date(message.created_at);
		const lastGroup = groupedMessages[groupedMessages.length - 1];
		if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
			lastGroup.messages.push(message);
		} else {
			groupedMessages.push({ date: msgDate, messages: [message] });
		}
	}

	if (isLoading) {
		return (
			<Stack h="100%" gap={0}>
				<Paper p="md" withBorder className={classes.threadHeader}>
					<Skeleton height={20} width={300} mb="xs" />
					<Skeleton height={14} width={200} />
				</Paper>
				<Stack flex={1} p="md" gap="md">
					{[1, 2, 3].map((i) => (
						<Box key={i}>
							<Group gap="sm" mb={4}>
								<Skeleton circle height={38} />
								<Skeleton height={14} width={150} />
							</Group>
							<Skeleton height={40} width="80%" ml={48} />
						</Box>
					))}
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack h="100%" gap={0} style={{ overflow: "hidden" }}>
			{/* Header - Sujet + Participants */}
			<Paper p="md" withBorder className={classes.threadHeader}>
				{conversationData.subject && (
					<Text className={classes.threadSubject} mb={4}>
						{conversationData.subject}
					</Text>
				)}
				<Text className={classes.threadParticipants}>
					{otherParticipants.map((p, i) => {
						const participant = p as ConversationParticipant;
						const parts = [participant.name];
						if (participant.institution) {
							parts.push(participant.institution.name);
						}
						return parts.join(" · ");
					}).join(", ")}
				</Text>
			</Paper>

			{/* Messages */}
			<ScrollArea
				flex={1}
				viewportRef={scrollRef}
				className={classes.messagesScrollArea}
				style={{ minHeight: 0 }}
			>
				{groupedMessages.length === 0 ? (
					<Center py="xl">
						<Text c="dimmed" size="sm">
							Commencez la conversation
						</Text>
					</Center>
				) : (
					groupedMessages.map((group, groupIndex) => (
						<Box key={groupIndex}>
							<Divider
								label={formatDayDivider(group.date)}
								labelPosition="center"
								className={classes.dateDivider}
							/>
							{group.messages.map((message) => {
								const isOwn = String(message.sender_id) === String(currentUserId);
								const senderParticipant = participantMap.get(String(message.sender_id));
								const institution = (senderParticipant as ConversationParticipant)?.institution;
								const senderName = message.sender?.name || senderParticipant?.name || "Inconnu";

								return (
									<Box key={message.id} className={`${classes.messageBlock} ${isOwn ? classes.messageBlockOwn : ""}`}>
										{/* Header: avatar + nom + institution + date */}
										<div className={classes.messageBlockHeader}>
											<Avatar
												color={getAvatarColor(institution?.type)}
												radius="xl"
												size={38}
												src={message.sender?.avatar}
											>
												{senderName.charAt(0).toUpperCase()}
											</Avatar>
											<Text fw={600} size="sm" lh={1}>
												{senderName}
											</Text>
											{institution && (
												<span
													className={classes.institutionBadge}
													data-type={institution.type}
												>
													{institution.name}
												</span>
											)}
											<Text size="xs" c="dimmed" ml="auto" style={{ flexShrink: 0 }}>
												{formatMessageDate(new Date(message.created_at))}
											</Text>
										</div>
										{/* Body */}
										<div className={classes.messageBlockBody}>
											{message.body}
										</div>
									</Box>
								);
							})}
						</Box>
					))
				)}
			</ScrollArea>

			{/* Input */}
			<Paper p="sm" px="md" withBorder className={classes.inputArea}>
				<Group gap="sm" align="flex-end" wrap="nowrap">
					<Textarea
						placeholder="Rédigez votre message..."
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						autosize
						minRows={2}
						maxRows={5}
						disabled={sendMutation.isPending}
						style={{ flex: 1 }}
						styles={{
							input: {
								borderRadius: 8,
							}
						}}
					/>
					<Button
						leftSection={<IconSend size={16} />}
						onClick={handleSend}
						loading={sendMutation.isPending}
						disabled={!newMessage.trim()}
						size="sm"
					>
						Envoyer
					</Button>
				</Group>
			</Paper>
		</Stack>
	);
}
