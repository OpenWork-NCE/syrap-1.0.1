"use client";

import {
	Box,
	Stack,
	useMantineColorScheme,
	ActionIcon,
} from "@mantine/core";
import {
	ThemedPageBackground,
	ThemedTitle,
	ThemedText,
	ThemedFlex,
	ThemedGroup,
} from "@/components/ui/ThemeComponents";
import { AuthIllustration } from "@/components/Auth/AuthIllustration";
import classes from "./layout.module.css";
import { IconSun, IconMoon, IconShieldCheck, IconRocket, IconSparkles } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const [mounted, setMounted] = useState(false);

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
				{/* Left Panel - Form */}
				<Stack className={classes.formContainer} justify="center">
					<Box className={classes.logoContainer}>
						<ThemedTitle order={1} fw={800} className={classes.logo}>
							IPES-SCpro
						</ThemedTitle>
						<ThemedText size="sm" c="dimmed" className={classes.subtitle}>
							Système de Coordination des programmes des IPES
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
						© {new Date().getFullYear()} IPES-SCpro. Tous droits réservés.
					</ThemedText>
				</Stack>

				{/* Right Panel - Illustration */}
				<Box className={classes.imageContainer}>
					<div className={classes.gradientBackground} />

					<Box className={classes.illustrationWrapper}>
						<AuthIllustration className={classes.illustration} />
					</Box>

					<Box className={classes.imageContent}>
						<ThemedTitle order={2} className={classes.imageTitle}>
							Consultations&nbsp;&nbsp;•&nbsp;&nbsp;Coordination&nbsp;&nbsp;•&nbsp;&nbsp;Conseils
						</ThemedTitle>
						<ThemedText className={classes.imageText}>
							Plateforme centralisée pour la gestion et l'harmonisation des programmes
							des Instituts Privés d'Enseignement Supérieur du Cameroun.
						</ThemedText>

						<ThemedGroup mt="xl" className={classes.featureIcons}>
							<div className={classes.featureItem}>
								<div className={classes.featureIconBox}>
									<IconShieldCheck size={22} color="white" />
								</div>
								<ThemedText size="sm" className={classes.featureLabel}>
									Sécurisé
								</ThemedText>
							</div>
							<div className={classes.featureItem}>
								<div className={classes.featureIconBox}>
									<IconRocket size={22} color="white" />
								</div>
								<ThemedText size="sm" className={classes.featureLabel}>
									Rapide
								</ThemedText>
							</div>
							<div className={classes.featureItem}>
								<div className={classes.featureIconBox}>
									<IconSparkles size={22} color="white" />
								</div>
								<ThemedText size="sm" className={classes.featureLabel}>
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
