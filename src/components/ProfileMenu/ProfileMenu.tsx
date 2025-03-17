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
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import { useInstitution } from "@/app/context/InstitutionContext";
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
				resetAuthorizations();
				resetInstitution();
				router.push(PATH_AUTHENTICATIONS.login);
			})
			.catch((error) => {
				notifications.show({
					color: "red",
					title: "Echec de la deconnexion.",
					message: "Une erreur inatendue est survenue.",
				});
				console.log(error);
			});
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
					Profile Settings
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
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
