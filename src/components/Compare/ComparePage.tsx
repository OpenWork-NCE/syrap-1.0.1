"use client";

import { useEffect, useState } from "react";
import {
	Container,
	Grid,
	Button,
	Group,
	Loader,
	Alert,
	Box,
	Transition,
} from "@mantine/core";
import { IconAlertCircle, IconArrowsShuffle } from "@tabler/icons-react";
import { ProgramSelector } from "./ProgramSelector";
import {
	ClassroomForWithSyllabus,
	ComparisonResult,
	ShowIpesWithClassrooms,
	ShowUniversitWihClassrooms,
} from "@/types";
import { CompareResult } from "@/components/Compare/CompareResult";
import {
	ThemedPaper,
	ThemedTitle,
	ThemedSection,
} from "@/components/ui/ThemeComponents";
import classes from "./Compare.module.css";
import { innerUrl } from "@/app/lib/utils";

export default function ComparePage() {
	const [classroom1, setClassroom1] = useState<ClassroomForWithSyllabus | null>(
		null,
	);
	const [classroom2, setClassroom2] = useState<ClassroomForWithSyllabus | null>(
		null,
	);
	const [comparisonResult, setComparisonResult] =
		useState<ComparisonResult | null>(null);
	const [universities, setUniversities] = useState<
		ShowUniversitWihClassrooms[]
	>([]);
	const [ipeses, setIpeses] = useState<ShowIpesWithClassrooms[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDataLoading, setIsDataLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setIsDataLoading(true);
			setError(null);
			try {
				const [universitiesResponse, ipesesResponse] = await Promise.all([
					fetch(innerUrl("/api/universities")),
					fetch(innerUrl("/api/ipess")),
				]);

				if (!universitiesResponse.ok || !ipesesResponse.ok) {
					throw new Error("Failed to fetch data");
				}

				const u = await universitiesResponse.json();
				const i = await ipesesResponse.json();

				const universities: ShowUniversitWihClassrooms[] = u.data;
				const ipess: ShowIpesWithClassrooms[] = i.data;

				setUniversities(universities);
				setIpeses(ipess);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError(
					"Impossible de charger les données. Veuillez réessayer plus tard.",
				);
			} finally {
				setIsDataLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleCompare = async () => {
		if (classroom1 && classroom2) {
			setIsLoading(true);
			setError(null);
			setComparisonResult(null);

			try {
				const response = await fetch(
					innerUrl(`/api/syllabus/${classroom1.id}/compare`),
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ salle_id: String(classroom2.id) }),
					},
				);

				if (!response.ok) {
					throw new Error("Failed to compare programs");
				}

				const result = await response.json();
				setComparisonResult(result);
			} catch (e) {
				console.error("Error comparing programs:", e);
				setError(
					"Une erreur est survenue lors de la comparaison des programmes.",
				);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<ThemedSection className="theme-animate-fade">
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Erreur"
					color="red"
					mb="lg"
					variant="filled"
				>
					{error}
				</Alert>
			)}

			{isDataLoading ? (
				<Box className={classes.loaderContainer}>
					<Loader size="xl" variant="dots" />
					<ThemedTitle order={4} mt="md">
						Chargement des données...
					</ThemedTitle>
				</Box>
			) : (
				<>
					<Grid gutter="xl">
						<Grid.Col span={{ base: 12, md: 6 }}>
							<ThemedPaper
								shadow="md"
								p="lg"
								radius="md"
								className="theme-card"
							>
								<ProgramSelector
									title="Université de Tutelle"
									instituteType="university"
									institutes={universities}
									onClassroomSelect={setClassroom1}
								/>
							</ThemedPaper>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<ThemedPaper
								shadow="md"
								p="lg"
								radius="md"
								className="theme-card"
							>
								<ProgramSelector
									title="IPES"
									instituteType="ipes"
									institutes={ipeses}
									onClassroomSelect={setClassroom2}
								/>
							</ThemedPaper>
						</Grid.Col>
					</Grid>

					<Group justify="center" mt="xl">
						<Button
							size="lg"
							leftSection={<IconArrowsShuffle size={20} />}
							onClick={handleCompare}
							disabled={!classroom1 || !classroom2 || isLoading}
							loading={isLoading}
							variant="gradient"
							gradient={{
								from: "var(--primary-6)",
								to: "var(--primary-4)",
								deg: 45,
							}}
							className={classes.compareButton}
						>
							{isLoading
								? "Comparaison en cours..."
								: "Comparer les programmes"}
						</Button>
					</Group>

					<Transition
						mounted={!!comparisonResult}
						transition="fade"
						duration={400}
					>
						{(styles) => (
							<div style={styles}>
								{comparisonResult && (
									<CompareResult
										result={comparisonResult}
										classroom1={classroom1!}
										classroom2={classroom2!}
									/>
								)}
							</div>
						)}
					</Transition>
				</>
			)}
		</ThemedSection>
	);
}
