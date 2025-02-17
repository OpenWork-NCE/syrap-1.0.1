"use client";

import {
	Paper,
	Title,
	Text,
	Grid,
	RingProgress,
	Group,
	List,
	Card,
	Badge,
	Progress,
	Tooltip,
} from "@mantine/core";
import { IconCheck, IconX, IconArrowsShuffle } from "@tabler/icons-react";
import type { ClassroomForWithSyllabus, ComparisonResult, Ue } from "@/types";
import { StatsSegments } from "@/components/StatsSegments/StatsSegments";

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
	const totalUEs =
		result.commonsUes.length +
		result.onlyInRecord1.length +
		result.onlyInRecord2.length;
	const commonPercentage = (result.commonsUes.length / totalUEs) * 100;
	const differentPercentage = (result.differentsUes.length / totalUEs) * 100;

	const renderUEList = (ues: Ue[], icon: React.ReactNode, color: string) => (
		<List spacing="xs" size="sm" center icon={icon}>
			{ues.map((ue) => (
				<List.Item key={ue.id}>
					<Group>
						<Text>{ue.name}</Text>
						<Badge color={color} variant="light">
							{ue.slug}
						</Badge>
					</Group>
				</List.Item>
			))}
		</List>
	);

	return (
		<Paper shadow="xs" p="xl" mt="xl" withBorder>
			<Title order={3} style={{ textAlign: "center" }} mb="xl">
				Résultats de la Comparaison
			</Title>

			<Grid mb="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder p="md">
						<Text fw={500} size="lg" mb="xs">
							Programme 1
						</Text>
						<Text>{classroom1.designation}</Text>
						<Text>
							{classroom1.filiere.name} - {classroom1.niveau.name}
						</Text>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder p="md">
						<Text fw={500} size="lg" mb="xs">
							Programme 2
						</Text>
						<Text>{classroom2.designation}</Text>
						<Text>
							{classroom2.filiere.name} - {classroom2.niveau.name}
						</Text>
					</Card>
				</Grid.Col>
			</Grid>

			<Grid>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<RingProgress
						sections={[
							{ value: commonPercentage, color: "teal" },
							{ value: 100 - commonPercentage, color: "gray" },
						]}
						label={
							<Text size="xl" ta="center">
								{commonPercentage.toFixed(1)}%
							</Text>
						}
					/>
					<Text ta="center" mt="sm" fw={500}>
						UEs en commun
					</Text>
					<Text ta="center" size="sm" color="dimmed">
						{result.commonsUes.length} UE(s)
					</Text>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
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
								color: "gray",
							},
						]}
						label={
							<Text size="xl" ta="center">
								{differentPercentage.toFixed(1)}%
							</Text>
						}
					/>
					<Text ta="center" mt="sm" fw={500}>
						UEs différentes
					</Text>
					<Text ta="center" size="sm" color="dimmed">
						{result.differentsUes.length} UE(s)
					</Text>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
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
							<Text size="xl" ta="center">
								{(
									((result.onlyInRecord1.length + result.onlyInRecord2.length) /
										totalUEs) *
									100
								).toFixed(1)}
								%
							</Text>
						}
					/>
					<Text ta="center" mt="sm" fw={500}>
						UEs uniques
					</Text>
					<Text ta="center" size="sm" color="dimmed">
						{result.onlyInRecord1.length + result.onlyInRecord2.length} UE(s)
					</Text>
				</Grid.Col>
			</Grid>

			<Grid mt="xl">
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Title order={5} mb="md">
						UEs en commun
					</Title>
					{renderUEList(
						result.commonsUes,
						<IconCheck size={16} style={{ color: "teal" }} />,
						"teal",
					)}
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Title order={5} mb="md">
						UEs uniquement dans le Programme 1
					</Title>
					{renderUEList(
						result.onlyInRecord1,
						<IconArrowsShuffle size={16} style={{ color: "blue" }} />,
						"blue",
					)}
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Title order={5} mb="md">
						UEs uniquement dans le Programme 2
					</Title>
					{renderUEList(
						result.onlyInRecord2,
						<IconX size={16} style={{ color: "orange" }} />,
						"orange",
					)}
				</Grid.Col>
			</Grid>

			<Title order={5} my="md">
				Taux de correspondance
			</Title>
			<Progress.Root size={100}>
				{commonPercentage >= 10 && (
					<Tooltip label="Low (0-9%)">
						<Progress.Section value={9} color="#2C3E50">
							<Progress.Label>0-9%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage >= 30 && (
					<Tooltip label="Minimal Match (10-29%)">
						<Progress.Section value={20} color="#E74C3C">
							<Progress.Label>10-29%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage >= 50 && (
					<Tooltip label="Weak Match (30-49%)">
						<Progress.Section value={20} color="#E67E22">
							<Progress.Label>30-49%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage >= 70 && (
					<Tooltip label="Medium Match (50-69%)">
						<Progress.Section value={20} color="#F1C40F">
							<Progress.Label>50-69%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage >= 85 && (
					<Tooltip label="Strong Match (70-84%)">
						<Progress.Section value={15} color="#3498DB">
							<Progress.Label>70-84%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage >= 100 && (
					<Tooltip label="Premium Match (85-99%)">
						<Progress.Section value={14} color="#27AE60">
							<Progress.Label>85-99%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}

				{commonPercentage == 100 && (
					<Tooltip label="Ultimate Match (100%)">
						<Progress.Section value={1} color="#2ECC71">
							<Progress.Label>100%</Progress.Label>
						</Progress.Section>
					</Tooltip>
				)}
			</Progress.Root>
		</Paper>
	);
}
