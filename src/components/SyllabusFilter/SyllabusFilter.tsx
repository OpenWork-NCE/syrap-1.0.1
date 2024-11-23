import {
	Box,
	Button,
	Flex,
	Group,
	Paper,
	Select,
	Stack,
	Text,
} from "@mantine/core";
import { Icon } from "@radix-ui/react-select";
import { IconFilter } from "@tabler/icons-react";

export default function () {
	return (
		<>
			<Paper shadow={"xl"} p={"md"} style={{ width: "100%" }}>
				<Group gap={"xs"} mb={15}>
					<IconFilter />
					<Text size={"xl"}>Filtrer</Text>
				</Group>
				<Flex
					flex={1}
					align={{ md: "end" }}
					direction={{ base: "column", sm: "row" }}
					gap={{ base: "sm", sm: "lg" }}
					// justify={{ sm: "center" }}
				>
					<Flex
						direction={{ base: "column", sm: "row" }}
						gap={{ base: "sm", sm: "lg" }}
						// justify={{ xs: "center" }}
						align={{ xs: "center", md: "center" }}
						style={{ flexGrow: 1 }}
					>
						<Select
							label="Choix de l'IPES"
							size={"md"}
							placeholder="Choisir un IPES"
							data={["React", "Angular", "Vue", "Svelte"]}
						/>
						<Select
							label="Choix de la Filière"
							placeholder="Choisir une filière"
							size={"md"}
							data={["React", "Angular", "Vue", "Svelte"]}
						/>
						<Select
							label="Choisir un Niveau"
							placeholder="Choix du niveau"
							size={"md"}
							data={["React", "Angular", "Vue", "Svelte"]}
						/>
					</Flex>
					<Flex gap={"md"}>
						<Button size={"md"}>Ajouter un programme</Button>
						<Button size={"md"}>Rechercher le programme</Button>
					</Flex>
				</Flex>
			</Paper>
			<Paper shadow={"xl"} p={"md"} mt={10}>
				<Stack>
					<Text size={"lg"}>
						Filière :{" "}
						<span style={{ fontWeight: "bolder" }}>une bonne note</span>
					</Text>
					<Text size={"lg"}>
						Niveau :{" "}
						<span style={{ fontWeight: "bolder" }}>une bonne note</span>
					</Text>
				</Stack>
			</Paper>
		</>
	);
}
