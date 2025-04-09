"use client";

import {
	Anchor,
	Button,
	Checkbox,
	Divider,
	Group,
	PasswordInput,
	TextInput,
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
import { IconAt, IconLock, IconLogin } from "@tabler/icons-react";
import {
	ThemedAuthCard,
	ThemedTitle,
	ThemedText,
	ThemedButton,
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
		data,
	) => {
		setLoading(true);

		const callbackUrlData = await fetch(
			await internalApiUrl(`/api/auth/callback`),
		).then(async (res) => (await res.json()) as { callbackUrl: string });

		await fetchJson(await internalApiUrl(`/api/auth/login`), {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async (data) => {
				notifications.show({
					color: "green",
					title: "Authentification réussie",
					message: "Vous allez être redirigé vers votre tableau de bord",
				});
				setInstitution(data.institution);
				setAuthorizations(data.authorizations);
				push(PATH_BOARD.root);
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Échec de l'authentification",
					message: "Vérifiez vos informations et réessayez",
				});

				// we stop the loading only when the authentification has failed
				setLoading(false);
			});
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
			withBorder
			shadow="md"
			p={30}
			mt={30}
			radius="md"
			className={classes.card}
		>
			<ThemedTitle order={2} ta="center" mt="md" mb={30} gradient>
				Connexion à SYHPUI
			</ThemedTitle>

			<form onSubmit={handleSubmit(submitData)}>
				<TextInput
					label="Adresse email"
					placeholder="votre@email.com"
					required
					error={errors.email?.message}
					autoFocus
					leftSection={<IconAt size={16} />}
					{...register("email")}
					mb="md"
					className="theme-input"
				/>
				<PasswordInput
					label="Mot de passe"
					placeholder="Votre mot de passe"
					required
					error={errors.password?.message}
					autoComplete="current-password"
					leftSection={<IconLock size={16} />}
					{...register("password")}
					className="theme-input"
				/>

				<ThemedGroup justify="space-between" mt="lg">
					<Checkbox
						label="Se souvenir de moi"
						error={errors.stayConnected?.message}
						{...register("stayConnected", {})}
					/>
					<Anchor
						component={Link}
						href="/forgot-password"
						size="sm"
						className={classes.forgotLink}
					>
						Mot de passe oublié ?
					</Anchor>
				</ThemedGroup>

				<Button
					fullWidth
					mt="xl"
					type="submit"
					loading={loading}
					leftSection={<IconLogin size={18} />}
					className={`${classes.submitButton} theme-button theme-button-primary`}
				>
					Se connecter
				</Button>
			</form>

			<Divider my="lg" label="Besoin d'aide ?" labelPosition="center" />

			<ThemedText size="sm" ta="center">
				Vous n'avez pas de compte ?{" "}
				<Anchor component={Link} href="/support" fw={700}>
					Contactez l'administrateur
				</Anchor>
			</ThemedText>
		</ThemedAuthCard>
	);
}
