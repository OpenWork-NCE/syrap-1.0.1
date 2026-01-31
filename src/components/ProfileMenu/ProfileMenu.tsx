"use client";

import {
	Avatar,
	Divider,
	Flex,
	Group,
	Menu,
	Text,
	UnstyledButton,
	useMantineColorScheme,
} from "@mantine/core";
import { ThemedText } from "@/components/ui/ThemeComponents";
import classes from "./ProfileMenu.module.css";
import { useRouter } from "next/navigation";
import { PATH_AUTHENTICATIONS } from "@/routes";
import { fetchJson, internalApiUrl } from "@/app/lib/utils";
import { notifications } from "@mantine/notifications";
import { useAuthorizations, useInstitution } from "@/app/context/SessionContext";
import {
	IconChevronRight,
	IconLogout,
	IconMoonStars,
	IconSettings,
	IconSun,
	IconUser,
} from "@tabler/icons-react";

interface ProfileMenuProps {
	image: string;
	name: string;
	email: string;
}

export function ProfileMenu({ image, name, email }: ProfileMenuProps) {
	const router = useRouter();
	const { resetAuthorizations } = useAuthorizations();
	const { resetInstitution } = useInstitution();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const handleLogout = async () => {
		try {
			await fetchJson(internalApiUrl(`/api/auth/logout`), {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});
			notifications.show({
				color: "green",
				title: "Déconnexion réussie.",
				message: "Vous allez être redirigé vers la page de login",
			});
		} catch (error) {
			// Même en cas d'erreur, on déconnecte l'utilisateur localement
			console.warn("Logout API error (proceeding anyway):", error);
		} finally {
			// Toujours nettoyer l'état local et rediriger
			resetAuthorizations();
			resetInstitution();
			router.push(PATH_AUTHENTICATIONS.login);
		}
	};

	return (
		<Menu
			position="bottom-end"
			offset={5}
			withArrow
			arrowPosition="center"
			classNames={{ dropdown: classes.dropdown }}
			trigger="click"
		>
			<Menu.Target>
				<UnstyledButton className={classes.user}>
					<Avatar src={image} radius="xl" size="md" />
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>
				<div className={classes.header}>
					<Avatar
						src={image}
						radius="xl"
						size="lg"
						className={classes.avatar}
					/>
					<div>
						<Text fw={500} size="sm">
							{name}
						</Text>
						<Text size="xs" c="dimmed">
							{email}
						</Text>
					</div>
				</div>

				<Divider />

				<Menu.Item
					leftSection={<IconUser size={16} />}
					rightSection={<IconChevronRight size={12} />}
					component="a"
					href="/profile"
					className={classes.menuItem}
				>
					Préférences
				</Menu.Item>

				<Menu.Item
					leftSection={
						dark ? <IconSun size={16} /> : <IconMoonStars size={16} />
					}
					onClick={() => toggleColorScheme()}
					className={classes.menuItem}
				>
					{dark ? "Light Mode" : "Dark Mode"}
				</Menu.Item>

				<Divider />

				<Menu.Item
					color="red"
					leftSection={<IconLogout size={16} />}
					onClick={handleLogout}
					className={classes.menuItem}
				>
					Se deconnecter
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
