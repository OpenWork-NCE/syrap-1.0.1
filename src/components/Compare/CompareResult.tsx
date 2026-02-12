"use client";

import {
	Grid,
	RingProgress,
	Group,
	List,
	Badge,
	Progress,
	Tooltip,
	SimpleGrid,
	Box,
	ThemeIcon,
	Divider,
	ScrollArea,
	Center,
	Button,
	Stack,
} from "@mantine/core";
import {
	IconCheck,
	IconX,
	IconArrowsShuffle,
	IconFileTypePdf,
	IconSchool,
	IconBuildingSkyscraper,
} from "@tabler/icons-react";
import type { ClassroomForWithSyllabus, ComparisonResult, Ue } from "@/types";
import React from "react";
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
	instituteName1?: string;
	instituteName2?: string;
}

export function CompareResult({
	result,
	classroom1,
	classroom2,
	instituteName1,
	instituteName2,
}: ComparisonResultProps) {
	const totalUEs =
		result.commonsUes.length +
		result.onlyInRecord1.length +
		result.onlyInRecord2.length;
	const commonPercentage = (result.commonsUes.length / totalUEs) * 100;

	const renderUEList = (ues: Ue[], icon: React.ReactNode, color: string) => (
		<List spacing="xs" size="sm" center icon={icon} className={classes.ueList}>
			{ues.length === 0 ? (
				<ThemedText fs="italic" color="dimmed" ta="center" py="md">
					Aucune UE dans cette catégorie
				</ThemedText>
			) : (
				ues.map((ue) => (
					<List.Item key={ue.id} className={classes.ueItem}>
						<ThemedText fw={500} size="sm">
							{ue.name}
						</ThemedText>
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
		const program1Name = classroom1.designation || "Programme_1";
		const program2Name = classroom2.designation || "Programme_2";
		const filename = `comparaison_${program1Name.replace(/\s+/g, "_")}_vs_${program2Name.replace(/\s+/g, "_")}`;
		handleExportComparisonAsPDF(result, classroom1, classroom2, filename, instituteName1, instituteName2);
	};

	return (
		<ThemedPaper
			shadow="md"
			p="xl"
			mt="xl"
			radius="md"
			className={`${classes.resultContainer} theme-card`}
		>
			{/* Header: titre + export */}
			<Group justify="space-between" mb="lg">
				<ThemedTitle order={3} className={classes.title}>
					Résultats de la Comparaison
				</ThemedTitle>
				<Button
					leftSection={<IconFileTypePdf size={18} />}
					variant="light"
					size="sm"
					onClick={handleExportPDF}
				>
					Exporter en PDF
				</Button>
			</Group>

			{/* Programmes comparés : 2 colonnes */}
			<Grid mb="lg" gutter="md">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ThemedPaper
						withBorder
						p="sm"
						radius="md"
						className={classes.programCompactRow}
						style={{ borderLeft: "3px solid var(--mantine-color-blue-5)" }}
					>
						<Group gap="sm" wrap="nowrap">
							<ThemeIcon radius="xl" size="sm" color="blue" variant="light">
								<IconSchool size={14} />
							</ThemeIcon>
							<ThemedText size="xs" c="dimmed" tt="uppercase" fw={600} style={{ whiteSpace: "nowrap" }}>
								Université
							</ThemedText>
							<ThemedText fw={700} size="sm" lineClamp={1} style={{ flex: 1 }}>
								{instituteName1 || "—"}
							</ThemedText>
							<ThemedText size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
								{classroom1.branch?.name || "—"} · {classroom1.level?.name || "—"}
							</ThemedText>
						</Group>
					</ThemedPaper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ThemedPaper
						withBorder
						p="sm"
						radius="md"
						className={classes.programCompactRow}
						style={{ borderLeft: "3px solid var(--mantine-color-orange-5)" }}
					>
						<Group gap="sm" wrap="nowrap">
							<ThemeIcon radius="xl" size="sm" color="orange" variant="light">
								<IconBuildingSkyscraper size={14} />
							</ThemeIcon>
							<ThemedText size="xs" c="dimmed" tt="uppercase" fw={600} style={{ whiteSpace: "nowrap" }}>
								IPES
							</ThemedText>
							<ThemedText fw={700} size="sm" lineClamp={1} style={{ flex: 1 }}>
								{instituteName2 || "—"}
							</ThemedText>
							<ThemedText size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
								{classroom2.branch?.name || "—"} · {classroom2.level?.name || "—"}
							</ThemedText>
						</Group>
					</ThemedPaper>
				</Grid.Col>
			</Grid>

			{/* Score principal + Stats en une seule rangée */}
			<Grid mb="lg" gutter="md">
				{/* Colonne gauche : score principal */}
				<Grid.Col span={{ base: 12, md: 5 }}>
					<ThemedPaper
						withBorder
						p="md"
						radius="md"
						h="100%"
						className={classes.scoreCard}
					>
						<Group align="center" gap="md" wrap="nowrap">
							<RingProgress
								sections={[
									{
										value: commonPercentage,
										color: matchColor,
									},
									{
										value: 100 - commonPercentage,
										color: "gray.2",
									},
								]}
								label={
									<Center>
										<ThemedText fw={700} size="xl" ta="center">
											{commonPercentage.toFixed(0)}%
										</ThemedText>
									</Center>
								}
								size={100}
								thickness={10}
								roundCaps
							/>
							<Stack gap={4}>
								<ThemedText fw={700} size="lg" c={`${matchColor}.6`}>
									{matchLabel}
								</ThemedText>
								<Progress.Root size={8} radius="xl">
									<Tooltip
										label={`${commonPercentage.toFixed(1)}% — ${matchLabel}`}
									>
										<Progress.Section
											value={commonPercentage}
											color={matchColor}
										/>
									</Tooltip>
								</Progress.Root>
								<ThemedText size="xs" c="dimmed">
									{totalUEs} UE(s) au total — {result.commonsUes.length} en
									commun
								</ThemedText>
								<ThemedText size="xs" c="dimmed">
									{matchDescription}
								</ThemedText>
							</Stack>
						</Group>
					</ThemedPaper>
				</Grid.Col>

				{/* Colonne droite : 3 stats compactes */}
				<Grid.Col span={{ base: 12, md: 7 }}>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" h="100%">
						<ThemedPaper
							withBorder
							p="sm"
							radius="md"
							className={classes.compactStat}
						>
							<Group gap="xs" mb={4}>
								<ThemeIcon color="teal" variant="light" radius="xl" size="sm">
									<IconCheck size={14} />
								</ThemeIcon>
								<ThemedText size="xs" fw={600}>
									En commun
								</ThemedText>
							</Group>
							<Group justify="space-between" align="baseline">
								<ThemedText size="xl" fw={700}>
									{result.commonsUes.length}
								</ThemedText>
								<Badge color="teal" variant="light" size="sm">
									{commonPercentage.toFixed(1)}%
								</Badge>
							</Group>
							<Progress
								value={commonPercentage}
								color="teal"
								size={4}
								radius="xl"
								mt={4}
							/>
						</ThemedPaper>

						<ThemedPaper
							withBorder
							p="sm"
							radius="md"
							className={classes.compactStat}
						>
							<Group gap="xs" mb={4}>
								<ThemeIcon color="blue" variant="light" radius="xl" size="sm">
									<IconArrowsShuffle size={14} />
								</ThemeIcon>
								<ThemedText size="xs" fw={600}>
									Univ. seul
								</ThemedText>
							</Group>
							<Group justify="space-between" align="baseline">
								<ThemedText size="xl" fw={700}>
									{result.onlyInRecord1.length}
								</ThemedText>
								<Badge color="blue" variant="light" size="sm">
									{((result.onlyInRecord1.length / totalUEs) * 100).toFixed(1)}%
								</Badge>
							</Group>
							<Progress
								value={(result.onlyInRecord1.length / totalUEs) * 100}
								color="blue"
								size={4}
								radius="xl"
								mt={4}
							/>
						</ThemedPaper>

						<ThemedPaper
							withBorder
							p="sm"
							radius="md"
							className={classes.compactStat}
						>
							<Group gap="xs" mb={4}>
								<ThemeIcon color="orange" variant="light" radius="xl" size="sm">
									<IconX size={14} />
								</ThemeIcon>
								<ThemedText size="xs" fw={600}>
									IPES seul
								</ThemedText>
							</Group>
							<Group justify="space-between" align="baseline">
								<ThemedText size="xl" fw={700}>
									{result.onlyInRecord2.length}
								</ThemedText>
								<Badge color="orange" variant="light" size="sm">
									{((result.onlyInRecord2.length / totalUEs) * 100).toFixed(1)}%
								</Badge>
							</Group>
							<Progress
								value={(result.onlyInRecord2.length / totalUEs) * 100}
								color="orange"
								size={4}
								radius="xl"
								mt={4}
							/>
						</ThemedPaper>
					</SimpleGrid>
				</Grid.Col>
			</Grid>

			{/* Détails des UEs — 3 colonnes côte à côte */}
			<Divider
				mb="md"
				label={
					<ThemedText fw={600} size="sm">
						Détails des UEs
					</ThemedText>
				}
				labelPosition="left"
			/>

			<SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
				<ThemedPaper
					withBorder
					p="sm"
					radius="md"
					className={classes.ueColumn}
				>
					<Group gap="xs" mb="xs">
						<ThemeIcon color="teal" variant="light" radius="xl" size="sm">
							<IconCheck size={14} />
						</ThemeIcon>
						<ThemedText fw={600} size="sm">
							En commun
						</ThemedText>
						<Badge color="teal" variant="light" size="sm" ml="auto">
							{result.commonsUes.length}
						</Badge>
					</Group>
					<Divider mb="xs" />
					<ScrollArea
						h={280}
						offsetScrollbars
						scrollbarSize={6}
						type="hover"
					>
						{renderUEList(
							result.commonsUes,
							<IconCheck
								size={14}
								style={{ color: "var(--mantine-color-teal-6)" }}
							/>,
							"teal",
						)}
					</ScrollArea>
				</ThemedPaper>

				<ThemedPaper
					withBorder
					p="sm"
					radius="md"
					className={classes.ueColumn}
				>
					<Group gap="xs" mb="xs">
						<ThemeIcon color="blue" variant="light" radius="xl" size="sm">
							<IconArrowsShuffle size={14} />
						</ThemeIcon>
						<ThemedText fw={600} size="sm">
							Univ. seul
						</ThemedText>
						<Badge color="blue" variant="light" size="sm" ml="auto">
							{result.onlyInRecord1.length}
						</Badge>
					</Group>
					<Divider mb="xs" />
					<ScrollArea
						h={280}
						offsetScrollbars
						scrollbarSize={6}
						type="hover"
					>
						{renderUEList(
							result.onlyInRecord1,
							<IconArrowsShuffle
								size={14}
								style={{ color: "var(--mantine-color-blue-6)" }}
							/>,
							"blue",
						)}
					</ScrollArea>
				</ThemedPaper>

				<ThemedPaper
					withBorder
					p="sm"
					radius="md"
					className={classes.ueColumn}
				>
					<Group gap="xs" mb="xs">
						<ThemeIcon color="orange" variant="light" radius="xl" size="sm">
							<IconX size={14} />
						</ThemeIcon>
						<ThemedText fw={600} size="sm">
							IPES seul
						</ThemedText>
						<Badge color="orange" variant="light" size="sm" ml="auto">
							{result.onlyInRecord2.length}
						</Badge>
					</Group>
					<Divider mb="xs" />
					<ScrollArea
						h={280}
						offsetScrollbars
						scrollbarSize={6}
						type="hover"
					>
						{renderUEList(
							result.onlyInRecord2,
							<IconX
								size={14}
								style={{ color: "var(--mantine-color-orange-6)" }}
							/>,
							"orange",
						)}
					</ScrollArea>
				</ThemedPaper>
			</SimpleGrid>
		</ThemedPaper>
	);
}
