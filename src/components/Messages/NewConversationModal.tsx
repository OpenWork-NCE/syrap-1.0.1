"use client";

import { useState } from "react";
import {
	Modal,
	Button,
	Stack,
	Textarea,
	Select,
	Text,
	Group,
	Avatar,
	Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconSend } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import type { Conversation } from "@/types";

interface UserOption {
	value: string;
	label: string;
	email: string;
	avatar?: string;
}

interface NewConversationModalProps {
	currentUserId: string;
	onConversationCreated?: (conversation: Conversation) => void;
}

export function NewConversationModal({
	currentUserId,
	onConversationCreated,
}: NewConversationModalProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const queryClient = useQueryClient();

	// Fetch users
	const { data: usersData, isLoading: loadingUsers } = useQuery({
		queryKey: ["users-for-message"],
		queryFn: async () => {
			const res = await fetch("/api/users");
			if (!res.ok) throw new Error("Erreur de chargement");
			return res.json();
		},
		enabled: opened,
	});

	const users: UserOption[] = (usersData?.data || [])
		.filter((u: { id: string | number }) => String(u.id) !== String(currentUserId))
		.map((u: { id: string | number; name: string; email: string; avatar?: string }) => ({
			value: String(u.id),
			label: u.name || "Utilisateur",
			email: u.email || "",
			avatar: u.avatar,
		}));

	const createMutation = useMutation({
		mutationFn: async (data: { recipient_id: string; message: string }) => {
			const res = await fetch("/api/messages/conversations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Erreur de création");
			return res.json();
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			notifications.show({
				title: "Conversation créée",
				message: "Votre message a été envoyé",
				color: "green",
			});
			close();
			setSelectedUser(null);
			setMessage("");
			if (onConversationCreated && data.conversation) {
				onConversationCreated(data.conversation);
			}
		},
		onError: () => {
			notifications.show({
				title: "Erreur",
				message: "Impossible de créer la conversation",
				color: "red",
			});
		},
	});

	const handleSubmit = () => {
		if (selectedUser && message.trim()) {
			createMutation.mutate({
				recipient_id: selectedUser,
				message: message.trim(),
			});
		}
	};

	const selectedUserData = users.find((u) => u.value === selectedUser);

	return (
		<>
			<Button
				leftSection={<IconPlus size={16} />}
				size="xs"
				variant="light"
				onClick={open}
			>
				Nouveau
			</Button>

			<Modal
				opened={opened}
				onClose={close}
				title="Nouvelle conversation"
				size="md"
			>
				<Stack gap="md">
					<Select
						label="Destinataire"
						placeholder="Sélectionnez un utilisateur"
						data={users}
						value={selectedUser}
						onChange={setSelectedUser}
						searchable
						nothingFoundMessage="Aucun utilisateur trouvé"
						disabled={loadingUsers}
						leftSection={loadingUsers ? <Loader size={16} /> : undefined}
						renderOption={({ option }) => {
							const user = users.find((u) => u.value === option.value);
							return (
								<Group gap="sm">
									<Avatar size="sm" radius="xl" color="blue">
										{option.label.charAt(0).toUpperCase()}
									</Avatar>
									<div>
										<Text size="sm">{option.label}</Text>
										<Text size="xs" c="dimmed">
											{user?.email}
										</Text>
									</div>
								</Group>
							);
						}}
					/>

					{selectedUserData && (
						<Group gap="sm" p="xs" bg="gray.0" style={{ borderRadius: 8 }}>
							<Avatar size="md" radius="xl" color="blue">
								{selectedUserData.label.charAt(0).toUpperCase()}
							</Avatar>
							<div>
								<Text size="sm" fw={500}>
									{selectedUserData.label}
								</Text>
								<Text size="xs" c="dimmed">
									{selectedUserData.email}
								</Text>
							</div>
						</Group>
					)}

					<Textarea
						label="Message"
						placeholder="Écrivez votre premier message..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						minRows={3}
						maxRows={6}
						autosize
					/>

					<Group justify="flex-end" gap="sm">
						<Button variant="subtle" onClick={close}>
							Annuler
						</Button>
						<Button
							leftSection={<IconSend size={16} />}
							onClick={handleSubmit}
							loading={createMutation.isPending}
							disabled={!selectedUser || !message.trim()}
						>
							Envoyer
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
