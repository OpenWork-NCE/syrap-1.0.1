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
				Sigle de l'IPES :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.code}</span>
			</Text>
			<Text size="md" mt="md">
				Intitulé de l'IPES :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.name}</span>
			</Text>
			<Text size="md" mt="md">
				Téléphone : <span style={{ fontWeight: "bolder" }}>{datas.phone}</span>
			</Text>
			<Text size="md" mt="md">
				Email : <span style={{ fontWeight: "bolder" }}>{datas.email}</span>
			</Text>
			<Text size="md" mt="md">
				Décrêt de création :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.decret_creation}</span>
			</Text>
			<Text size="md" mt="md">
				Arreté d'ouverture :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.arrete_ouverture}</span>
			</Text>
			<Text size="md" mt="md">
				Université de tutelle :{" "}
				<span style={{ fontWeight: "bolder" }}>{datas.university}</span>
			</Text>
		</Paper>
	);
}
