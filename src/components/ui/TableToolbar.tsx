"use client";

import { ReactNode } from "react";
import {
	ActionIcon,
	Button,
	Group,
	Menu,
	TextInput,
	Tooltip,
	Box,
	Text,
} from "@mantine/core";
import {
	IconDownload,
	IconFileTypeCsv,
	IconFileTypePdf,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconTableExport,
	IconFilter,
	IconFilterOff,
} from "@tabler/icons-react";

interface TableToolbarProps {
	/** Titre de la table (optionnel) */
	title?: string;
	/** Valeur du filtre global */
	globalFilter?: string;
	/** Callback pour changement de filtre */
	onGlobalFilterChange?: (value: string) => void;
	/** Afficher le bouton d'ajout */
	showAddButton?: boolean;
	/** Label du bouton d'ajout */
	addButtonLabel?: string;
	/** Callback pour ajout */
	onAdd?: () => void;
	/** Désactiver le bouton d'ajout */
	addButtonDisabled?: boolean;
	/** Afficher le bouton de rafraîchissement */
	showRefreshButton?: boolean;
	/** Callback pour rafraîchissement */
	onRefresh?: () => void;
	/** Chargement en cours */
	isLoading?: boolean;
	/** Afficher les boutons d'export */
	showExportButtons?: boolean;
	/** Callback pour export CSV */
	onExportCsv?: () => void;
	/** Callback pour export PDF */
	onExportPdf?: () => void;
	/** Afficher le nombre total de lignes */
	showRowCount?: boolean;
	/** Nombre total de lignes */
	rowCount?: number;
	/** Nombre de lignes filtrées */
	filteredRowCount?: number;
	/** Contenu personnalisé à droite */
	rightSection?: ReactNode;
	/** Contenu personnalisé à gauche */
	leftSection?: ReactNode;
	/** Placeholder du champ de recherche */
	searchPlaceholder?: string;
	/** Afficher le bouton de réinitialisation des filtres */
	showResetFilters?: boolean;
	/** Callback pour réinitialiser les filtres */
	onResetFilters?: () => void;
	/** Des filtres sont actifs */
	hasActiveFilters?: boolean;
}

/**
 * TableToolbar - Barre d'outils réutilisable pour les tables
 *
 * Fonctionnalités:
 * - Recherche globale
 * - Bouton d'ajout
 * - Bouton de rafraîchissement
 * - Export CSV/PDF
 * - Affichage du nombre de lignes
 * - Sections personnalisables
 */
export function TableToolbar({
	title,
	globalFilter = "",
	onGlobalFilterChange,
	showAddButton = false,
	addButtonLabel = "Ajouter",
	onAdd,
	addButtonDisabled = false,
	showRefreshButton = true,
	onRefresh,
	isLoading = false,
	showExportButtons = false,
	onExportCsv,
	onExportPdf,
	showRowCount = false,
	rowCount = 0,
	filteredRowCount,
	rightSection,
	leftSection,
	searchPlaceholder = "Rechercher...",
	showResetFilters = false,
	onResetFilters,
	hasActiveFilters = false,
}: TableToolbarProps) {
	return (
		<Group justify="space-between" mb="md" wrap="wrap" gap="sm">
			{/* Section gauche */}
			<Group gap="sm">
				{title && (
					<Text fw={600} size="lg">
						{title}
					</Text>
				)}

				{leftSection}

				{onGlobalFilterChange && (
					<TextInput
						placeholder={searchPlaceholder}
						value={globalFilter}
						onChange={(e) => onGlobalFilterChange(e.currentTarget.value)}
						leftSection={<IconSearch size={16} />}
						size="sm"
						style={{ minWidth: 200 }}
					/>
				)}

				{showResetFilters && hasActiveFilters && (
					<Tooltip label="Réinitialiser les filtres">
						<ActionIcon
							variant="light"
							color="gray"
							onClick={onResetFilters}
							size="lg"
						>
							<IconFilterOff size={18} />
						</ActionIcon>
					</Tooltip>
				)}

				{showRowCount && (
					<Text size="sm" c="dimmed">
						{filteredRowCount !== undefined && filteredRowCount !== rowCount
							? `${filteredRowCount} / ${rowCount} éléments`
							: `${rowCount} éléments`}
					</Text>
				)}
			</Group>

			{/* Section droite */}
			<Group gap="sm">
				{rightSection}

				{showRefreshButton && onRefresh && (
					<Tooltip label="Rafraîchir">
						<ActionIcon
							variant="light"
							color="blue"
							onClick={onRefresh}
							loading={isLoading}
							size="lg"
						>
							<IconRefresh size={18} />
						</ActionIcon>
					</Tooltip>
				)}

				{showExportButtons && (onExportCsv || onExportPdf) && (
					<Menu shadow="md" width={180} position="bottom-end">
						<Menu.Target>
							<Tooltip label="Exporter">
								<ActionIcon variant="light" color="gray" size="lg">
									<IconTableExport size={18} />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Format d'export</Menu.Label>
							{onExportCsv && (
								<Menu.Item
									leftSection={<IconFileTypeCsv size={16} />}
									onClick={onExportCsv}
								>
									Exporter en CSV
								</Menu.Item>
							)}
							{onExportPdf && (
								<Menu.Item
									leftSection={<IconFileTypePdf size={16} />}
									onClick={onExportPdf}
								>
									Exporter en PDF
								</Menu.Item>
							)}
						</Menu.Dropdown>
					</Menu>
				)}

				{showAddButton && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={onAdd}
						disabled={addButtonDisabled}
						size="sm"
					>
						{addButtonLabel}
					</Button>
				)}
			</Group>
		</Group>
	);
}

export default TableToolbar;
