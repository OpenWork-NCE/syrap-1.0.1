"use client";

import { useState } from "react";
import {
	Container,
	Grid,
	Paper,
	Title,
	Text,
	Stack,
	Group,
	Skeleton,
	Center,
	Box,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
	ConversationList,
	MessageThread,
	NewConversationModal,
} from "@/components/Messages";
import { useSession } from "@/app/context/SessionContext";
import type { Conversation } from "@/types";
import classes from "@/components/Messages/Messages.module.css";

const breadcrumbItems = [{ title: "Messagerie", href: "#" }];

function MessagesPage() {
	const { user, isLoading: sessionLoading } = useSession();
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);

	const handleConversationSelect = (conversation: Conversation) => {
		setSelectedConversation(conversation);
	};

	const handleConversationCreated = (conversation: Conversation) => {
		setSelectedConversation(conversation);
	};

	if (sessionLoading) {
		return (
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Messagerie"
						breadcrumbItems={breadcrumbItems}
						icon={<IconMessageCircle size={24} />}
					/>
					<Grid gutter="md" className={classes.messagesGrid}>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<Paper p="md" withBorder className={classes.conversationPanel}>
								<Stack gap="md">
									<Skeleton height={30} />
									<Skeleton height={40} />
									{[1, 2, 3, 4].map((i) => (
										<Skeleton key={i} height={70} radius="md" />
									))}
								</Stack>
							</Paper>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 8 }}>
							<Paper withBorder className={classes.messagePanel}>
								<Skeleton height="100%" />
							</Paper>
						</Grid.Col>
					</Grid>
				</Stack>
			</Container>
		);
	}

	return (
		<Container fluid>
			<Stack gap="lg">
				<PageHeader
					title="Messagerie"
					description="Communiquez avec les autres acteurs de la plateforme"
					breadcrumbItems={breadcrumbItems}
					icon={<IconMessageCircle size={24} />}
				/>

				<Grid gutter="md" className={classes.messagesGrid}>
					{/* Liste des conversations - Panneau gauche */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper withBorder className={classes.conversationPanel}>
							{/* Header fixe */}
							<Box
								p="md"
								style={{
									borderBottom: "1px solid var(--mantine-color-gray-2)",
									flexShrink: 0,
								}}
							>
								<Group justify="space-between">
									<Title order={5}>Conversations</Title>
									<NewConversationModal
										currentUserId={user.id}
										onConversationCreated={handleConversationCreated}
									/>
								</Group>
							</Box>

							{/* Liste scrollable */}
							<Box flex={1} style={{ minHeight: 0, overflow: "hidden" }}>
								<ConversationList
									selectedId={selectedConversation?.id}
									onSelect={handleConversationSelect}
									currentUserId={user.id}
								/>
							</Box>
						</Paper>
					</Grid.Col>

					{/* Thread de messages - Panneau droit */}
					<Grid.Col span={{ base: 12, md: 8 }}>
						<Paper withBorder className={classes.messagePanel}>
							{selectedConversation ? (
								<MessageThread
									conversation={selectedConversation}
									currentUserId={user.id}
								/>
							) : (
								<Center style={{ flex: 1 }}>
									<Stack align="center" gap="md">
										<Box
											style={{
												width: 80,
												height: 80,
												borderRadius: "50%",
												background: "var(--mantine-color-gray-1)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<IconMessageCircle
												size={40}
												color="var(--mantine-color-gray-5)"
											/>
										</Box>
										<Text c="dimmed" size="lg" ta="center" fw={500}>
											Sélectionnez une conversation
										</Text>
										<Text c="dimmed" size="sm" ta="center" maw={300}>
											Choisissez une conversation existante ou créez-en une
											nouvelle pour commencer à discuter
										</Text>
									</Stack>
								</Center>
							)}
						</Paper>
					</Grid.Col>
				</Grid>
			</Stack>
		</Container>
	);
}

export default MessagesPage;
