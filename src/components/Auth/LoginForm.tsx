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
	Text,
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
import { PATH_BOARD } from "@/routes";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

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
					.string({ required_error: "Une addresse mail est requise." })
					.email("L'adresse mail doit être valide."),
				password: z.string({ required_error: "Un mot de pase est requis." }),
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
					title: "Authentification reussie.",
					message: "Vous allez être redirigé vers votre Board",
				});
				setInstitution(data.institution);
				setAuthorizations(data.authorizations);
				// // redirect to callback url
				// const institution = await getCurrentUserInstitution();
				// // redirect to callback url
				// institution == 'Ipes'
				//   ? push(PATH_BOARD.ipes)
				//   : institution == 'Minesup'
				//     ? push(PATH_BOARD.minesup)
				//     : push(PATH_BOARD.cenadi);
				push(PATH_BOARD.root);
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Echec de l'authentification.",
					message: "Verifiez vos informations et reessayez.",
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
	});

	return (
		<Card withBorder shadow="md" p={30} mt={30} radius="md">
			<form onSubmit={handleSubmit(submitData)}>
				<TextInput
					label="Votre mail"
					placeholder="moi@syrap.admin"
					required
					error={errors.email?.message}
					autoFocus
					{...register("email")}
				/>
				<PasswordInput
					label="Votre mot de passe"
					placeholder="Votre mot de passe"
					required
					mt="md"
					error={errors.password?.message}
					autoComplete="current-password"
					{...register("password")}
				/>
				{/*<Select*/}
				{/*  label="Role utilisateur"*/}
				{/*  placeholder="Choisir le rôle utilisateur"*/}
				{/*  required*/}
				{/*  mt="md"*/}
				{/*  data={['Cenadi', 'Minesup', 'Ipes']}*/}
				{/*  {...form.getInputProps('role')}*/}
				{/*/>*/}
				<Group justify="space-between" mt="lg">
					<Checkbox
						label="Se souvenir de moi"
						error={errors.stayConnected?.message}
						{...register("stayConnected", {})}
					/>
					<Text component={Link} href={"/forgot-password"} size="sm">
						Mot de passe oublié ?
					</Text>
				</Group>
				<Button fullWidth mt="xl" type="submit" loading={loading}>
					Se connecter
				</Button>
			</form>
		</Card>
	);
}
