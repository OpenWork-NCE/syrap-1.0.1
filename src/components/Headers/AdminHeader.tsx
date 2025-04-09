"use client";

import { ActionIcon, Box, Drawer, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconSearch, IconSettings } from "@tabler/icons-react";
import classes from "./AdminHeader.module.css";
import { Logo } from "../Logo/Logo";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { useRouter } from "next/navigation";
import { PATH_AUTHENTICATIONS, PATH_BOARD } from "@/routes";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";
import { useUser } from "@/app/context/UserContext";
import { ProfileMenu } from "../ProfileMenu/ProfileMenu";

interface Props {
	burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
	const { push } = useRouter();
	// const [opened, { close, open }] = useDisclosure(false);
	const { user } = useUser();
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
			<div className={classes.rightSection}>
				<ThemeSwitcher />
				<ProfileMenu
					image={"/profile.png"}
					name={user.name}
					email={user.email}
				/>
			</div>

			{/*<Drawer*/}
			{/*	opened={opened}*/}
			{/*	onClose={close}*/}
			{/*	title="Settings"*/}
			{/*	position="right"*/}
			{/*	transitionProps={{ duration: 0 }}*/}
			{/*>*/}
			{/*	<Stack gap="lg">*/}
			{/*	</Stack>*/}
			{/*</Drawer>*/}
		</header>
	);
}
