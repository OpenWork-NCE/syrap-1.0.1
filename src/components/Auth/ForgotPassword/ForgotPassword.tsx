"use client";

import {
	Anchor,
	Box,
	Button,
	Center,
	Container,
	Group,
	Paper,
	TextInput,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { PATH_AUTHENTICATIONS } from "@/routes";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import {
	ThemedText,
	ThemedTitle,
	ThemedButton,
	ThemedGroup,
	ThemedPaper,
	ThemedContainer,
} from "@/components/ui/ThemeComponents";
import classes from "./ForgotPassword.module.css";

export function ForgotPassword() {
	const { push } = useRouter();
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [emailSent, setEmailSent] = useState<boolean>(false);

	const forgotPasswordSchema = useMemo(
		() =>
			z.object({
				email: z
					.string({ required_error: "Une adresse mail est requise." })
					.email("L'adresse mail doit être valide."),
			}),
		[],
	);

	const submitData: SubmitHandler<
		z.infer<typeof forgotPasswordSchema>
	> = async (data) => {
		setLoading(true);

		await fetchJson(await internalApiUrl(`/api/auth/forgot-password`), {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async () => {
				setEmailSent(true);
				notifications.show({
					color: "green",
					title: "Email envoyé avec succès",
					message:
						"Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
					icon: <IconCheck size="1.1rem" />,
				});
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Échec de l'envoi",
					message: "Une erreur est survenue. Veuillez réessayer.",
				});
				setLoading(false);
			});
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	useEffect(() => {
		if (!initiated.current) {
			initiated.current = true;
		}
	}, []);

	if (emailSent) {
		return (
			<ThemedContainer size="sm" my={30}>
				<ThemedPaper
					className={classes.formContainer}
					withBorder
					p="xl"
					radius="md"
					shadow="md"
				>
					<Center>
						<IconCheck size={50} color="green" />
					</Center>
					<ThemedTitle ta="center" order={3} mt="md">
						Email envoyé avec succès
					</ThemedTitle>
					<ThemedText ta="center" c="dimmed" fz="sm">
						Nous avons envoyé un lien de réinitialisation à votre adresse email.
						Veuillez vérifier votre boîte de réception et suivre les
						instructions.
					</ThemedText>
					<Button
						fullWidth
						mt="xl"
						component="a"
						href="/login"
						className={`${classes.control} theme-button theme-button-primary`}
					>
						Retour à la connexion
					</Button>
				</ThemedPaper>
			</ThemedContainer>
		);
	}

	return (
		<ThemedContainer size="sm" my={30}>
			<ThemedTitle className={classes.title} ta="center" gradient>
				Mot de passe oublié ?
			</ThemedTitle>
			<ThemedText c="dimmed" fz="sm" ta="center">
				Entrez votre adresse email pour recevoir un lien de réinitialisation
			</ThemedText>

			<ThemedPaper
				className={classes.formContainer}
				withBorder
				shadow="md"
				p={30}
				radius="md"
				mt="xl"
			>
				<form onSubmit={handleSubmit(submitData)}>
					<TextInput
						label="Adresse email"
						placeholder="votre@email.com"
						required
						error={errors.email?.message}
						{...register("email")}
						className="theme-input"
					/>
					<ThemedGroup
						justify="space-between"
						mt="lg"
						className={classes.controls}
					>
						<Anchor
							c="dimmed"
							size="sm"
							href="/login"
							className={classes.control}
						>
							<Center inline>
								<IconArrowLeft style={{ width: 12, height: 12 }} stroke={1.5} />
								<Box ml={5}>Retour à la connexion</Box>
							</Center>
						</Anchor>
						<Button
							loading={loading}
							type="submit"
							className={`${classes.control} theme-button theme-button-primary`}
						>
							Réinitialiser le mot de passe
						</Button>
					</ThemedGroup>
				</form>
			</ThemedPaper>
		</ThemedContainer>
	);
}
