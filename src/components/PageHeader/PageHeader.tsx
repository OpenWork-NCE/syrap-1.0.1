"use client";

import {
	ActionIcon,
	Box,
	Breadcrumbs,
	BreadcrumbsProps,
	Button,
	Flex,
	Group,
	Paper,
	PaperProps,
	rem,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import Surface from "@/components/Surface";
import { useColorScheme } from "@mantine/hooks";
import { ThemedTitle } from "@/components/ui/ThemeComponents";
import classes from "./PageHeader.module.css";

type PageHeaderProps = {
	title: string;
	institution?: string;
	withActions?: boolean;
	breadcrumbItems?: any;
	invoiceAction?: boolean;
	uesAction?: boolean;
} & PaperProps;

const PageHeader = (props: PageHeaderProps) => {
	const {
		withActions,
		breadcrumbItems,
		title,
		institution,
		invoiceAction,
		uesAction,
		...others
	} = props;
	const theme = useMantineTheme();
	const colorScheme = useColorScheme();

	// const BREADCRUMBS_PROPS: Omit<BreadcrumbsProps, "children"> = {
	// 	style: {
	// 		a: {
	// 			padding: rem(8),
	// 			borderRadius: theme.radius.sm,
	// 			fontWeight: 500,
	// 			color: colorScheme === "dark" ? theme.white : theme.black,

	// 			"&:hover": {
	// 				transition: "all ease 150ms",
	// 				backgroundColor:
	// 					colorScheme === "dark"
	// 						? theme.colors.dark[5]
	// 						: theme.colors.gray[2],
	// 				textDecoration: "none",
	// 			},
	// 		},
	// 	},
	// };

	return (
		<>
			<Surface
				component={Paper}
				style={{ backgroundColor: "transparent" }}
				{...others}
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
						<Flex align="center" gap="sm">
							<ActionIcon variant="subtle">
								<IconRefresh size={16} />
							</ActionIcon>
						</Flex>
					</Flex>
				) : (
					<Stack gap="sm">
						<ThemedTitle
							order={2}
							className={`${classes.title} theme-text-gradient`}
						>
							{title}
						</ThemedTitle>
						{/* {breadcrumbItems && (
							<Breadcrumbs {...BREADCRUMBS_PROPS}>
								{breadcrumbItems}
							</Breadcrumbs>
						)} */}
					</Stack>
				)}
			</Surface>
		</>
	);
};

export default PageHeader;
