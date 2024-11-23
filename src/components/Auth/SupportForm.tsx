"use client";

import {
	Anchor,
	Button,
	Card,
	Center,
	Checkbox,
	Group,
	Paper,
	PasswordInput,
	Select,
	SimpleGrid,
	Text,
	Textarea,
	TextInput,
	TextProps,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { PATH_AUTHENTICATIONS, PATH_BOARD } from "@/routes";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

export function SupportForm() {
	const { push } = useRouter();
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const supportSchema = useMemo(
		() =>
			z.object({
				name: z
					.string({ required_error: "Ce champ est requis." })
					.trim()
					.min(2),
				email: z
					.string({ required_error: "Une addresse mail est requise." })
					.email("L'adresse mail doit être valide."),
				subject: z.string({ required_error: "Ce champ est requis." }),
				message: z.string({ required_error: "Veuillez entrer un message." }),
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
			.then(async (data) => {
				notifications.show({
					color: "green",
					title: "Message envoyé avec succès.",
					message: "Vous serrez repondu sous peu.",
				});
				setTimeout(async () => {
					push(PATH_AUTHENTICATIONS.login);
				}, 2000);
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Echec de l'envoi du message.",
					message: "Il se peut que nous rencontrions des soucis techniques.",
				});
				setLoading(false);
			});
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof supportSchema>>({
		resolver: zodResolver(supportSchema),
	});

	useEffect(() => {
		if (!initiated.current) {
			initiated.current = true;
		}
	});

	return (
		<Card shadow="md" p={30} mt={30} radius="md">
			<form onSubmit={handleSubmit(submitData)}>
				<Text size="xl" ta="center">
					Contactez l'administration
				</Text>

				<TextInput
					label="Nom"
					placeholder="Votre nom"
					variant="filled"
					mt="md"
					{...register("name")}
				/>
				<TextInput
					label="Email"
					placeholder="Votre email"
					variant="filled"
					mt="md"
					{...register("email")}
				/>

				<TextInput
					label="Object"
					placeholder="Object du message"
					mt="md"
					variant="filled"
					{...register("subject")}
				/>
				<Textarea
					mt="md"
					label="Message"
					placeholder="Votre message"
					maxRows={10}
					minRows={5}
					autosize
					variant="filled"
					{...register("message")}
				/>
				<Group justify="center" mt="xl">
					<Button type="submit" size="md" loading={loading}>
						Envoyer le message
					</Button>
				</Group>
			</form>
		</Card>
	);
}
