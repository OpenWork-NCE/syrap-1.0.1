import { Flex, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";
import { useInstitution } from "@/app/context/SessionContext";
import { ThemedText } from "../ui/ThemeComponents";

interface Props {
	width?: string;
	height?: string;
}

export const Logo: React.FC<Props> = ({ width = "auto", height = "auto" }) => {
	const { institution } = useInstitution();
	return (
		<Flex 
			direction="row" 
			align="center" 
			gap={4}
			style={{ width, height }}
		>
			<Link
				href="/"
				style={{ textDecoration: "none" }}
				className={classes.heading}
			>
				<ThemedText fw="bolder" className={classes.logo}>
					IPES-SCpro{" "}
					<Text
						span
						fw="normal"
						size="md"
						className={classes.subheading}
						style={{ textTransform: "capitalize" }}
					>
						{institution?.slug ? institution.slug.toUpperCase() : ''}
					</Text>
				</ThemedText>
			</Link>
		</Flex>
	);
};
