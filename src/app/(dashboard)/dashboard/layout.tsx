"use client";

import { useMemo } from "react";
import {
	AppShell,
	Burger,
	Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "@/components/Headers/AdminHeader";
import { GoodNavbar } from "@/components/GoodNavBar/GoodNavBar";
import { Footer } from "@/components/Footer";
import { navLinks, adminNavLinks } from "@/config";
import { useAuthorizations } from "@/app/context/SessionContext";
import classes from "./layout.module.css";

interface Props {
	children: React.ReactNode;
}

/**
 * DashboardLayout - Layout principal du dashboard
 *
 * Architecture simplifiée:
 * - QueryClientProvider et ModalsProvider sont au niveau racine (client-providers)
 * - Ce layout ne gère que la structure visuelle (AppShell)
 * - Navigation latérale filtrée par permissions
 * - Header avec menu utilisateur
 *
 * Note: Pas de Suspense ici car les tables lazy-loaded ont leur propre skeleton
 */
export default function DashboardLayout({ children }: Props) {
	const { authorizations } = useAuthorizations();
	const [opened, { toggle }] = useDisclosure();

	// Mémorisation des items de navigation pour éviter les recalculs
	const navItems = useMemo(() => navLinks(authorizations), [authorizations]);
	const adminNavItems = useMemo(() => adminNavLinks(authorizations), [authorizations]);

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 280,
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			}}
			padding="lg"
			transitionDuration={200}
			transitionTimingFunction="ease-out"
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

			<AppShell.Main className={classes.main}>
				<Stack gap={0} mih="calc(100vh - 60px - var(--mantine-spacing-lg) * 2)">
					<div style={{ flex: 1 }}>
						{children}
					</div>
					<Footer />
				</Stack>
			</AppShell.Main>
		</AppShell>
	);
}
