"use client";

import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

/**
 * Tables avec lazy loading
 *
 * Ces exports utilisent next/dynamic pour charger les composants tables
 * uniquement quand ils sont nécessaires, réduisant ainsi le bundle initial.
 *
 * Avantages:
 * - Réduction du temps de chargement initial
 * - Code splitting automatique
 * - Meilleure expérience utilisateur avec skeletons
 */

// Table IPES (~900 lignes) - Chargement différé
export const LazyIpessTable = dynamic(
	() => import("@/components/IpessTable/IpessTable"),
	{
		loading: () => <TableSkeleton rows={8} columns={5} />,
		ssr: false, // Désactive SSR pour les tables interactives
	}
);

// Table Universités (~800 lignes) - Chargement différé
export const LazyUniversitiesTable = dynamic(
	() => import("@/components/UniversitiesTable/UniversitiesTable"),
	{
		loading: () => <TableSkeleton rows={8} columns={5} />,
		ssr: false,
	}
);

// Table Utilisateurs (~700 lignes) - Chargement différé
export const LazyUsersTable = dynamic(
	() => import("@/components/UsersTable/UsersTable"),
	{
		loading: () => <TableSkeleton rows={8} columns={6} />,
		ssr: false,
	}
);

// Table UEs (~600 lignes) - Chargement différé
export const LazyUesTable = dynamic(
	() => import("@/components/UesTable/UesTable"),
	{
		loading: () => <TableSkeleton rows={8} columns={4} />,
		ssr: false,
	}
);

// Table Profils/Rôles - Chargement différé
export const LazyProfilesTable = dynamic(
	() => import("@/components/ProfilesTable/ProfilesTable"),
	{
		loading: () => <TableSkeleton rows={6} columns={4} />,
		ssr: false,
	}
);

// Table Branches/Filières - Chargement différé
export const LazyBranchesTable = dynamic(
	() => import("@/components/BranchesTable/BranchesTable"),
	{
		loading: () => <TableSkeleton rows={6} columns={3} />,
		ssr: false,
	}
);

// Table Niveaux - Chargement différé
export const LazyLevelsTable = dynamic(
	() => import("@/components/LevelsTable/LevelsTable"),
	{
		loading: () => <TableSkeleton rows={6} columns={3} />,
		ssr: false,
	}
);

// Table CENADI - Chargement différé
export const LazyCenadisTable = dynamic(
	() => import("@/components/CenadisTable/CenadisTable"),
	{
		loading: () => <TableSkeleton rows={6} columns={4} />,
		ssr: false,
	}
);

// Table MINESUP - Chargement différé
export const LazyMinesupsTable = dynamic(
	() => import("@/components/MinesupsTable/MinesupsTable"),
	{
		loading: () => <TableSkeleton rows={6} columns={4} />,
		ssr: false,
	}
);
