"use client";

import { Paper, Skeleton, Stack, Group, Box } from "@mantine/core";

interface TableSkeletonProps {
	/** Nombre de lignes à afficher */
	rows?: number;
	/** Nombre de colonnes à afficher */
	columns?: number;
	/** Afficher la barre d'outils */
	showToolbar?: boolean;
}

/**
 * TableSkeleton - Skeleton léger pour le chargement des tables
 *
 * Version simplifiée pour un affichage rapide et non-intrusif
 */
export function TableSkeleton({
	rows = 5,
	columns = 4,
	showToolbar = true,
}: TableSkeletonProps) {
	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="sm">
				{/* Toolbar skeleton simple */}
				{showToolbar && (
					<Group justify="space-between" mb="xs">
						<Skeleton height={32} width={180} radius="sm" />
						<Skeleton height={32} width={100} radius="sm" />
					</Group>
				)}

				{/* Table rows skeleton - simplifié */}
				<Stack gap="xs">
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<Skeleton
							key={rowIndex}
							height={40}
							radius="sm"
							opacity={1 - (rowIndex * 0.1)} // Dégradé pour effet visuel
						/>
					))}
				</Stack>
			</Stack>
		</Paper>
	);
}

/**
 * Skeleton minimal pour chargement très rapide
 */
export function MinimalSkeleton() {
	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="sm">
				<Skeleton height={32} width="40%" radius="sm" />
				<Skeleton height={200} radius="sm" />
			</Stack>
		</Paper>
	);
}

export default TableSkeleton;
