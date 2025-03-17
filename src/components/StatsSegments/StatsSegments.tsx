import { IconArrowUpRight, IconDeviceAnalytics } from "@tabler/icons-react";
import { Box, Group, Paper, Progress, SimpleGrid, Text } from "@mantine/core";
import classes from "./StatsSegments.module.css";

const data = [
	{ label: "Mobile", count: "204,001", part: 59, color: "#47d6ab" },
	{ label: "Desktop", count: "121,017", part: 35, color: "#03141a" },
	{ label: "Tablet", count: "31,118", part: 6, color: "#4fcdf7" },
];

export interface StatsSegmentProps {
	data: { label: string; count: string; part: number; color: string };
}

export function StatsSegments({ data }: StatsSegmentProps) {
	return (
		<>
			<Progress.Root
				size={50}
				classNames={{ label: classes.progressLabel }}
				mt={10}
			>
				<Progress.Section value={data.part} color={data.color} key={data.color}>
					<Progress.Label>{data.part}%</Progress.Label>
				</Progress.Section>
			</Progress.Root>
		</>
	);
}
