"use client";

import {
	Anchor,
	Button,
	Center,
	Divider,
	Group,
	Select,
	Textarea,
	TextInput,
} from "@mantine/core";
import {
	ThemedCard,
	ThemedText,
	ThemedTitle,
} from "@/components/ui/ThemeComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { PATH_AUTHENTICATIONS } from "@/routes";
import {
	IconArrowLeft,
	IconAt,
	IconCheck,
	IconSend,
	IconUser,
} from "@tabler/icons-react";
import classes from "./SupportForm.module.css";

export function SupportForm() {
	const { push } = useRouter();
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [messageSent, setMessageSent] = useState<boolean>(false);

	const supportSchema = useMemo(
		() =>
			z.object({
				name: z
					.string({ required_error: "Ce champ est requis." })
					.trim()
					.min(2, "Le nom doit contenir au moins 2 caractères"),
				email: z
					.string({ required_error: "Une adresse mail est requise." })
					.email("L'adresse mail doit être valide."),
				institution: z.string({ required_error: "Ce champ est requis." }),
				subject: z.string({ required_error: "Ce champ est requis." }),
				message: z
					.string({ required_error: "Veuillez entrer un message." })
					.min(10, "Le message doit contenir au moins 10 caractères"),
			}),
		[],
	);

	const submitData: SubmitHandler<z.infer<typeof supportSchema>> = async (
		data,
	) => {
		setLoading(true);

		await fetchJson(await internalApiUrl(`/api/contact/`), {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async () => {
				setMessageSent(true);
				notifications.show({
					color: "green",
					title: "Message envoyé avec succès",
					message: "Un administrateur vous contactera prochainement",
					icon: <IconCheck size="1.1rem" />,
				});
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Échec de l'envoi du message",
					message: "Une erreur est survenue. Veuillez réessayer.",
				});
				setLoading(false);
			});
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<z.infer<typeof supportSchema>>({
		resolver: zodResolver(supportSchema),
		defaultValues: {
			institution: "",
		},
	});

	useEffect(() => {
		if (!initiated.current) {
			initiated.current = true;
		}
	}, []);

	if (messageSent) {
		return (
			<ThemedCard
				withBorder
				shadow="md"
				p={30}
				mt={30}
				radius="md"
				className={classes.card}
			>
				<Center>
					<IconCheck size={50} color="green" />
				</Center>
				<ThemedTitle order={2} ta="center" mt="md">
					Demande envoyée
				</ThemedTitle>
				<ThemedText c="dimmed" ta="center" mt="sm">
					Votre demande a été envoyée avec succès. Un administrateur vous
					contactera prochainement pour créer votre compte.
				</ThemedText>
				<Button
					fullWidth
					mt="xl"
					component="a"
					href="/login"
					leftSection={<IconArrowLeft size={18} />}
					className="theme-button theme-button-primary"
				>
					Retour à la connexion
				</Button>
			</ThemedCard>
		);
	}

	return (
		<ThemedCard
			withBorder
			shadow="md"
			p={30}
			mt={30}
			radius="md"
			className={classes.card}
		>
			<ThemedTitle order={2} ta="center" mt="md" mb={20}>
				Demande de compte
			</ThemedTitle>
			<ThemedText size="sm" c="dimmed" ta="center" mb={30}>
				Remplissez ce formulaire pour demander la création d'un compte. Un
				administrateur vous contactera prochainement.
			</ThemedText>

			<form onSubmit={handleSubmit(submitData)}>
				<TextInput
					label="Nom complet"
					placeholder="Votre nom et prénom"
					required
					error={errors.name?.message}
					leftSection={<IconUser size={16} />}
					{...register("name")}
					mb="md"
					className="theme-input"
				/>

				<TextInput
					label="Email"
					placeholder="votre@email.com"
					required
					error={errors.email?.message}
					leftSection={<IconAt size={16} />}
					{...register("email")}
					mb="md"
					className="theme-input"
				/>

				<Controller
					name="institution"
					control={control}
					render={({ field }) => (
						<Select
							label="Institution"
							placeholder="Sélectionnez votre institution"
							required
							error={errors.institution?.message}
							data={[
								{ value: "CENADI", label: "CENADI" },
								{ value: "MINESUP", label: "MINESUP" },
								{ value: "IPES", label: "IPES" },
							]}
							{...field}
							mb="md"
							className="theme-input"
						/>
					)}
				/>

				<TextInput
					label="Objet"
					placeholder="Objet de votre demande"
					required
					error={errors.subject?.message}
					{...register("subject")}
					mb="md"
					className="theme-input"
				/>

				<Textarea
					label="Message"
					placeholder="Décrivez votre demande en détail..."
					required
					error={errors.message?.message}
					minRows={4}
					maxRows={8}
					autosize
					{...register("message")}
					mb="xl"
					className="theme-input"
				/>

				<Group justify="space-between">
					<Button
						variant="light"
						component={Link}
						href="/login"
						leftSection={<IconArrowLeft size={18} />}
						className="theme-button theme-button-outline"
					>
						Retour
					</Button>

					<Button
						type="submit"
						loading={loading}
						leftSection={<IconSend size={18} />}
						className="theme-button theme-button-primary"
					>
						Envoyer la demande
					</Button>
				</Group>
			</form>

			<Divider my="lg" />

			<ThemedText size="sm" ta="center">
				Vous avez déjà un compte ?{" "}
				<Anchor component={Link} href="/login" fw={700} className="theme-link">
					Connectez-vous
				</Anchor>
			</ThemedText>
		</ThemedCard>
	);
}
