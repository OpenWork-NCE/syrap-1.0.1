"use client";

import {
	Anchor,
	Button,
	Checkbox,
	Divider,
	PasswordInput,
	TextInput,
	Text,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { PATH_BOARD } from "@/routes";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";
import { IconAt, IconLock, IconArrowRight } from "@tabler/icons-react";
import {
	ThemedAuthCard,
	ThemedText,
	ThemedGroup,
} from "@/components/ui/ThemeComponents";
import classes from "./LoginForm.module.css";

export function LoginForm() {
	const { resetAuthorizations, setAuthorizations } = useAuthorizations();
	const { resetInstitution, setInstitution } = useInstitution();
	const { push } = useRouter();
	const initiated = useRef<Boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const loginSchema = useMemo(
		() =>
			z.object({
				email: z
					.string({ required_error: "Une adresse mail est requise." })
					.email("L'adresse mail doit être valide."),
				password: z.string({ required_error: "Un mot de passe est requis." }),
				stayConnected: z.boolean().default(false).optional(),
			}),
		[],
	);

	const submitData: SubmitHandler<z.infer<typeof loginSchema>> = async (
		formData,
	) => {
		setLoading(true);

		try {
			// Récupérer le callback URL si disponible
			const callbackUrlData = await fetch(
				internalApiUrl(`/api/auth/callback`),
			).then(async (res) => (await res.json()) as { callbackUrl: string });

			// Effectuer le login
			const response = await fetchJson<{
				institution: { id: string; name: string; slug: string; model: string };
				authorizations: string[];
			}>(internalApiUrl(`/api/auth/login`), {
				method: "POST",
				body: JSON.stringify(formData),
				headers: {
					"Content-Type": "application/json",
				},
			});

			notifications.show({
				color: "green",
				title: "Authentification réussie",
				message: "Vous allez être redirigé vers votre tableau de bord",
			});

			// Gérer les valeurs null de l'institution
			const institution = response.institution ?? {
				id: "",
				name: "",
				slug: "",
				model: "",
			};

			setInstitution(institution);
			setAuthorizations(response.authorizations ?? []);
			push(callbackUrlData?.callbackUrl || PATH_BOARD.root);
		} catch (error) {
			console.error("Login error:", error);
			notifications.show({
				color: "red",
				title: "Échec de l'authentification",
				message: "Vérifiez vos informations et réessayez",
			});
		} finally {
			setLoading(false);
		}
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		if (!initiated.current) {
			initiated.current = true;
		}
	}, []);

	return (
		<ThemedAuthCard
			withBorder={false}
			shadow="none"
			p={32}
			radius="lg"
			className={classes.card}
		>
			<Text
				ta="center"
				mb={32}
				fw={700}
				size="xl"
				style={{
					background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text",
				}}
			>
				Connexion
			</Text>

			<form onSubmit={handleSubmit(submitData)}>
				<TextInput
					label="Adresse email"
					placeholder="votre@email.com"
					required
					error={errors.email?.message}
					autoFocus
					leftSection={<IconAt size={18} stroke={1.5} />}
					{...register("email")}
					mb="md"
					size="md"
					className="theme-input"
				/>
				<PasswordInput
					label="Mot de passe"
					placeholder="Votre mot de passe"
					required
					error={errors.password?.message}
					autoComplete="current-password"
					leftSection={<IconLock size={18} stroke={1.5} />}
					{...register("password")}
					size="md"
					className="theme-input"
				/>

				<ThemedGroup justify="space-between" mt="lg">
					<Checkbox
						label="Se souvenir de moi"
						error={errors.stayConnected?.message}
						{...register("stayConnected", {})}
						styles={{
							label: { cursor: "pointer" },
							input: { cursor: "pointer" },
						}}
					/>
				</ThemedGroup>

				<Button
					fullWidth
					mt="xl"
					type="submit"
					loading={loading}
					rightSection={!loading && <IconArrowRight size={18} />}
					className={classes.submitButton}
				>
					Se connecter
				</Button>
			</form>

			<Divider
				my="lg"
				label="Besoin d'aide ?"
				labelPosition="center"
				styles={{
					label: {
						fontSize: "0.8rem",
						color: "var(--mantine-color-dimmed)",
					},
				}}
			/>

			<ThemedText size="sm" ta="center" c="dimmed">
				Pas encore de compte ?{" "}
				<Anchor
					component={Link}
					href="/support"
					fw={600}
					style={{
						color: "#10b981",
						textDecoration: "none",
					}}
				>
					Contactez l'administrateur
				</Anchor>
			</ThemedText>
		</ThemedAuthCard>
	);
}
