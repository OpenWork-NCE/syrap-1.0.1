"use client";

import {
	Text,
	Grid,
	RingProgress,
	Group,
	List,
	Badge,
	Progress,
	Tooltip,
	SimpleGrid,
	Box,
	Tabs,
	rem,
	Accordion,
	ThemeIcon,
	Divider,
	Paper,
	ScrollArea,
	ActionIcon,
	Collapse,
	Center,
	Menu,
	Button,
} from "@mantine/core";
import {
	IconCheck,
	IconX,
	IconArrowsShuffle,
	IconPercentage,
	IconListDetails,
	IconChartPie,
	IconChartBar,
	IconInfoCircle,
	IconDownload,
	IconFileTypePdf,
	IconFileTypeCsv,
	IconPrinter,
	IconChevronDown,
	IconChevronUp,
	IconSchool,
	IconBuildingSkyscraper,
	IconTableExport,
} from "@tabler/icons-react";
import type { ClassroomForWithSyllabus, ComparisonResult, Ue } from "@/types";
import React, { useState } from "react";
import {
	ThemedPaper,
	ThemedTitle,
	ThemedText,
} from "@/components/ui/ThemeComponents";
import classes from "./Compare.module.css";
import { handleExportComparisonAsPDF } from "@/app/lib/utils";

interface ComparisonResultProps {
	result: ComparisonResult;
	classroom1: ClassroomForWithSyllabus;
	classroom2: ClassroomForWithSyllabus;
}

export function CompareResult({
	result,
	classroom1,
	classroom2,
}: ComparisonResultProps) {
	const [activeTab, setActiveTab] = useState<string | null>("overview");
	const [showDetails, setShowDetails] = useState(false);

	const totalUEs =
		result.commonsUes.length +
		result.onlyInRecord1.length +
		result.onlyInRecord2.length;
	const commonPercentage = (result.commonsUes.length / totalUEs) * 100;
	const differentPercentage = (result.differentsUes.length / totalUEs) * 100;

	const renderUEList = (ues: Ue[], icon: React.ReactNode, color: string) => (
		<List spacing="xs" size="sm" center icon={icon} className={classes.ueList}>
			{ues.length === 0 ? (
				<ThemedText fs="italic" color="dimmed" ta="center" py="md">
					Aucune UE dans cette catégorie
				</ThemedText>
			) : (
				ues.map((ue) => (
					<List.Item key={ue.id} className={classes.ueItem}>
						<Group>
							<ThemedText fw={500}>{ue.name}</ThemedText>
							<Badge color={color} variant="light" radius="sm">
								{ue.slug}
							</Badge>
						</Group>
					</List.Item>
				))
			)}
		</List>
	);

	const getMatchColor = () => {
		if (commonPercentage >= 100) return "blue";
		if (commonPercentage >= 85) return "teal";
		if (commonPercentage >= 70) return "green";
		if (commonPercentage >= 50) return "yellow";
		if (commonPercentage >= 30) return "orange";
		return "red";
	};

	const getMatchLabel = () => {
		if (commonPercentage >= 100) return "Correspondance Optimale";
		if (commonPercentage >= 85) return "Correspondance Avancée";
		if (commonPercentage >= 70) return "Correspondance Moyenne";
		if (commonPercentage >= 50) return "Correspondance Partielle";
		if (commonPercentage >= 30) return "Correspondance Minimale";
		return "Correspondance Faible";
	};

	const getMatchDescription = () => {
		if (commonPercentage >= 100)
			return "Les programmes sont parfaitement alignés, avec toutes les UEs en commun.";
		if (commonPercentage >= 85)
			return "Excellente correspondance entre les programmes, avec la majorité des UEs en commun.";
		if (commonPercentage >= 70)
			return "Bonne correspondance entre les programmes, avec une majorité d'UEs en commun.";
		if (commonPercentage >= 50)
			return "Correspondance modérée entre les programmes, avec environ la moitié des UEs en commun.";
		if (commonPercentage >= 30)
			return "Correspondance limitée entre les programmes, avec peu d'UEs en commun.";
		return "Faible correspondance entre les programmes, avec très peu d'UEs en commun.";
	};

	const matchColor = getMatchColor();
	const matchLabel = getMatchLabel();
	const matchDescription = getMatchDescription();

	const handleExportPDF = () => {
		// Generate a filename based on the programs being compared
		// Add null checks for classroom designations
		const program1Name = classroom1.designation || "Programme_1";
		const program2Name = classroom2.designation || "Programme_2";
		const filename = `comparaison_${program1Name.replace(/\s+/g, "_")}_vs_${program2Name.replace(/\s+/g, "_")}`;

		// Call our export function
		handleExportComparisonAsPDF(result, classroom1, classroom2, filename);
	};

	const handleExportCSV = () => {
		// Prepare data for CSV export
		const totalUEs =
			result.commonsUes.length +
			result.onlyInRecord1.length +
			result.onlyInRecord2.length;
		const commonPercentage = (result.commonsUes.length / totalUEs) * 100;

		// Add null checks for classroom designations
		const program1Name = classroom1.designation || "Programme 1";
		const program2Name = classroom2.designation || "Programme 2";
		const program1Branch = classroom1.branch?.name || "Non spécifié";
		const program2Branch = classroom2.branch?.name || "Non spécifié";
		const program1Level = classroom1.level?.name || "Non spécifié";
		const program2Level = classroom2.level?.name || "Non spécifié";

		// Create CSV content
		const csvContent = [
			["Rapport de Comparaison de Programmes"],
			[""],
			["Programme 1", program1Name],
			["Filière", program1Branch],
			["Niveau", program1Level],
			[""],
			["Programme 2", program2Name],
			["Filière", program2Branch],
			["Niveau", program2Level],
			[""],
			["Résumé de la Comparaison"],
			["Taux de correspondance", `${commonPercentage.toFixed(1)}%`],
			["Niveau de correspondance", matchLabel],
			["Total UEs", totalUEs.toString()],
			["UEs en commun", result.commonsUes.length.toString()],
			[
				"UEs uniquement dans Programme 1",
				result.onlyInRecord1.length.toString(),
			],
			[
				"UEs uniquement dans Programme 2",
				result.onlyInRecord2.length.toString(),
			],
			[""],
			["UEs en commun"],
		];

		// Add common UEs
		if (result.commonsUes.length > 0) {
			csvContent.push(["Nom", "Slug", "Description"]);
			result.commonsUes.forEach((ue: Ue) => {
				csvContent.push([ue.name, ue.slug, ue.description || ""]);
			});
		} else {
			csvContent.push(["Aucune UE en commun"]);
		}

		csvContent.push([""]);
		csvContent.push(["UEs uniquement dans Programme 1"]);

		// Add UEs only in Program 1
		if (result.onlyInRecord1.length > 0) {
			csvContent.push(["Nom", "Slug", "Description"]);
			result.onlyInRecord1.forEach((ue: Ue) => {
				csvContent.push([ue.name, ue.slug, ue.description || ""]);
			});
		} else {
			csvContent.push(["Aucune UE uniquement dans Programme 1"]);
		}

		csvContent.push([""]);
		csvContent.push(["UEs uniquement dans Programme 2"]);

		// Add UEs only in Program 2
		if (result.onlyInRecord2.length > 0) {
			csvContent.push(["Nom", "Slug", "Description"]);
			result.onlyInRecord2.forEach((ue: Ue) => {
				csvContent.push([ue.name, ue.slug, ue.description || ""]);
			});
		} else {
			csvContent.push(["Aucune UE uniquement dans Programme 2"]);
		}

		// Convert to CSV string
		const csv = csvContent.map((row) => row.join(",")).join("\n");

		// Create and download the CSV file
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`comparaison_${program1Name.replace(/\s+/g, "_")}_vs_${program2Name.replace(/\s+/g, "_")}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handlePrint = () => {
		// Create a printable version with all comparison details
		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		const totalUEs =
			result.commonsUes.length +
			result.onlyInRecord1.length +
			result.onlyInRecord2.length;
		const commonPercentage = (result.commonsUes.length / totalUEs) * 100;

		// Add null checks for classroom properties
		const program1Name = classroom1.designation || "Programme 1";
		const program2Name = classroom2.designation || "Programme 2";
		const program1Branch = classroom1.branch?.name || "Non spécifié";
		const program2Branch = classroom2.branch?.name || "Non spécifié";
		const program1Level = classroom1.level?.name || "Non spécifié";
		const program2Level = classroom2.level?.name || "Non spécifié";

		const html = `
			<html>
				<head>
					<title>Comparaison de Programmes</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; }
						.header { text-align: center; margin-bottom: 20px; }
						.program-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
						.program-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; width: 45%; }
						.program-1 { background-color: #f0f8ff; border-color: #0000ff; }
						.program-2 { background-color: #fff5ee; border-color: #ff8c00; }
						.summary { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f8f8; }
						.match-percentage { font-size: 24px; font-weight: bold; color: #333; }
						.match-label { font-size: 18px; margin: 10px 0; }
						.match-description { color: #666; }
						table { width: 100%; border-collapse: collapse; margin: 20px 0; }
						th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
						th { background-color: #f2f2f2; }
						.common-ues th { background-color: #e0f2f1; }
						.program1-ues th { background-color: #e3f2fd; }
						.program2-ues th { background-color: #fff3e0; }
						.stats-table { width: 50%; margin: 20px auto; }
						.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
						@media print {
							button { display: none; }
							.page-break { page-break-after: always; }
						}
					</style>
				</head>
				<body>
					<div class="header">
						<h1>Rapport de Comparaison de Programmes</h1>
						<p>Analyse détaillée des similitudes et différences</p>
					</div>

					<div class="program-info">
						<div class="program-card program-1">
							<h3>Programme 1</h3>
							<p><strong>Désignation:</strong> ${program1Name}</p>
							<p><strong>Filière:</strong> ${program1Branch}</p>
							<p><strong>Niveau:</strong> ${program1Level}</p>
						</div>

						<div class="program-card program-2">
							<h3>Programme 2</h3>
							<p><strong>Désignation:</strong> ${program2Name}</p>
							<p><strong>Filière:</strong> ${program2Branch}</p>
							<p><strong>Niveau:</strong> ${program2Level}</p>
						</div>
					</div>

					<div class="summary">
						<h2>Résumé de la Comparaison</h2>
						<p class="match-percentage">${commonPercentage.toFixed(1)}% de correspondance</p>
						<p class="match-label">${matchLabel}</p>
						<p class="match-description">${matchDescription}</p>

						<table class="stats-table">
							<tr>
								<th>Catégorie</th>
								<th>Nombre</th>
								<th>Pourcentage</th>
							</tr>
							<tr>
								<td>UEs en commun</td>
								<td>${result.commonsUes.length}</td>
								<td>${((result.commonsUes.length / totalUEs) * 100).toFixed(1)}%</td>
							</tr>
							<tr>
								<td>UEs uniquement dans Programme 1</td>
								<td>${result.onlyInRecord1.length}</td>
								<td>${((result.onlyInRecord1.length / totalUEs) * 100).toFixed(1)}%</td>
							</tr>
							<tr>
								<td>UEs uniquement dans Programme 2</td>
								<td>${result.onlyInRecord2.length}</td>
								<td>${((result.onlyInRecord2.length / totalUEs) * 100).toFixed(1)}%</td>
							</tr>
							<tr>
								<td><strong>Total</strong></td>
								<td><strong>${totalUEs}</strong></td>
								<td><strong>100%</strong></td>
							</tr>
						</table>
					</div>

					<div class="page-break"></div>

					<h2>Détails des UEs</h2>

					<h3>UEs en commun (${result.commonsUes.length})</h3>
					${
						result.commonsUes.length > 0
							? `
						<table class="common-ues">
							<tr>
								<th>Nom</th>
								<th>Slug</th>
								<th>Description</th>
							</tr>
							${result.commonsUes
								.map(
									(ue: Ue) => `
								<tr>
									<td>${ue.name}</td>
									<td>${ue.slug}</td>
									<td>${ue.description || "-"}</td>
								</tr>
							`,
								)
								.join("")}
						</table>
					`
							: "<p>Aucune UE en commun</p>"
					}

					<h3>UEs uniquement dans Programme 1 (${result.onlyInRecord1.length})</h3>
					${
						result.onlyInRecord1.length > 0
							? `
						<table class="program1-ues">
							<tr>
								<th>Nom</th>
								<th>Slug</th>
								<th>Description</th>
							</tr>
							${result.onlyInRecord1
								.map(
									(ue: Ue) => `
								<tr>
									<td>${ue.name}</td>
									<td>${ue.slug}</td>
									<td>${ue.description || "-"}</td>
								</tr>
							`,
								)
								.join("")}
						</table>
					`
							: "<p>Aucune UE uniquement dans Programme 1</p>"
					}

					<h3>UEs uniquement dans Programme 2 (${result.onlyInRecord2.length})</h3>
					${
						result.onlyInRecord2.length > 0
							? `
						<table class="program2-ues">
							<tr>
								<th>Nom</th>
								<th>Slug</th>
								<th>Description</th>
							</tr>
							${result.onlyInRecord2
								.map(
									(ue: Ue) => `
								<tr>
									<td>${ue.name}</td>
									<td>${ue.slug}</td>
									<td>${ue.description || "-"}</td>
								</tr>
							`,
								)
								.join("")}
						</table>
					`
							: "<p>Aucune UE uniquement dans Programme 2</p>"
					}

					<div class="footer">
						<p>Rapport généré le ${new Date().toLocaleDateString("fr-FR")} via SYHPUI - Système d'Harmonisation des Programmes d'Universités et IPES</p>
					</div>

					<div style="text-align: center; margin-top: 20px;">
						<button onclick="window.print()">Imprimer</button>
					</div>
				</body>
			</html>
		`;

		printWindow.document.write(html);
		printWindow.document.close();
	};

	return (
		<ThemedPaper
			shadow="md"
			p="xl"
			mt="xl"
			radius="md"
			className={`${classes.resultContainer} theme-card`}
		>
			<Group justify="apart" mb="xl">
				<ThemedTitle order={3} className={classes.title}>
					Résultats de la Comparaison
				</ThemedTitle>
				<Group>
					<Menu shadow="md" width={200} position="bottom-end">
						<Menu.Target>
							<Button
								leftSection={<IconTableExport size={18} />}
								variant="light"
								size="sm"
							>
								Exporter
							</Button>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconFileTypePdf size={18} />}
								onClick={handleExportPDF}
							>
								Exporter en PDF
							</Menu.Item>
							<Menu.Item
								leftSection={<IconFileTypeCsv size={18} />}
								onClick={handleExportCSV}
							>
								Exporter en CSV
							</Menu.Item>
							<Menu.Item
								leftSection={<IconPrinter size={18} />}
								onClick={handlePrint}
							>
								Imprimer
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Group>

			<Grid mb="xl" gutter="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ThemedPaper
						withBorder
						p="md"
						radius="md"
						className={classes.programCard}
					>
						<ThemedTitle order={5} mb="xs" className={classes.programTitle}>
							<ThemeIcon
								radius="xl"
								size="md"
								color="blue"
								variant="light"
								mr="xs"
							>
								<IconSchool size={16} />
							</ThemeIcon>
							Programme 1
						</ThemedTitle>
						<ThemedText fw={700} size="lg" mb="xs">
							{classroom1.designation || "Programme 1"}
						</ThemedText>
						<Group mt="xs">
							<Badge color="blue" variant="light">
								{classroom1.branch?.name || "Non spécifié"}
							</Badge>
							<Badge color="cyan" variant="light">
								{classroom1.level?.name || "Non spécifié"}
							</Badge>
						</Group>
					</ThemedPaper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ThemedPaper
						withBorder
						p="md"
						radius="md"
						className={classes.programCard}
					>
						<ThemedTitle order={5} mb="xs" className={classes.programTitle}>
							<ThemeIcon
								radius="xl"
								size="md"
								color="orange"
								variant="light"
								mr="xs"
							>
								<IconBuildingSkyscraper size={16} />
							</ThemeIcon>
							Programme 2
						</ThemedTitle>
						<ThemedText fw={700} size="lg" mb="xs">
							{classroom2.designation || "Programme 2"}
						</ThemedText>
						<Group mt="xs">
							<Badge color="orange" variant="light">
								{classroom2.branch?.name || "Non spécifié"}
							</Badge>
							<Badge color="yellow" variant="light">
								{classroom2.level?.name || "Non spécifié"}
							</Badge>
						</Group>
					</ThemedPaper>
				</Grid.Col>
			</Grid>

			<ThemedPaper
				withBorder
				p="md"
				radius="md"
				mb="xl"
				className={classes.summaryCard}
			>
				<Group justify="apart">
					<ThemedTitle order={4} className={classes.summaryTitle}>
						Résumé de la comparaison
					</ThemedTitle>
					<ActionIcon
						variant="subtle"
						onClick={() => setShowDetails(!showDetails)}
						title={showDetails ? "Masquer les détails" : "Afficher les détails"}
					>
						{showDetails ? (
							<IconChevronUp size={18} />
						) : (
							<IconChevronDown size={18} />
						)}
					</ActionIcon>
				</Group>

				<Group mt="md" justify="apart" align="flex-start">
					<Box className={classes.summaryStats}>
						<ThemedText fw={700} size="lg" color={matchColor}>
							{matchLabel}
						</ThemedText>
						<Progress.Root size={24} radius="xl" mt="xs" mb="sm">
							<Tooltip
								label={`${commonPercentage.toFixed(1)}% - ${matchLabel}`}
							>
								<Progress.Section value={commonPercentage} color={matchColor}>
									<Progress.Label>
										{commonPercentage.toFixed(0)}%
									</Progress.Label>
								</Progress.Section>
							</Tooltip>
						</Progress.Root>
						<ThemedText size="sm" className={classes.stepperText}>
							{totalUEs} UE(s) au total • {result.commonsUes.length} UE(s) en
							commun
						</ThemedText>
					</Box>

					<RingProgress
						sections={[
							{
								value: (result.commonsUes.length / totalUEs) * 100,
								color: "teal",
								tooltip: "UEs en commun",
							},
							{
								value: (result.onlyInRecord1.length / totalUEs) * 100,
								color: "blue",
								tooltip: "UEs uniquement dans Programme 1",
							},
							{
								value: (result.onlyInRecord2.length / totalUEs) * 100,
								color: "orange",
								tooltip: "UEs uniquement dans Programme 2",
							},
						]}
						label={
							<Center>
								<ThemedText fw={700} size="xl" ta="center">
									{commonPercentage.toFixed(0)}%
								</ThemedText>
							</Center>
						}
						size={120}
						thickness={12}
						roundCaps
						className={classes.ringProgress}
					/>
				</Group>

				<Collapse in={showDetails}>
					<Divider my="md" />
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
						<Box className={classes.statBox}>
							<Group gap="xs">
								<ThemeIcon color="teal" variant="light" radius="xl">
									<IconCheck size={16} />
								</ThemeIcon>
								<ThemedText fw={600}>UEs en commun</ThemedText>
							</Group>
							<ThemedText size="xl" fw={700} mt="xs">
								{result.commonsUes.length}
								<ThemedText span size="sm" ml={5} color="dimmed">
									({((result.commonsUes.length / totalUEs) * 100).toFixed(1)}%)
								</ThemedText>
							</ThemedText>
						</Box>

						<Box className={classes.statBox}>
							<Group gap="xs">
								<ThemeIcon color="blue" variant="light" radius="xl">
									<IconArrowsShuffle size={16} />
								</ThemeIcon>
								<ThemedText fw={600}>UEs uniquement dans P1</ThemedText>
							</Group>
							<ThemedText size="xl" fw={700} mt="xs">
								{result.onlyInRecord1.length}
								<ThemedText span size="sm" ml={5} color="dimmed">
									({((result.onlyInRecord1.length / totalUEs) * 100).toFixed(1)}
									%)
								</ThemedText>
							</ThemedText>
						</Box>

						<Box className={classes.statBox}>
							<Group gap="xs">
								<ThemeIcon color="orange" variant="light" radius="xl">
									<IconX size={16} />
								</ThemeIcon>
								<ThemedText fw={600}>UEs uniquement dans P2</ThemedText>
							</Group>
							<ThemedText size="xl" fw={700} mt="xs">
								{result.onlyInRecord2.length}
								<ThemedText span size="sm" ml={5} color="dimmed">
									({((result.onlyInRecord2.length / totalUEs) * 100).toFixed(1)}
									%)
								</ThemedText>
							</ThemedText>
						</Box>
					</SimpleGrid>

					<ThemedPaper
						withBorder
						p="md"
						radius="md"
						mt="md"
						className={classes.infoBox}
					>
						<Group gap="xs" mb="xs">
							<IconInfoCircle size={18} className={classes.infoIcon} />
							<ThemedText fw={600}>Interprétation</ThemedText>
						</Group>
						<ThemedText size="sm" className={classes.stepperText}>
							{matchDescription}
						</ThemedText>
					</ThemedPaper>
				</Collapse>
			</ThemedPaper>

			<Tabs
				value={activeTab}
				onChange={setActiveTab}
				variant="pills"
				radius="md"
				className={classes.tabs}
			>
				<Tabs.List>
					<Tabs.Tab value="overview" leftSection={<IconChartPie size={16} />}>
						Vue d'ensemble
					</Tabs.Tab>
					<Tabs.Tab value="details" leftSection={<IconListDetails size={16} />}>
						Détails des UEs
					</Tabs.Tab>
					<Tabs.Tab value="charts" leftSection={<IconChartBar size={16} />}>
						Graphiques
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="overview" pt="xl">
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
						<ThemedPaper
							withBorder
							p="md"
							radius="md"
							className={classes.statCard}
						>
							<Group>
								<RingProgress
									sections={[
										{ value: commonPercentage, color: "teal" },
										{ value: 100 - commonPercentage, color: "gray" },
									]}
									label={
										<ThemedText size="lg" fw={700} ta="center">
											{commonPercentage.toFixed(1)}%
										</ThemedText>
									}
									size={90}
									thickness={12}
								/>
								<Box>
									<ThemedText fw={700} size="lg">
										UEs en commun
									</ThemedText>
									<ThemedText size="sm" color="dimmed">
										{result.commonsUes.length} UE(s) sur {totalUEs}
									</ThemedText>
								</Box>
							</Group>
						</ThemedPaper>

						<ThemedPaper
							withBorder
							p="md"
							radius="md"
							className={classes.statCard}
						>
							<Group>
								<RingProgress
									sections={[
										{
											value: (result.onlyInRecord1.length / totalUEs) * 100,
											color: "blue",
										},
										{
											value: (result.onlyInRecord2.length / totalUEs) * 100,
											color: "orange",
										},
									]}
									label={
										<ThemedText size="lg" fw={700} ta="center">
											{(
												((result.onlyInRecord1.length +
													result.onlyInRecord2.length) /
													totalUEs) *
												100
											).toFixed(1)}
											%
										</ThemedText>
									}
									size={90}
									thickness={12}
								/>
								<Box>
									<ThemedText fw={700} size="lg">
										UEs uniques
									</ThemedText>
									<ThemedText size="sm" color="dimmed">
										{result.onlyInRecord1.length + result.onlyInRecord2.length}{" "}
										UE(s)
									</ThemedText>
								</Box>
							</Group>
						</ThemedPaper>

						<ThemedPaper
							withBorder
							p="md"
							radius="md"
							className={classes.statCard}
						>
							<Group>
								<RingProgress
									sections={[
										{
											value: (result.onlyInRecord1.length / totalUEs) * 100,
											color: "blue",
										},
										{
											value: (result.onlyInRecord2.length / totalUEs) * 100,
											color: "orange",
										},
										{
											value: (result.commonsUes.length / totalUEs) * 100,
											color: "teal",
										},
									]}
									label={<IconPercentage size={24} />}
									size={90}
									thickness={12}
								/>
								<Box>
									<ThemedText fw={700} size="lg">
										Répartition
									</ThemedText>
									<ThemedText size="sm" color="dimmed">
										{totalUEs} UE(s) au total
									</ThemedText>
								</Box>
							</Group>
						</ThemedPaper>
					</SimpleGrid>

					<ThemedPaper
						withBorder
						p="md"
						radius="md"
						mt="xl"
						className={classes.matchContainer}
					>
						<ThemedTitle order={4} mb="md">
							Taux de correspondance
						</ThemedTitle>

						<Progress.Root size={24} radius="xl">
							<Tooltip
								label={`${commonPercentage.toFixed(1)}% - ${matchLabel}`}
							>
								<Progress.Section value={commonPercentage} color={matchColor}>
									<Progress.Label>
										{commonPercentage.toFixed(0)}%
									</Progress.Label>
								</Progress.Section>
							</Tooltip>
						</Progress.Root>

						<Box
							py={10}
							mt="md"
							style={{
								borderBottom: `3px solid var(--mantine-color-${matchColor}-6)`,
							}}
						>
							<Group justify="apart">
								<ThemedText fw={700} size="xl" color={matchColor}>
									{matchLabel}
								</ThemedText>
								<Badge size="xl" color={matchColor} variant="light">
									{commonPercentage.toFixed(1)}%
								</Badge>
							</Group>
						</Box>

						<ThemedText size="sm" mt="md" className={classes.stepperText}>
							{matchDescription}
						</ThemedText>
					</ThemedPaper>
				</Tabs.Panel>

				<Tabs.Panel value="details" pt="xl">
					<Accordion variant="separated" radius="md">
						<Accordion.Item value="common">
							<Accordion.Control
								icon={
									<ThemeIcon color="teal" variant="light" radius="xl">
										<IconCheck size={16} />
									</ThemeIcon>
								}
							>
								<ThemedText fw={600}>
									UEs en commun ({result.commonsUes.length})
								</ThemedText>
							</Accordion.Control>
							<Accordion.Panel>
								<ScrollArea
									h={300}
									offsetScrollbars
									scrollbarSize={6}
									type="hover"
								>
									{renderUEList(
										result.commonsUes,
										<IconCheck
											size={16}
											style={{ color: "var(--mantine-color-teal-6)" }}
										/>,
										"teal",
									)}
								</ScrollArea>
							</Accordion.Panel>
						</Accordion.Item>

						<Accordion.Item value="program1">
							<Accordion.Control
								icon={
									<ThemeIcon color="blue" variant="light" radius="xl">
										<IconArrowsShuffle size={16} />
									</ThemeIcon>
								}
							>
								<ThemedText fw={600}>
									UEs uniquement dans Programme 1 ({result.onlyInRecord1.length}
									)
								</ThemedText>
							</Accordion.Control>
							<Accordion.Panel>
								<ScrollArea
									h={300}
									offsetScrollbars
									scrollbarSize={6}
									type="hover"
								>
									{renderUEList(
										result.onlyInRecord1,
										<IconArrowsShuffle
											size={16}
											style={{ color: "var(--mantine-color-blue-6)" }}
										/>,
										"blue",
									)}
								</ScrollArea>
							</Accordion.Panel>
						</Accordion.Item>

						<Accordion.Item value="program2">
							<Accordion.Control
								icon={
									<ThemeIcon color="orange" variant="light" radius="xl">
										<IconX size={16} />
									</ThemeIcon>
								}
							>
								<ThemedText fw={600}>
									UEs uniquement dans Programme 2 ({result.onlyInRecord2.length}
									)
								</ThemedText>
							</Accordion.Control>
							<Accordion.Panel>
								<ScrollArea
									h={300}
									offsetScrollbars
									scrollbarSize={6}
									type="hover"
								>
									{renderUEList(
										result.onlyInRecord2,
										<IconX
											size={16}
											style={{ color: "var(--mantine-color-orange-6)" }}
										/>,
										"orange",
									)}
								</ScrollArea>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Tabs.Panel>

				<Tabs.Panel value="charts" pt="xl">
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
						<ThemedPaper
							withBorder
							p="md"
							radius="md"
							className={classes.chartCard}
						>
							<ThemedTitle order={5} mb="lg" ta="center">
								Répartition des UEs
							</ThemedTitle>
							<Center>
								<RingProgress
									sections={[
										{
											value: (result.commonsUes.length / totalUEs) * 100,
											color: "teal",
											tooltip: `${result.commonsUes.length} UEs en commun (${((result.commonsUes.length / totalUEs) * 100).toFixed(1)}%)`,
										},
										{
											value: (result.onlyInRecord1.length / totalUEs) * 100,
											color: "blue",
											tooltip: `${result.onlyInRecord1.length} UEs uniquement dans Programme 1 (${((result.onlyInRecord1.length / totalUEs) * 100).toFixed(1)}%)`,
										},
										{
											value: (result.onlyInRecord2.length / totalUEs) * 100,
											color: "orange",
											tooltip: `${result.onlyInRecord2.length} UEs uniquement dans Programme 2 (${((result.onlyInRecord2.length / totalUEs) * 100).toFixed(1)}%)`,
										},
									]}
									size={200}
									thickness={30}
									roundCaps
									label={
										<Center>
											<ThemedText fw={700} size="lg">
												{totalUEs} UEs
											</ThemedText>
										</Center>
									}
								/>
							</Center>

							<SimpleGrid cols={3} mt="xl">
								<Box ta="center">
									<Badge
										color="teal"
										size="lg"
										radius="sm"
										variant="dot"
										mb="xs"
									>
										UEs en commun
									</Badge>
									<ThemedText fw={700}>{result.commonsUes.length}</ThemedText>
								</Box>
								<Box ta="center">
									<Badge
										color="blue"
										size="lg"
										radius="sm"
										variant="dot"
										mb="xs"
									>
										UEs P1 uniquement
									</Badge>
									<ThemedText fw={700}>
										{result.onlyInRecord1.length}
									</ThemedText>
								</Box>
								<Box ta="center">
									<Badge
										color="orange"
										size="lg"
										radius="sm"
										variant="dot"
										mb="xs"
									>
										UEs P2 uniquement
									</Badge>
									<ThemedText fw={700}>
										{result.onlyInRecord2.length}
									</ThemedText>
								</Box>
							</SimpleGrid>
						</ThemedPaper>

						<ThemedPaper
							withBorder
							p="md"
							radius="md"
							className={classes.chartCard}
						>
							<ThemedTitle order={5} mb="lg" ta="center">
								Taux de correspondance
							</ThemedTitle>

							<Box className={classes.barChartContainer}>
								<ThemedText ta="center" mb="md" fw={600}>
									{commonPercentage.toFixed(1)}% de correspondance
								</ThemedText>

								<Box className={classes.barChart}>
									<Box className={classes.barChartLabel}>
										<ThemedText size="sm">0%</ThemedText>
									</Box>

									<Box className={classes.barChartTrack}>
										<Box
											className={classes.barChartFill}
											style={{
												width: `${commonPercentage}%`,
												backgroundColor: `var(--mantine-color-${matchColor}-6)`,
											}}
										/>

										<Box className={classes.barChartMarkers}>
											<Box
												className={classes.barChartMarker}
												style={{ left: "30%" }}
											>
												<Box className={classes.barChartMarkerLine} />
												<ThemedText
													size="xs"
													className={classes.barChartMarkerLabel}
												>
													Minimale
												</ThemedText>
											</Box>

											<Box
												className={classes.barChartMarker}
												style={{ left: "50%" }}
											>
												<Box className={classes.barChartMarkerLine} />
												<ThemedText
													size="xs"
													className={classes.barChartMarkerLabel}
												>
													Partielle
												</ThemedText>
											</Box>

											<Box
												className={classes.barChartMarker}
												style={{ left: "70%" }}
											>
												<Box className={classes.barChartMarkerLine} />
												<ThemedText
													size="xs"
													className={classes.barChartMarkerLabel}
												>
													Moyenne
												</ThemedText>
											</Box>

											<Box
												className={classes.barChartMarker}
												style={{ left: "85%" }}
											>
												<Box className={classes.barChartMarkerLine} />
												<ThemedText
													size="xs"
													className={classes.barChartMarkerLabel}
												>
													Avancée
												</ThemedText>
											</Box>

											<Box
												className={classes.barChartMarker}
												style={{ left: "100%" }}
											>
												<Box className={classes.barChartMarkerLine} />
												<ThemedText
													size="xs"
													className={classes.barChartMarkerLabel}
												>
													Optimale
												</ThemedText>
											</Box>
										</Box>
									</Box>

									<Box className={classes.barChartLabel}>
										<ThemedText size="sm">100%</ThemedText>
									</Box>
								</Box>

								<ThemedPaper
									withBorder
									p="sm"
									radius="md"
									mt="xl"
									className={classes.matchSummary}
								>
									<ThemedText fw={700} size="lg" color={matchColor} ta="center">
										{matchLabel}
									</ThemedText>
									<ThemedText
										size="sm"
										ta="center"
										mt="xs"
										className={classes.stepperText}
									>
										{matchDescription}
									</ThemedText>
								</ThemedPaper>
							</Box>
						</ThemedPaper>
					</SimpleGrid>
				</Tabs.Panel>
			</Tabs>
		</ThemedPaper>
	);
}
