"use client";

import {
	Anchor,
	Box,
	Button,
	Card,
	Center,
	Container,
	Group,
	Paper,
	PasswordInput,
	Text,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { PATH_AUTHENTICATIONS } from "@/routes";
import { IconArrowLeft, IconCheck, IconLock } from "@tabler/icons-react";
import classes from "./ResetPassword.module.css";

export function ResetPassword() {
	const { push } = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [tokenValid, setTokenValid] = useState<boolean | null>(null);
	const [tokenChecking, setTokenChecking] = useState<boolean>(true);

	const resetSchema = useMemo(
		() =>
			z
				.object({
					password: z
						.string({ required_error: "Le mot de passe est requis" })
						.min(8, "Le mot de passe doit contenir au moins 8 caractères")
						.regex(
							/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
							"Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial",
						),
					confirmPassword: z.string({
						required_error: "Veuillez confirmer votre mot de passe",
					}),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Les mots de passe ne correspondent pas",
					path: ["confirmPassword"],
				}),
		[],
	);

	// Verify token validity
	useEffect(() => {
		if (!token) {
			setTokenValid(false);
			setTokenChecking(false);
			return;
		}

		const verifyToken = async () => {
			try {
				const response = await fetchJson(
					await internalApiUrl(`/api/auth/verify-reset-token`),
					{
						method: "POST",
						body: JSON.stringify({ token }),
						headers: {
							"Content-Type": "application/json",
						},
					},
				);
				setTokenValid(true);
			} catch (error) {
				setTokenValid(false);
				notifications.show({
					color: "red",
					title: "Lien invalide ou expiré",
					message: "Veuillez demander un nouveau lien de réinitialisation",
				});
			} finally {
				setTokenChecking(false);
			}
		};

		verifyToken();
	}, [token]);

	const submitData: SubmitHandler<z.infer<typeof resetSchema>> = async (
		data,
	) => {
		if (!token) return;

		setLoading(true);

		await fetchJson(await internalApiUrl(`/api/auth/reset-password`), {
			method: "POST",
			body: JSON.stringify({
				token,
				password: data.password,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async () => {
				notifications.show({
					color: "green",
					title: "Mot de passe réinitialisé avec succès",
					message:
						"Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
					icon: <IconCheck size="1.1rem" />,
				});
				setTimeout(() => {
					push(PATH_AUTHENTICATIONS.login);
				}, 2000);
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Échec de la réinitialisation",
					message: "Une erreur est survenue. Veuillez réessayer.",
				});
				setLoading(false);
			});
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof resetSchema>>({
		resolver: zodResolver(resetSchema),
	});

	if (tokenChecking) {
		return (
			<Container size="sm" my={30}>
				<Paper
					className={classes.formContainer}
					withBorder
					p="xl"
					radius="md"
					shadow="md"
				>
					<Center>
						<Text>Vérification du lien de réinitialisation...</Text>
					</Center>
				</Paper>
			</Container>
		);
	}

	if (tokenValid === false) {
		return (
			<Container size="sm" my={30}>
				<Paper
					className={classes.formContainer}
					withBorder
					p="xl"
					radius="md"
					shadow="md"
				>
					<Center>
						<IconLock size={50} color="red" />
					</Center>
					<Text ta="center" fz="lg" fw={500} mt="md">
						Lien invalide ou expiré
					</Text>
					<Text ta="center" c="dimmed" fz="sm">
						Le lien de réinitialisation est invalide ou a expiré. Veuillez
						demander un nouveau lien.
					</Text>
					<Button
						fullWidth
						mt="xl"
						component="a"
						href="/forgot-password"
						className={classes.control}
					>
						Demander un nouveau lien
					</Button>
				</Paper>
			</Container>
		);
	}

	return (
		<Container size="sm" my={30}>
			<Text className={classes.title} ta="center">
				Réinitialisation du mot de passe
			</Text>
			<Text c="dimmed" fz="sm" ta="center">
				Créez un nouveau mot de passe sécurisé
			</Text>

			<Paper
				className={classes.formContainer}
				withBorder
				shadow="md"
				p={30}
				radius="md"
				mt="xl"
			>
				<form onSubmit={handleSubmit(submitData)}>
					<PasswordInput
						label="Nouveau mot de passe"
						placeholder="Votre nouveau mot de passe"
						required
						error={errors.password?.message}
						{...register("password")}
					/>
					<PasswordInput
						mt="md"
						label="Confirmer le mot de passe"
						placeholder="Confirmez votre mot de passe"
						required
						error={errors.confirmPassword?.message}
						{...register("confirmPassword")}
					/>
					<Group justify="space-between" mt="lg" className={classes.controls}>
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
						<Button loading={loading} type="submit" className={classes.control}>
							Réinitialiser le mot de passe
						</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
