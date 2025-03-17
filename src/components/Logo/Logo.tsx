import { Flex } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";
import { useInstitution } from "@/app/context/InstitutionContext";
import { ThemedText } from "../ui/ThemeComponents";

interface Props {
	width?: string;
	height?: string;
}

export const Logo: React.FC<Props> = () => {
	const { institution } = useInstitution();
	console.log("Institution", institution);
	return (
		<Flex direction="row" align="center" gap={4}>
			<Link
				href="/"
				style={{ textDecoration: "none" }}
				className={classes.heading}
			>
				<ThemedText fw="bolder" className={classes.logo}>
					SYRAP{" "}
					<ThemedText
						component="span"
						fw="normal"
						size={"md"}
						className={classes.subheading}
						style={{ textTransform: "capitalize" }}
					>
						{institution?.slug?.toUpperCase()}
					</ThemedText>
				</ThemedText>
			</Link>
		</Flex>
	);
};
