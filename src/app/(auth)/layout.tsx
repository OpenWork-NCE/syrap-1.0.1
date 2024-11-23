import { Anchor, Box, Center, Flex, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import classes from "./layout.module.css";

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	return (
		<Box className={classes.wrapper}>
			<Flex
				flex={1}
				align={"center"}
				justify={"space-evenly"}
				style={{
					width: "100%",
					height: "100vh",
				}}
			>
				<Stack flex={1} align={"center"} justify={"center"}>
					<Title order={1} fw="bolder">
						SYRAP
					</Title>
					<Box
						style={{
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{children}
					</Box>
				</Stack>
				<Stack
					flex={1}
					align={"center"}
					justify={"center"}
					style={{
						width: "100%",
						height: "100vh",
					}}
				>
					<Image
						src={"/static/images/thumbnail.png"}
						alt="Your description"
						width={650} // Set image width
						height={650} // Set image height
						style={{ objectFit: "contain" }} // Optional: Ensure image fits within the bounds
					/>
				</Stack>
			</Flex>
		</Box>
	);
}
