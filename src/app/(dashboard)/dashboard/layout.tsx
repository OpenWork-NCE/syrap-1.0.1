"use client";

import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "@/components/Headers/AdminHeader";
import { GoodNavbar } from "@/components/GoodNavBar/GoodNavBar";
import { navLinks, adminNavLinks } from "@/config";
import { useAuthorizations } from "@/app/context/AuthorizationsContext";
import classes from "./layout.module.css";
import { AppProvider } from "@/app/provider";
import { ModalsProvider } from "@mantine/modals";

interface Props {
	children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function DashboardLayout({ children }: Props) {
	const { authorizations } = useAuthorizations();
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	const navItems = navLinks(authorizations);
	const adminNavItems = adminNavLinks(authorizations);
	console.log("J'affiche ceci")

	return (
		<AppProvider>
			<ModalsProvider>
				<QueryClientProvider client={queryClient}>
				<AppShell
					header={{ height: 60 }}
					navbar={{
						width: 300,
						breakpoint: "sm",
						collapsed: { mobile: !opened },
					}}
					padding="md"
					transitionDuration={500}
					transitionTimingFunction="ease"
					className={classes.appShell}
					layout="default"
				>
					<AppShell.Navbar className={classes.navbar}>
						<GoodNavbar data={navItems} adminData={adminNavItems} hidden={!opened} />
					</AppShell.Navbar>
					<AppShell.Header className={classes.header}>
						<AdminHeader
							burger={
								<Burger
									opened={opened}
									onClick={toggle}
									hiddenFrom="sm"
									size="sm"
									mr="xl"
								/>
							}
						/>
					</AppShell.Header>
					<AppShell.Main className={classes.main}>{children}</AppShell.Main>
					<AppShell.Footer className={classes.footer}>
						<Text w="full" size="sm" c="gray" ta="center">
							© {new Date().getFullYear()} SYHPUI. Tous droits réservés.
						</Text>
					</AppShell.Footer>
				</AppShell>
				</QueryClientProvider>
			</ModalsProvider>
		</AppProvider>
	);
}
