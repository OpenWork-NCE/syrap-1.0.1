"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	MRT_ColumnFiltersState,
	MRT_SortingState,
	MRT_PaginationState,
} from "mantine-react-table";
import { innerUrl } from "@/app/lib/utils";

/**
 * Configuration pour useServerTable
 */
interface UseServerTableConfig<T> {
	/** Clé unique pour le cache React Query */
	queryKey: string;
	/** Endpoint API (sans le préfixe /api) */
	endpoint: string;
	/** Nombre d'éléments par page par défaut */
	defaultPageSize?: number;
	/** Transformation des données après fetch */
	transformData?: (data: any) => T[];
	/** Activer la pagination serveur */
	serverPagination?: boolean;
	/** Durée de fraîcheur des données (ms) */
	staleTime?: number;
}

/**
 * Réponse paginée standard du backend
 */
interface PaginatedResponse<T> {
	data: T[];
	meta?: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
	links?: {
		first: string;
		last: string;
		prev: string | null;
		next: string | null;
	};
}

/**
 * Retour du hook useServerTable
 */
interface UseServerTableReturn<T> {
	/** Données de la table */
	data: T[];
	/** Chargement en cours */
	isLoading: boolean;
	/** Erreur de chargement */
	isError: boolean;
	/** Rechargement des données */
	refetch: () => void;
	/** État de pagination */
	pagination: MRT_PaginationState;
	/** Setter pour pagination */
	setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
	/** Nombre total de lignes */
	rowCount: number;
	/** État des filtres de colonnes */
	columnFilters: MRT_ColumnFiltersState;
	/** Setter pour filtres */
	setColumnFilters: React.Dispatch<React.SetStateAction<MRT_ColumnFiltersState>>;
	/** État du tri */
	sorting: MRT_SortingState;
	/** Setter pour tri */
	setSorting: React.Dispatch<React.SetStateAction<MRT_SortingState>>;
	/** Filtre global */
	globalFilter: string;
	/** Setter pour filtre global */
	setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
	/** Invalider le cache et refetch */
	invalidate: () => void;
}

/**
 * Hook pour les tables avec pagination serveur
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   pagination,
 *   setPagination,
 *   rowCount,
 * } = useServerTable<User>({
 *   queryKey: "users",
 *   endpoint: "/api/users",
 *   serverPagination: true,
 * });
 * ```
 */
export function useServerTable<T>({
	queryKey,
	endpoint,
	defaultPageSize = 10,
	transformData,
	serverPagination = false,
	staleTime = 5 * 60 * 1000,
}: UseServerTableConfig<T>): UseServerTableReturn<T> {
	const queryClient = useQueryClient();

	// État de la table
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: defaultPageSize,
	});
	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	// Construction de l'URL avec paramètres
	const fetchUrl = useMemo(() => {
		const params = new URLSearchParams();

		if (serverPagination) {
			params.set("page", String(pagination.pageIndex + 1));
			params.set("limit", String(pagination.pageSize));
		}

		if (globalFilter) {
			params.set("search", globalFilter);
		}

		if (sorting.length > 0) {
			params.set("sort", sorting[0].id);
			params.set("order", sorting[0].desc ? "desc" : "asc");
		}

		// Filtres de colonnes
		columnFilters.forEach((filter) => {
			if (filter.value) {
				params.set(`filter[${filter.id}]`, String(filter.value));
			}
		});

		const queryString = params.toString();
		return queryString ? `${endpoint}?${queryString}` : endpoint;
	}, [endpoint, pagination, globalFilter, sorting, columnFilters, serverPagination]);

	// Query avec dépendances
	const queryKeyWithParams = useMemo(
		() => [queryKey, pagination, globalFilter, sorting, columnFilters],
		[queryKey, pagination, globalFilter, sorting, columnFilters]
	);

	const { data: response, isLoading, isError, refetch } = useQuery<PaginatedResponse<T>>({
		queryKey: serverPagination ? queryKeyWithParams : [queryKey],
		queryFn: async () => {
			const res = await fetch(innerUrl(fetchUrl));
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}
			return res.json();
		},
		staleTime,
		placeholderData: (previousData) => previousData,
	});

	// Transformation des données
	const data = useMemo(() => {
		if (!response?.data) return [];
		return transformData ? transformData(response.data) : response.data;
	}, [response, transformData]);

	// Nombre total de lignes
	const rowCount = useMemo(() => {
		if (serverPagination && response?.meta?.total) {
			return response.meta.total;
		}
		return data.length;
	}, [response, data, serverPagination]);

	// Invalidation du cache
	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: [queryKey] });
	}, [queryClient, queryKey]);

	return {
		data,
		isLoading,
		isError,
		refetch,
		pagination,
		setPagination,
		rowCount,
		columnFilters,
		setColumnFilters,
		sorting,
		setSorting,
		globalFilter,
		setGlobalFilter,
		invalidate,
	};
}

/**
 * Configuration par défaut pour MantineReactTable avec pagination serveur
 */
export const serverTableConfig = {
	manualPagination: true,
	manualFiltering: true,
	manualSorting: true,
	enableGlobalFilter: true,
	enableColumnFilters: true,
	enableSorting: true,
	paginationDisplayMode: "pages" as const,
	positionPagination: "bottom" as const,
	mantinePaginationProps: {
		showRowsPerPage: true,
		rowsPerPageOptions: ["10", "25", "50", "100"],
	},
};

/**
 * Configuration par défaut pour MantineReactTable avec pagination client
 */
export const clientTableConfig = {
	manualPagination: false,
	manualFiltering: false,
	manualSorting: false,
	enableGlobalFilter: true,
	enableColumnFilters: true,
	enableSorting: true,
	paginationDisplayMode: "pages" as const,
	positionPagination: "bottom" as const,
	initialState: {
		pagination: { pageIndex: 0, pageSize: 10 },
	},
};

export default useServerTable;
