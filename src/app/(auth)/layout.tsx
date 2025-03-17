"use client";

import {
	Box,
	Flex,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
	ActionIcon,
	Group,
} from "@mantine/core";
import Image from "next/image";
import {
	ThemedPageBackground,
	ThemedTitle,
	ThemedText,
	ThemedFlex,
	ThemedGroup,
} from "@/components/ui/ThemeComponents";
import classes from "./layout.module.css";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch by rendering after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleColorScheme = () => {
		setColorScheme(colorScheme === "dark" ? "light" : "dark");
	};

	if (!mounted) return null;

	const isDark = colorScheme === "dark";

	return (
		<ThemedPageBackground className={classes.wrapper}>
			<ActionIcon
				variant="subtle"
				color={isDark ? "yellow" : "blue"}
				onClick={toggleColorScheme}
				title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
				className={classes.themeToggle}
				size="lg"
			>
				{isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
			</ActionIcon>

			<ThemedFlex
				className={classes.container}
				align="center"
				justify="space-between"
			>
				<Stack className={classes.formContainer} justify="center">
					<Box className={classes.logoContainer}>
						<ThemedTitle order={1} fw={900} className={classes.logo} gradient>
							SYRAP
						</ThemedTitle>
						<ThemedText size="sm" c="dimmed" className={classes.subtitle}>
							Système de Gestion Académique
						</ThemedText>
					</Box>
					<Box className={classes.formWrapper}>{children}</Box>
					<ThemedText
						size="xs"
						c="dimmed"
						ta="center"
						mt="xl"
						className={classes.footer}
					>
						© {new Date().getFullYear()} SYRAP. Tous droits réservés.
					</ThemedText>
				</Stack>

				<Box className={classes.imageContainer}>
					<div className={classes.gradientOverlay} />
					<Image
						src={
							isDark
								? "/static/images/dark-thumbnail.png"
								: "/static/images/thumbnail.png"
						}
						alt="SYRAP"
						fill
						priority
						style={{ objectFit: "cover" }}
						className={classes.image}
					/>
					<Box className={classes.imageContent}>
						<div className={classes.glowEffect} />
						<ThemedTitle order={2} c="white" className={classes.imageTitle}>
							Plateforme de gestion académique
						</ThemedTitle>
						<ThemedText c="white" opacity={0.8} className={classes.imageText}>
							Simplifiez la gestion de vos données académiques avec notre
							solution complète
						</ThemedText>
						<ThemedGroup mt="xl" className={classes.featureIcons}>
							<div className={classes.featureIcon}>
								<div className={classes.iconCircle} />
								<ThemedText size="xs" c="white" ta="center" mt={5}>
									Sécurisé
								</ThemedText>
							</div>
							<div className={classes.featureIcon}>
								<div className={classes.iconCircle} />
								<ThemedText size="xs" c="white" ta="center" mt={5}>
									Rapide
								</ThemedText>
							</div>
							<div className={classes.featureIcon}>
								<div className={classes.iconCircle} />
								<ThemedText size="xs" c="white" ta="center" mt={5}>
									Intuitif
								</ThemedText>
							</div>
						</ThemedGroup>
					</Box>
				</Box>
			</ThemedFlex>
		</ThemedPageBackground>
	);
}
