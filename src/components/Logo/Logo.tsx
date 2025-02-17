import { Flex, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";
import { useInstitution } from "@/app/context/InstitutionContext";

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
				<Text fw="bolder" size="xl" style={{ textTransform: "uppercase" }}>
					SYRAP{" "}
					<Text
						component="span"
						fw="normal"
						size={"md"}
						className={classes.subheading}
						style={{ textTransform: "capitalize" }}
					>
						{institution?.slug?.toUpperCase()}
					</Text>
				</Text>
			</Link>
		</Flex>
	);
};
