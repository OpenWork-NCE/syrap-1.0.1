"use client";

import {
	Anchor,
	Box,
	Button,
	Card,
	Center,
	Checkbox,
	Container,
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
import { PATH_AUTHENTICATIONS } from "@/routes";
import { IconArrowLeft } from "@tabler/icons-react";
import classes from "./ForgotPassword.module.css";

export function ForgotPassword() {
	const { push } = useRouter();
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const supportSchema = useMemo(
		() =>
			z.object({
				email: z
					.string({ required_error: "Une addresse mail est requise." })
					.email("L'adresse mail doit être valide."),
			}),
		[],
	);

	const submitData: SubmitHandler<z.infer<typeof supportSchema>> = async (
		data,
	) => {
		setLoading(true);

		await fetchJson(await internalApiUrl(`/api/auth/forgotPassword`), {
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
		<Container style={{ width: "100%" }} my={30}>
			<Text className={classes.title} ta="center">
				Mot de passe oublié ?
			</Text>
			<Text c="dimmed" fz="sm" ta="center">
				Entrez votre mail afin de recevoir le mail de reinitialisation
			</Text>
			<form onSubmit={handleSubmit(submitData)}>
				<Paper withBorder shadow="md" p={30} radius="md" mt="xl">
					<TextInput
						label="Votre mail"
						placeholder="me@user.dev"
						required
						{...register("email")}
					/>
					<Group justify="space-between" mt="lg" className={classes.controls}>
						<Anchor
							c="dimmed"
							size="sm"
							href={"/login"}
							className={classes.control}
						>
							<Center inline>
								<IconArrowLeft style={{ width: 12, height: 12 }} stroke={1.5} />
								<Box ml={5}>Retourner au login</Box>
							</Center>
						</Anchor>
						<Button
							loading={loading}
							type={"submit"}
							className={classes.control}
						>
							Réinitialiser le mot de passe
						</Button>
					</Group>
				</Paper>
			</form>
		</Container>
	);
}
