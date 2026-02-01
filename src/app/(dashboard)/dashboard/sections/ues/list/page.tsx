"use client";

import { useState, useMemo } from "react";
import {
	Container,
	Stack,
	Group,
	Paper,
	Text,
	ThemeIcon,
	SimpleGrid,
	rem,
	Skeleton,
} from "@mantine/core";
import {
	IconBook2,
	IconCircleCheck,
	IconClock,
} from "@tabler/icons-react";
import PageHeader from "@/components/PageHeader/PageHeader";
import { LazyUesTable } from "@/components/tables";
import { useAuthorizations } from "@/app/context/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { innerUrl } from "@/app/lib/utils";

const breadcrumbItems = [
	{ title: "Programmes", href: "/dashboard" },
	{ title: "Unités d'Enseignement", href: "#" },
];

type StatCardProps = {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	description?: string;
	loading?: boolean;
	active?: boolean;
	onClick?: () => void;
};

function StatCard({ title, value, icon, color, description, loading, active, onClick }: StatCardProps) {
	return (
		<Paper
			withBorder
			p="sm"
			radius="md"
			onClick={onClick}
			style={{
				borderLeft: active
					? `4px solid var(--mantine-color-${color}-6)`
					: "4px solid var(--mantine-color-gray-3)",
				transition: "all 0.15s ease",
				cursor: "pointer",
				backgroundColor: active ? `var(--mantine-color-${color}-0)` : undefined,
				opacity: active ? 1 : 0.75,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "translateY(-2px)";
				e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
				e.currentTarget.style.opacity = "1";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "translateY(0)";
				e.currentTarget.style.boxShadow = "none";
				e.currentTarget.style.opacity = active ? "1" : "0.75";
			}}
		>
			<Group justify="space-between" gap="xs">
				<div>
					<Text c="dimmed" tt="uppercase" fw={700} fz="xs">
						{title}
					</Text>
					{loading ? (
						<Skeleton height={24} width={50} mt={2} />
					) : (
						<Text fw={700} fz={rem(22)} lh={1.2}>
							{value}
						</Text>
					)}
					{description && (
						<Text fz="xs" c="dimmed" mt={2}>
							{description}
						</Text>
					)}
				</div>
				<ThemeIcon
					color={color}
					variant={active ? "filled" : "light"}
					size={36}
					radius="md"
				>
					{icon}
				</ThemeIcon>
			</Group>
		</Paper>
	);
}

function Page() {
	const { authorizations } = useAuthorizations();
	const [filter, setFilter] = useState<string>("all");

	// Fetch UEs data for statistics
	const { data, isLoading } = useQuery({
		queryKey: ["ues"],
		queryFn: () => fetch(innerUrl("/api/ues")).then((res) => res.json()),
		staleTime: 30_000,
	});

	const stats = useMemo(() => {
		const ues = data?.data ?? [];
		const total = ues.length;
		const validated = ues.filter((ue: any) => ue.validate !== null).length;
		const pending = ues.filter((ue: any) => ue.validate === null).length;
		return { total, validated, pending };
	}, [data]);

	return (
		<>
			<>
				<title>Unités d'Enseignement | IPES-SCpro</title>
				<meta name="description" content="Gestion des unités d'enseignement" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Unités d'Enseignement"
						description="Gérez les unités d'enseignement de votre établissement. Consultez, créez et validez les UEs."
						icon={<IconBook2 size={24} />}
						breadcrumbItems={breadcrumbItems}
					/>

					{/* Statistics Cards - Clickable Filters */}
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
						<StatCard
							title="Total UEs"
							value={stats.total}
							icon={<IconBook2 size={24} />}
							color="blue"
							description="Cliquez pour voir toutes"
							loading={isLoading}
							active={filter === "all"}
							onClick={() => setFilter("all")}
						/>
						<StatCard
							title="Validées"
							value={stats.validated}
							icon={<IconCircleCheck size={24} />}
							color="green"
							description="Prêtes à l'utilisation"
							loading={isLoading}
							active={filter === "validated"}
							onClick={() => setFilter("validated")}
						/>
						<StatCard
							title="En attente"
							value={stats.pending}
							icon={<IconClock size={24} />}
							color="orange"
							description="À valider"
							loading={isLoading}
							active={filter === "pending"}
							onClick={() => setFilter("pending")}
						/>
					</SimpleGrid>

					{/* Table */}
					<LazyUesTable
						authorizations={authorizations.filter((authorization) =>
							authorization.includes("ues"),
						)}
						filterStatus={filter}
					/>
				</Stack>
			</Container>
		</>
	);
}

export default Page;
