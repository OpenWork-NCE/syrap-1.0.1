"use client";

import { Anchor, Box, Group, Text } from "@mantine/core";
import classes from "./Footer.module.css";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<Box component="footer" className={classes.footer}>
			<Group justify="space-between" align="center" wrap="wrap" gap="md">
				<Text size="sm" c="dimmed">
					© {currentYear} IPES-SCpro - Système de Coordination des Programmes des IPES
				</Text>
				<Group gap="md">
					<Anchor href="/aide" size="sm" c="dimmed" className={classes.link}>
						Aide
					</Anchor>
					<Anchor href="/documentation" size="sm" c="dimmed" className={classes.link}>
						Documentation
					</Anchor>
					<Anchor href="mailto:support@ipes-scpro.cm" size="sm" c="dimmed" className={classes.link}>
						Support
					</Anchor>
				</Group>
			</Group>
		</Box>
	);
}
