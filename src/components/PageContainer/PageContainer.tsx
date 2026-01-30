"use client";

import {
	Anchor,
	Box,
	Breadcrumbs,
	BreadcrumbsProps,
	Container,
	type ContainerProps,
	Flex,
	Paper,
	rem,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import type { FC } from "react";
import { ThemedTitle } from "@/components/ui/ThemeComponents";
import Surface from "@/components/Surface";
import { useColorScheme } from "@mantine/hooks";
import classes from "./PageContainer.module.css";

type PageContainerProps = {
	title: string;
	withActions?: boolean;
	items?: { label: string; href: string }[];
	children: React.ReactNode;
} & Pick<ContainerProps, "fluid">;

export const PageContainer: FC<PageContainerProps> = ({
	children,
	title,
	items,
	withActions = false,
	fluid = true,
}) => {
	const theme = useMantineTheme();
	const colorScheme = useColorScheme();

	const BREADCRUMBS_PROPS: Omit<BreadcrumbsProps, "children"> = {
		style: {
			a: {
				padding: rem(8),
				borderRadius: theme.radius.sm,
				fontWeight: 500,
				color: colorScheme === "dark" ? theme.white : theme.black,

				"&:hover": {
					transition: "all ease 150ms",
					backgroundColor:
						colorScheme === "dark"
							? theme.colors.dark[5]
							: theme.colors.gray[2],
					textDecoration: "none",
				},
			},
		},
	};

	return (
		<Container px={0} fluid={fluid}>
			<Surface
				component={Paper}
				style={{ backgroundColor: "transparent" }}
				className={classes.container}
			>
				{withActions ? (
					<Flex
						justify="space-between"
						direction={{ base: "column", sm: "row" }}
						gap={{ base: "sm", sm: 4 }}
					>
						<Stack gap={4}>
							<ThemedTitle
								order={2}
								className={`${classes.title} theme-text-gradient`}
							>
								{title}
							</ThemedTitle>
							<Text>Heureux de vous revoir, {title}!</Text>
						</Stack>
					</Flex>
				) : (
					<Stack gap="sm">
						<ThemedTitle
							order={2}
							className={`${classes.title} theme-text-gradient`}
						>
							{title}
						</ThemedTitle>
						{items && items.length > 0 && (
							<Breadcrumbs {...BREADCRUMBS_PROPS}>
								{items.map((item) => (
									<Anchor key={item.label} href={item.href}>
										{item.label}
									</Anchor>
								))}
							</Breadcrumbs>
						)}
					</Stack>
				)}

				<Box className={classes.content}>{children}</Box>
			</Surface>
		</Container>
	);
};
