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
	Stack,
	Text,
} from "@mantine/core";
import type { FC } from "react";
import { ThemedTitle } from "@/components/ui/ThemeComponents";
import Surface from "@/components/Surface";
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
	const BREADCRUMBS_PROPS: Omit<BreadcrumbsProps, "children"> = {
		className: classes.breadcrumbs,
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
