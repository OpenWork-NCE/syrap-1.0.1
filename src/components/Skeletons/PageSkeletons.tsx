"use client";

import { Box, Grid, Group, Paper, Skeleton, Stack } from "@mantine/core";

/**
 * Skeleton pour les pages avec tableau (liste d'entités)
 */
export function TablePageSkeleton() {
	return (
		<Stack gap="md">
			{/* Header de page */}
			<Paper p="md" radius="md" withBorder>
				<Group justify="space-between" align="center">
					<Group gap="sm">
						<Skeleton height={40} width={40} radius="md" />
						<Stack gap={4}>
							<Skeleton height={24} width={200} radius="sm" />
							<Skeleton height={14} width={300} radius="sm" />
						</Stack>
					</Group>
					<Skeleton height={36} width={140} radius="md" />
				</Group>
			</Paper>

			{/* Stats cards */}
			<Grid>
				{[1, 2, 3].map((i) => (
					<Grid.Col key={i} span={{ base: 12, sm: 4 }}>
						<Paper p="md" radius="md" withBorder>
							<Group justify="space-between">
								<Stack gap={4}>
									<Skeleton height={12} width={80} radius="sm" />
									<Skeleton height={28} width={50} radius="sm" />
								</Stack>
								<Skeleton height={40} width={40} radius="md" />
							</Group>
						</Paper>
					</Grid.Col>
				))}
			</Grid>

			{/* Toolbar */}
			<Paper p="sm" radius="md" withBorder>
				<Group justify="space-between">
					<Group gap="sm">
						<Skeleton height={36} width={36} radius="md" />
						<Skeleton height={36} width={120} radius="md" />
						<Skeleton height={36} width={100} radius="md" />
					</Group>
					<Group gap="sm">
						<Skeleton height={36} width={36} radius="md" />
						<Skeleton height={36} width={36} radius="md" />
					</Group>
				</Group>
			</Paper>

			{/* Table header */}
			<Paper p="sm" radius="md" withBorder>
				<Group gap="md" mb="md">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} height={16} width={100} radius="sm" />
					))}
				</Group>
				{/* Table rows */}
				<Stack gap="sm">
					{[1, 2, 3, 4, 5].map((i) => (
						<Group key={i} gap="md" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
							<Skeleton height={14} width={80} radius="sm" />
							<Skeleton height={14} width={150} radius="sm" />
							<Skeleton height={14} width={200} radius="sm" />
							<Skeleton height={14} width={100} radius="sm" />
							<Skeleton height={24} width={60} radius="sm" />
						</Group>
					))}
				</Stack>
			</Paper>
		</Stack>
	);
}

/**
 * Skeleton pour le dashboard
 */
export function DashboardSkeleton() {
	return (
		<Stack gap="md">
			{/* Header avec bienvenue */}
			<Paper p="lg" radius="md" style={{ background: 'var(--mantine-color-green-6)' }}>
				<Group justify="space-between">
					<Stack gap={4}>
						<Skeleton height={20} width={250} radius="sm" style={{ opacity: 0.3 }} />
						<Skeleton height={14} width={200} radius="sm" style={{ opacity: 0.2 }} />
					</Stack>
					<Group gap="sm">
						<Skeleton height={36} width={36} radius="xl" style={{ opacity: 0.3 }} />
						<Skeleton height={36} width={36} radius="xl" style={{ opacity: 0.3 }} />
					</Group>
				</Group>
			</Paper>

			{/* Stats cards */}
			<Grid>
				{[1, 2, 3, 4].map((i) => (
					<Grid.Col key={i} span={{ base: 6, md: 3 }}>
						<Paper p="md" radius="md" withBorder>
							<Group justify="space-between">
								<Stack gap={4}>
									<Skeleton height={12} width={80} radius="sm" />
									<Skeleton height={32} width={40} radius="sm" />
								</Stack>
								<Skeleton height={44} width={44} radius="md" />
							</Group>
						</Paper>
					</Grid.Col>
				))}
			</Grid>

			{/* Content sections */}
			<Grid>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Paper p="md" radius="md" withBorder>
						<Group justify="space-between" mb="md">
							<Skeleton height={20} width={180} radius="sm" />
							<Skeleton height={14} width={100} radius="sm" />
						</Group>
						<Stack gap="sm">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} height={50} radius="md" />
							))}
						</Stack>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Paper p="md" radius="md" withBorder>
						<Skeleton height={20} width={140} radius="sm" mb="md" />
						<Stack gap="sm">
							{[1, 2, 3].map((i) => (
								<Group key={i} gap="sm">
									<Skeleton height={36} width={36} radius="xl" />
									<Stack gap={2} style={{ flex: 1 }}>
										<Skeleton height={14} width="80%" radius="sm" />
										<Skeleton height={10} width="50%" radius="sm" />
									</Stack>
								</Group>
							))}
						</Stack>
					</Paper>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

/**
 * Skeleton générique pour une page
 */
export function PageSkeleton() {
	return (
		<Stack gap="md">
			{/* Page header */}
			<Paper p="md" radius="md" withBorder>
				<Group gap="sm">
					<Skeleton height={40} width={40} radius="md" />
					<Stack gap={4}>
						<Skeleton height={24} width={200} radius="sm" />
						<Skeleton height={14} width={350} radius="sm" />
					</Stack>
				</Group>
			</Paper>

			{/* Content */}
			<Paper p="lg" radius="md" withBorder>
				<Stack gap="md">
					<Skeleton height={20} width="60%" radius="sm" />
					<Skeleton height={100} radius="md" />
					<Grid>
						<Grid.Col span={6}>
							<Skeleton height={150} radius="md" />
						</Grid.Col>
						<Grid.Col span={6}>
							<Skeleton height={150} radius="md" />
						</Grid.Col>
					</Grid>
				</Stack>
			</Paper>
		</Stack>
	);
}
