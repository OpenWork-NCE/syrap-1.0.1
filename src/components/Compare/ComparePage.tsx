"use client";

import { useEffect, useState } from "react";
import { Container, Title, Grid, Paper, Button, Group } from "@mantine/core";
import { ProgramSelector } from "./ProgramSelector";
import {
	ClassroomForWithSyllabus,
	ComparisonResult,
	ShowUniversitWihClassrooms,
} from "@/types";
import { CompareResult } from "@/components/Compare/CompareResult";

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
	const [ipeses, setIpeses] = useState<ShowUniversitWihClassrooms[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const u = await fetch("http://localhost:3000/api/universities").then(
					(res) => res.json(),
				);
				const universities: ShowUniversitWihClassrooms[] = u.data;
				setUniversities(universities);
				setIpeses(universities);
			} catch (error) {
				console.log("Error fetching universities : ", error);
			}
		};
		fetchData();
	}, []);

	const handleCompare = async () => {
		if (classroom1 && classroom2) {
			try {
				console.log(
					"Voici les ids respectives des classes : ",
					classroom1.id,
					classroom2.id,
				);
				const result = await fetch(
					`http://localhost:3000/api/syllabus/${classroom1.id}/compare`,
					{
						method: "POST",
						body: JSON.stringify({ salle_id: String(classroom2.id) }),
					},
				).then((res) => res.json());
				console.log("Resultat de la comparaison : ", result);
				setComparisonResult(result);
			} catch (e) {
				console.log("Erreur lors de la comparaison des programmes ", e);
			}
		}
	};

	return (
		<Container size="xl" py="xl">
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Paper shadow="xs" p="md" withBorder>
						<ProgramSelector
							title="Université de Tutelle"
							institutes={universities}
							onClassroomSelect={setClassroom1}
						/>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Paper shadow="xs" p="md" withBorder>
						<ProgramSelector
							title="IPES"
							institutes={ipeses}
							onClassroomSelect={setClassroom2}
						/>
					</Paper>
				</Grid.Col>
			</Grid>
			<Group justify="center" mt="xl">
				<Button
					size="lg"
					onClick={handleCompare}
					disabled={!classroom1 || !classroom2}
				>
					Comparer les programmes
				</Button>
			</Group>
			{comparisonResult && (
				<CompareResult
					result={comparisonResult}
					classroom1={classroom1!}
					classroom2={classroom2!}
				/>
			)}
		</Container>
	);
}
