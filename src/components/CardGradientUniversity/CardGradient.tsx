import { Paper, Text } from "@mantine/core";
import classes from "./CardGradient.module.css";

interface CardGradientProps {
	datas: any;
	title: string;
}
export function CardGradient({ datas, title }: CardGradientProps) {
	return (
		<Paper withBorder radius="md" className={classes.card}>
			<Text size="xl" fw={900} mt="md" style={{ textTransform: "uppercase" }}>
				{title}
			</Text>
			<Text size="md" mt="md">
				Sigle de l'Université :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.code}</span>
			</Text>
			<Text size="md" mt="md">
				Intitulé de l'Université :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.name}</span>
			</Text>
			<Text size="md" mt="md">
				Téléphone : <span style={{ fontWeight: "bolder" }}>{datas.phone}</span>
			</Text>
			<Text size="md" mt="md">
				Email : <span style={{ fontWeight: "bolder" }}>{datas.email}</span>
			</Text>
			<Text size="md" mt="md">
				Nombre de Niveaux :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.levels_count}</span>
			</Text>
			<Text size="md" mt="md">
				Nombre de filières :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.branches_count}</span>
			</Text>
			<Text size="md" mt="md">
				Arrondissement :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.arrondissement}</span>
			</Text>
		</Paper>
	);
}
