"use client";

import { ActionIcon, Box, Drawer, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconSearch, IconSettings } from "@tabler/icons-react";
import classes from "./AdminHeader.module.css";
import { DirectionSwitcher } from "../DirectionSwitcher/DirectionSwitcher";
import { Logo } from "../Logo/Logo";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { useRouter } from "next/navigation";
import { PATH_AUTHENTICATIONS, PATH_BOARD } from "@/routes";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";

interface Props {
	burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
	const { push } = useRouter();
	// const [opened, { close, open }] = useDisclosure(false);
	const { resetAuthorizations } = useAuthorizations();
	const { resetInstitution } = useInstitution();

	return (
		<header className={classes.header}>
			{burger && burger}
			<Logo />
			<Box style={{ flex: 1 }} />
			{/*<ActionIcon onClick={open} variant="subtle">*/}
			{/*	<IconSettings size="1.25rem" />*/}
			{/*</ActionIcon>*/}
			<ThemeSwitcher />
			<ActionIcon
				onClick={async () => {
					await fetchJson(await internalApiUrl(`/api/auth/logout`), {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
					})
						.then(async () => {
							notifications.show({
								color: "green",
								title: "Deconnexion reussie.",
								message: "Vous allez être redirigé vers la page de login",
							});
							// // redirect to callback url
							// const institution = await getCurrentUserInstitution();
							// // redirect to callback url
							// institution == 'Ipes'
							//   ? push(PATH_BOARD.ipes)
							//   : institution == 'Minesup'
							//     ? push(PATH_BOARD.minesup)
							//     : push(PATH_BOARD.cenadi);
							resetAuthorizations();
							resetInstitution();
							push(PATH_AUTHENTICATIONS.login);
						})
						.catch((error) => {
							notifications.show({
								color: "red",
								title: "Echec de la deconnexion.",
								message: "Une erreur inatendue est survenue.",
							});
							console.log(error);
						});
				}}
				variant="subtle"
			>
				<IconLogout size="1.25rem" />
			</ActionIcon>

			{/*<Drawer*/}
			{/*	opened={opened}*/}
			{/*	onClose={close}*/}
			{/*	title="Settings"*/}
			{/*	position="right"*/}
			{/*	transitionProps={{ duration: 0 }}*/}
			{/*>*/}
			{/*	<Stack gap="lg">*/}
			{/*		<DirectionSwitcher />*/}
			{/*	</Stack>*/}
			{/*</Drawer>*/}
		</header>
	);
}
