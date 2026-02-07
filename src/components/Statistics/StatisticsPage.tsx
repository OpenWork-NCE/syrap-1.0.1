"use client";

import {
	Badge,
	Box,
	Card,
	Grid,
	Group,
	Paper,
	Progress,
	RingProgress,
	ScrollArea,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	ThemeIcon,
	Title,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBook,
	IconBookmark,
	IconBuildingCommunity,
	IconChartBar,
	IconChartDonut,
	IconChartLine,
	IconCheck,
	IconClock,
	IconSchool,
	IconTrendingDown,
	IconTrendingUp,
	IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	Title as ChartTitle,
	Tooltip as ChartTooltip,
	Legend,
	Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import classes from "./StatisticsPage.module.css";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	ChartTitle,
	ChartTooltip,
	Legend,
	Filler
);

// ============== MOCK DATA ==============

const USE_MOCK_DATA = true;

// KPIs
const mockKPIs = {
	totalUEs: 1847,
	totalUEsTrend: 12.5,
	conformityRate: 78.3,
	conformityTrend: 5.2,
	activeInstitutions: 156,
	institutionsTrend: 8,
	pendingValidations: 43,
	validationsTrend: -15,
};

// Distribution des UEs par filière
const mockUEsByBranch = {
	labels: [
		"Informatique",
		"Gestion",
		"Droit",
		"Médecine",
		"Sciences",
		"Lettres",
		"Économie",
		"Ingénierie",
	],
	data: [312, 287, 198, 245, 276, 156, 189, 184],
};

// Taux de conformité par université
const mockConformityByUniversity = {
	labels: ["Yaoundé I", "Douala", "Dschang", "Ngaoundéré", "Buea", "Bamenda", "Maroua", "Autres"],
	data: [92, 85, 78, 71, 88, 65, 58, 72],
	colors: [
		"rgba(34, 197, 94, 0.8)",
		"rgba(59, 130, 246, 0.8)",
		"rgba(168, 85, 247, 0.8)",
		"rgba(249, 115, 22, 0.8)",
		"rgba(236, 72, 153, 0.8)",
		"rgba(20, 184, 166, 0.8)",
		"rgba(234, 179, 8, 0.8)",
		"rgba(107, 114, 128, 0.8)",
	],
};

// Évolution des validations (12 derniers mois)
const mockValidationsEvolution = {
	labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
	validated: [45, 52, 38, 65, 72, 58, 82, 91, 78, 95, 88, 102],
	pending: [23, 18, 31, 25, 19, 28, 15, 12, 22, 18, 25, 20],
	rejected: [8, 12, 9, 7, 11, 6, 5, 8, 10, 7, 9, 6],
};

// Top 5 IPES par conformité
const mockTopIPES = [
	{ id: 1, name: "IPES SUP'PทIC Yaoundé", university: "Yaoundé I", rate: 96.5, ues: 124, trend: "up" },
	{ id: 2, name: "Institut SIANTOU", university: "Douala", rate: 94.2, ues: 98, trend: "up" },
	{ id: 3, name: "ESSEC Business School", university: "Douala", rate: 92.8, ues: 156, trend: "stable" },
	{ id: 4, name: "ISTAG Yaoundé", university: "Yaoundé I", rate: 91.3, ues: 87, trend: "up" },
	{ id: 5, name: "IUC Douala", university: "Douala", rate: 89.7, ues: 203, trend: "down" },
];

// UEs les plus partagées
const mockSharedUEs = [
	{ id: 1, code: "INF101", name: "Algorithmique", branch: "Informatique", institutions: 142, validated: true },
	{ id: 2, code: "MGT201", name: "Management Stratégique", branch: "Gestion", institutions: 128, validated: true },
	{ id: 3, code: "ANG100", name: "Anglais Professionnel", branch: "Transversal", institutions: 156, validated: true },
	{ id: 4, code: "MAT102", name: "Mathématiques Appliquées", branch: "Sciences", institutions: 118, validated: true },
	{ id: 5, code: "DRT101", name: "Introduction au Droit", branch: "Droit", institutions: 95, validated: false },
];

// Statistiques par région
const mockRegionStats = [
	{ region: "Centre", ipes: 48, universities: 2, ues: 523, conformity: 82 },
	{ region: "Littoral", ipes: 35, universities: 1, ues: 412, conformity: 79 },
	{ region: "Ouest", ipes: 22, universities: 1, ues: 287, conformity: 76 },
	{ region: "Nord-Ouest", ipes: 15, universities: 1, ues: 198, conformity: 71 },
	{ region: "Sud-Ouest", ipes: 12, universities: 1, ues: 156, conformity: 85 },
	{ region: "Adamaoua", ipes: 8, universities: 1, ues: 124, conformity: 68 },
	{ region: "Extrême-Nord", ipes: 6, universities: 1, ues: 87, conformity: 62 },
	{ region: "Nord", ipes: 5, universities: 0, ues: 34, conformity: 58 },
	{ region: "Est", ipes: 3, universities: 0, ues: 18, conformity: 55 },
	{ region: "Sud", ipes: 2, universities: 0, ues: 8, conformity: 52 },
];

// Options de filtres
const regionOptions = [
	{ value: "all", label: "Toutes les régions" },
	{ value: "centre", label: "Centre" },
	{ value: "littoral", label: "Littoral" },
	{ value: "ouest", label: "Ouest" },
	{ value: "nord-ouest", label: "Nord-Ouest" },
	{ value: "sud-ouest", label: "Sud-Ouest" },
];

const yearOptions = [
	{ value: "2025-2026", label: "2025-2026" },
	{ value: "2024-2025", label: "2024-2025" },
	{ value: "2023-2024", label: "2023-2024" },
];

export function StatisticsPage() {
	const theme = useMantineTheme();
	const [selectedRegion, setSelectedRegion] = useState<string | null>("all");
	const [selectedYear, setSelectedYear] = useState<string | null>("2025-2026");

	// Chart configurations
	const barChartData = {
		labels: mockUEsByBranch.labels,
		datasets: [
			{
				label: "Nombre d'UEs",
				data: mockUEsByBranch.data,
				backgroundColor: [
					"rgba(59, 130, 246, 0.8)",
					"rgba(34, 197, 94, 0.8)",
					"rgba(168, 85, 247, 0.8)",
					"rgba(249, 115, 22, 0.8)",
					"rgba(236, 72, 153, 0.8)",
					"rgba(20, 184, 166, 0.8)",
					"rgba(234, 179, 8, 0.8)",
					"rgba(107, 114, 128, 0.8)",
				],
				borderRadius: 8,
				borderSkipped: false,
			},
		],
	};

	const barChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 12,
				titleFont: { size: 14, weight: "bold" as const },
				bodyFont: { size: 13 },
				cornerRadius: 8,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: { size: 11 },
				},
			},
			y: {
				grid: {
					color: "rgba(0, 0, 0, 0.05)",
				},
				ticks: {
					font: { size: 11 },
				},
			},
		},
	};

	const doughnutChartData = {
		labels: mockConformityByUniversity.labels,
		datasets: [
			{
				data: mockConformityByUniversity.data,
				backgroundColor: mockConformityByUniversity.colors,
				borderWidth: 0,
				spacing: 2,
			},
		],
	};

	const doughnutChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: "65%",
		plugins: {
			legend: {
				position: "right" as const,
				labels: {
					usePointStyle: true,
					pointStyle: "circle",
					padding: 15,
					font: { size: 11 },
				},
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 12,
				callbacks: {
					label: (context: any) => `${context.label}: ${context.raw}%`,
				},
			},
		},
	};

	const lineChartData = {
		labels: mockValidationsEvolution.labels,
		datasets: [
			{
				label: "Validées",
				data: mockValidationsEvolution.validated,
				borderColor: "rgba(34, 197, 94, 1)",
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
				pointHoverRadius: 6,
			},
			{
				label: "En attente",
				data: mockValidationsEvolution.pending,
				borderColor: "rgba(234, 179, 8, 1)",
				backgroundColor: "rgba(234, 179, 8, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
				pointHoverRadius: 6,
			},
			{
				label: "Rejetées",
				data: mockValidationsEvolution.rejected,
				borderColor: "rgba(239, 68, 68, 1)",
				backgroundColor: "rgba(239, 68, 68, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
				pointHoverRadius: 6,
			},
		],
	};

	const lineChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					usePointStyle: true,
					pointStyle: "circle",
					padding: 20,
					font: { size: 12 },
				},
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 12,
				mode: "index" as const,
				intersect: false,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
			},
			y: {
				grid: {
					color: "rgba(0, 0, 0, 0.05)",
				},
				beginAtZero: true,
			},
		},
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};

	const getTrendIcon = (trend: string) => {
		if (trend === "up") return <IconTrendingUp size={16} color="green" />;
		if (trend === "down") return <IconTrendingDown size={16} color="red" />;
		return <IconChartLine size={16} color="gray" />;
	};

	const getConformityColor = (rate: number) => {
		if (rate >= 90) return "green";
		if (rate >= 75) return "blue";
		if (rate >= 60) return "yellow";
		return "red";
	};

	return (
		<div className={classes.container}>
			{/* Filtres */}
			<Card className={classes.filterCard} padding="md" radius="lg" mb="lg">
				<Group justify="space-between" align="center">
					<Group gap="xs">
						<ThemeIcon size={32} radius="xl" variant="light" color="blue">
							<IconChartBar size={18} />
						</ThemeIcon>
						<div>
							<Text fw={600}>Tableau de bord analytique</Text>
							<Text size="xs" c="dimmed">
								Vue d'ensemble des indicateurs clés
							</Text>
						</div>
					</Group>
					<Group gap="md">
						<Select
							placeholder="Région"
							data={regionOptions}
							value={selectedRegion}
							onChange={setSelectedRegion}
							size="sm"
							w={180}
							clearable={false}
						/>
						<Select
							placeholder="Année académique"
							data={yearOptions}
							value={selectedYear}
							onChange={setSelectedYear}
							size="sm"
							w={140}
							clearable={false}
						/>
					</Group>
				</Group>
			</Card>

			{/* KPIs principaux */}
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="lg">
				<Card className={classes.kpiCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.kpiLabel}>Total UEs</Text>
							<Text className={classes.kpiValue}>{mockKPIs.totalUEs.toLocaleString()}</Text>
							<Group gap={4} mt={4}>
								<Badge
									size="sm"
									variant="light"
									color={mockKPIs.totalUEsTrend > 0 ? "green" : "red"}
									leftSection={mockKPIs.totalUEsTrend > 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
								>
									{mockKPIs.totalUEsTrend > 0 ? "+" : ""}{mockKPIs.totalUEsTrend}%
								</Badge>
								<Text size="xs" c="dimmed">vs année précédente</Text>
							</Group>
						</div>
						<ThemeIcon size={52} radius="xl" variant="light" color="blue" className={classes.kpiIcon}>
							<IconBook size={26} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card className={classes.kpiCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.kpiLabel}>Taux de conformité</Text>
							<Text className={classes.kpiValue}>{mockKPIs.conformityRate}%</Text>
							<Group gap={4} mt={4}>
								<Badge
									size="sm"
									variant="light"
									color={mockKPIs.conformityTrend > 0 ? "green" : "red"}
									leftSection={mockKPIs.conformityTrend > 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
								>
									{mockKPIs.conformityTrend > 0 ? "+" : ""}{mockKPIs.conformityTrend}%
								</Badge>
								<Text size="xs" c="dimmed">amélioration</Text>
							</Group>
						</div>
						<RingProgress
							size={52}
							thickness={5}
							roundCaps
							sections={[{ value: mockKPIs.conformityRate, color: "green" }]}
							label={
								<ThemeIcon size={32} radius="xl" variant="light" color="green">
									<IconCheck size={18} />
								</ThemeIcon>
							}
						/>
					</Group>
				</Card>

				<Card className={classes.kpiCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.kpiLabel}>Établissements actifs</Text>
							<Text className={classes.kpiValue}>{mockKPIs.activeInstitutions}</Text>
							<Group gap={4} mt={4}>
								<Badge
									size="sm"
									variant="light"
									color="teal"
									leftSection={<IconBuildingCommunity size={12} />}
								>
									+{mockKPIs.institutionsTrend} ce mois
								</Badge>
							</Group>
						</div>
						<ThemeIcon size={52} radius="xl" variant="light" color="teal" className={classes.kpiIcon}>
							<IconSchool size={26} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card className={classes.kpiCard} padding="lg" radius="lg">
					<Group justify="space-between" align="flex-start">
						<div>
							<Text className={classes.kpiLabel}>Validations en attente</Text>
							<Text className={classes.kpiValue}>{mockKPIs.pendingValidations}</Text>
							<Group gap={4} mt={4}>
								<Badge
									size="sm"
									variant="light"
									color={mockKPIs.validationsTrend < 0 ? "green" : "orange"}
									leftSection={<IconClock size={12} />}
								>
									{mockKPIs.validationsTrend}% vs semaine dernière
								</Badge>
							</Group>
						</div>
						<ThemeIcon size={52} radius="xl" variant="light" color="orange" className={classes.kpiIcon}>
							<IconClock size={26} />
						</ThemeIcon>
					</Group>
				</Card>
			</SimpleGrid>

			{/* Graphiques principaux */}
			<Grid gutter="lg" mb="lg">
				{/* Distribution des UEs par filière */}
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="blue">
									<IconChartBar size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>Distribution des UEs par filière</Text>
									<Text size="xs" c="dimmed">
										Répartition des unités d'enseignement
									</Text>
								</div>
							</Group>
							<Badge variant="light" color="blue">
								{mockUEsByBranch.data.reduce((a, b) => a + b, 0)} UEs total
							</Badge>
						</Group>
						<Box h={320}>
							<Bar data={barChartData} options={barChartOptions} />
						</Box>
					</Card>
				</Grid.Col>

				{/* Taux de conformité par université */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="violet">
									<IconChartDonut size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>Conformité par université</Text>
									<Text size="xs" c="dimmed">
										Taux de conformité des IPES
									</Text>
								</div>
							</Group>
						</Group>
						<Box h={320}>
							<Doughnut data={doughnutChartData} options={doughnutChartOptions} />
						</Box>
					</Card>
				</Grid.Col>
			</Grid>

			{/* Évolution et tableaux */}
			<Grid gutter="lg" mb="lg">
				{/* Évolution des validations */}
				<Grid.Col span={{ base: 12, lg: 7 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="green">
									<IconChartLine size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>Évolution des validations</Text>
									<Text size="xs" c="dimmed">
										Tendance sur les 12 derniers mois
									</Text>
								</div>
							</Group>
							<Badge variant="light" color="green">
								{mockValidationsEvolution.validated.reduce((a, b) => a + b, 0)} validées cette année
							</Badge>
						</Group>
						<Box h={280}>
							<Line data={lineChartData} options={lineChartOptions} />
						</Box>
					</Card>
				</Grid.Col>

				{/* Top 5 IPES par conformité */}
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="teal">
									<IconBuildingCommunity size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>Top 5 IPES par conformité</Text>
									<Text size="xs" c="dimmed">
										Meilleures performances
									</Text>
								</div>
							</Group>
						</Group>
						<ScrollArea h={280}>
							<Stack gap="sm">
								{mockTopIPES.map((ipes, index) => (
									<Paper key={ipes.id} className={classes.rankItem} p="sm" radius="md">
										<Group justify="space-between" wrap="nowrap">
											<Group gap="sm" wrap="nowrap">
												<ThemeIcon
													size={32}
													radius="xl"
													variant="filled"
													color={index === 0 ? "yellow" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"}
												>
													<Text fw={700} size="sm">
														{index + 1}
													</Text>
												</ThemeIcon>
												<div>
													<Text fw={500} size="sm" truncate style={{ maxWidth: 180 }}>
														{ipes.name}
													</Text>
													<Text size="xs" c="dimmed">
														{ipes.university} • {ipes.ues} UEs
													</Text>
												</div>
											</Group>
											<Group gap="xs" wrap="nowrap">
												<Badge
													size="lg"
													variant="light"
													color={getConformityColor(ipes.rate)}
												>
													{ipes.rate}%
												</Badge>
												{getTrendIcon(ipes.trend)}
											</Group>
										</Group>
									</Paper>
								))}
							</Stack>
						</ScrollArea>
					</Card>
				</Grid.Col>
			</Grid>

			{/* Tableaux détaillés */}
			<Grid gutter="lg">
				{/* UEs les plus partagées */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="violet">
									<IconBookmark size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>UEs les plus partagées</Text>
									<Text size="xs" c="dimmed">
										Unités d'enseignement communes
									</Text>
								</div>
							</Group>
						</Group>
						<ScrollArea>
							<Table striped highlightOnHover withTableBorder={false}>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Code</Table.Th>
										<Table.Th>Nom</Table.Th>
										<Table.Th>Filière</Table.Th>
										<Table.Th ta="center">Institutions</Table.Th>
										<Table.Th ta="center">Status</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{mockSharedUEs.map((ue) => (
										<Table.Tr key={ue.id}>
											<Table.Td>
												<Badge variant="outline" size="sm">
													{ue.code}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Text size="sm" fw={500}>
													{ue.name}
												</Text>
											</Table.Td>
											<Table.Td>
												<Text size="sm" c="dimmed">
													{ue.branch}
												</Text>
											</Table.Td>
											<Table.Td ta="center">
												<Badge variant="light" color="blue">
													{ue.institutions}
												</Badge>
											</Table.Td>
											<Table.Td ta="center">
												<Badge
													variant="light"
													color={ue.validated ? "green" : "orange"}
												>
													{ue.validated ? "Validée" : "En attente"}
												</Badge>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</ScrollArea>
					</Card>
				</Grid.Col>

				{/* Statistiques par région */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card className={classes.chartCard} padding="lg" radius="lg">
						<Group justify="space-between" mb="md">
							<Group gap="xs">
								<ThemeIcon size={32} radius="xl" variant="light" color="orange">
									<IconUsers size={18} />
								</ThemeIcon>
								<div>
									<Text fw={600}>Statistiques par région</Text>
									<Text size="xs" c="dimmed">
										Répartition géographique
									</Text>
								</div>
							</Group>
						</Group>
						<ScrollArea h={280}>
							<Stack gap="xs">
								{mockRegionStats.map((region) => (
									<Paper key={region.region} className={classes.regionItem} p="sm" radius="md">
										<Group justify="space-between" mb={4}>
											<Text fw={500} size="sm">
												{region.region}
											</Text>
											<Group gap="xs">
												<Tooltip label="IPES">
													<Badge size="xs" variant="light" color="teal">
														{region.ipes} IPES
													</Badge>
												</Tooltip>
												<Tooltip label="Universités">
													<Badge size="xs" variant="light" color="blue">
														{region.universities} Univ.
													</Badge>
												</Tooltip>
											</Group>
										</Group>
										<Group justify="space-between" align="center" gap="xs">
											<Progress
												value={region.conformity}
												color={getConformityColor(region.conformity)}
												size="sm"
												radius="xl"
												style={{ flex: 1 }}
											/>
											<Text size="xs" fw={600} c={getConformityColor(region.conformity)} w={45} ta="right">
												{region.conformity}%
											</Text>
										</Group>
										<Text size="xs" c="dimmed" mt={4}>
											{region.ues} UEs enregistrées
										</Text>
									</Paper>
								))}
							</Stack>
						</ScrollArea>
					</Card>
				</Grid.Col>
			</Grid>
		</div>
	);
}
