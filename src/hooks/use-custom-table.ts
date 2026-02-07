import {
	type MRT_TableOptions,
	type MRT_Localization,
	useMantineReactTable,
} from "mantine-react-table";

const MRT_Localization_FR: Partial<MRT_Localization> = {
	actions: "Actions",
	cancel: "Annuler",
	clearFilter: "Effacer le filtre",
	clearSearch: "Effacer la recherche",
	clearSort: "Annuler le tri",
	columnActions: "Actions de colonne",
	copiedToClipboard: "Copié dans le presse-papier",
	edit: "Éditer",
	expand: "Développer",
	expandAll: "Tout développer",
	filterByColumn: "Filtrer par {column}",
	filterMode: "Mode de filtre: {filterType}",
	grab: "Saisir",
	groupByColumn: "Grouper par {column}",
	groupedBy: "Groupé par ",
	hideAll: "Tout masquer",
	hideColumn: "Masquer la colonne {column}",
	max: "Max",
	min: "Min",
	move: "Déplacer",
	noRecordsToDisplay: "Aucun enregistrement à afficher",
	noResultsFound: "Aucun résultat trouvé",
	of: "sur",
	pin: "Épingler",
	resetColumnSize: "Réinitialiser la taille de la colonne",
	resetOrder: "Réinitialiser l'ordre",
	rowActions: "Actions de ligne",
	rowNumber: "N°",
	rowNumbers: "Numéros de ligne",
	rowsPerPage: "Lignes par page",
	save: "Enregistrer",
	search: "Rechercher",
	selectedCountOfRowCountRowsSelected: "{selectedCount} sur {rowCount} ligne(s) sélectionnée(s)",
	showAll: "Tout afficher",
	showAllColumns: "Afficher toutes les colonnes",
	showHideColumns: "Afficher/Masquer les colonnes",
	showHideFilters: "Afficher/Masquer les filtres",
	showHideSearch: "Afficher/Masquer la recherche",
	sortByColumnAsc: "Trier par {column} croissant",
	sortByColumnDesc: "Trier par {column} décroissant",
	sortedByColumnAsc: "Trié par {column} croissant",
	sortedByColumnDesc: "Trié par {column} décroissant",
	thenBy: "puis par ",
	toggleDensity: "Changer la densité",
	toggleFullScreen: "Plein écran",
	toggleSelectAll: "Tout sélectionner",
	toggleSelectRow: "Sélectionner la ligne",
	toggleVisibility: "Changer la visibilité",
	ungroupByColumn: "Dégrouper par {column}",
	unpin: "Détacher",
	unpinAll: "Tout détacher",
	unsorted: "Non trié",
};

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type CustomTableOptions<TData extends Record<string, any> = {}> = Omit<
	MRT_TableOptions<TData>,
	| "manualPagination"
	| "enablePagination"
	| "mantinePaginationProps"
	| "paginationDisplayMode"
	| "mantineTableProps.align"
	| "mantinePaperProps"
	| "initialState.density"
>;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const useCustomTable = <TData extends Record<string, any> = {}>(
	tableOptions: CustomTableOptions<TData>,
) => {
	return useMantineReactTable({
		...{
			localization: MRT_Localization_FR as MRT_Localization,
			paginationDisplayMode: "pages",
			// filters
			manualFiltering: true,
			// styles
			mantineTableProps: {
				align: "center",
			},
			positionActionsColumn: "last",
			mantinePaperProps: {
				shadow: "0",
				radius: "md",
				p: "md",
				withBorder: false,
			},
			displayColumnDefOptions: {
				"mrt-row-actions": {
					size: 100, //make actions column wider
				},
			},
			mantineFilterTextInputProps: {
				style: { borderBottom: "unset", marginTop: "8px" },
				variant: "filled",
			},
			mantineFilterSelectProps: {
				style: { borderBottom: "unset", marginTop: "8px" },
				variant: "filled",
			},
			// features
			enableColumnActions: false,
			enableFullScreenToggle: false,
			enableHiding: false,
			enablePinning: false,
			enableEditing: true,
			enableRowSelection: true,
			positionToolbarAlertBanner: "bottom",
			enableColumnFilterModes: true,
			enableColumnOrdering: true,
			enableDensityToggle: true,
			enableGlobalFilterModes: true,
			enableMultiRowSelection: true,
			enableFacetedValues: true,
			enableRowNumbers: true,
			enableRowActions: true,
			enableColumnPinning: true,
			enableGrouping: true,
			enablePagination: true,
			// states
			initialState: {
				// density: "xs",
				columnVisibility: {
					id: false,
				},
				columnPinning: {
					left: ["mrt-row-select"],
					right: ["mrt-row-actions", "mrt-row-expand"],
				},
			},
			columns: [],
			data: [],
		},
		...tableOptions,
	});
};
