"use client";

import {
	Anchor,
	Box,
	Breadcrumbs,
	Group,
	Paper,
	PaperProps,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import classes from "./PageHeader.module.css";

type BreadcrumbItem = {
	title: string;
	href: string;
};

type PageHeaderProps = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	breadcrumbItems?: BreadcrumbItem[];
	rightSection?: React.ReactNode;
} & Omit<PaperProps, "children">;

const PageHeader = (props: PageHeaderProps) => {
	const {
		title,
		description,
		icon,
		breadcrumbItems,
		rightSection,
		...others
	} = props;

	const breadcrumbs = breadcrumbItems?.map((item, index) => (
		<Anchor
			href={item.href}
			key={index}
			className={classes.breadcrumbLink}
			underline="never"
		>
			{item.title}
		</Anchor>
	));

	return (
		<Stack gap="sm">
			{/* Breadcrumb bar */}
			{breadcrumbItems && breadcrumbItems.length > 0 && (
				<Box className={classes.breadcrumbBar}>
					<Group gap={6} className={classes.breadcrumbGroup}>
						<Anchor href="/dashboard" className={classes.breadcrumbHome}>
							<IconHome size={14} stroke={1.5} />
						</Anchor>
						<IconChevronRight size={12} className={classes.breadcrumbSeparator} />
						<Breadcrumbs
							separator={<IconChevronRight size={12} className={classes.breadcrumbSeparator} />}
							className={classes.breadcrumbs}
						>
							{breadcrumbs}
						</Breadcrumbs>
					</Group>
				</Box>
			)}

			{/* Main Header - compact */}
			<Paper className={classes.header} {...others}>
				<Group justify="space-between" align="center" wrap="nowrap">
					<Group gap="sm" align="center" wrap="nowrap">
						{icon && (
							<ThemeIcon
								size={40}
								radius="md"
								variant="light"
								className={classes.iconWrapper}
							>
								{icon}
							</ThemeIcon>
						)}
						<div>
							<Text component="h1" className={classes.title}>
								{title}
							</Text>
							{description && (
								<Text className={classes.description}>
									{description}
								</Text>
							)}
						</div>
					</Group>
					{rightSection && (
						<Box className={classes.rightSection}>
							{rightSection}
						</Box>
					)}
				</Group>
			</Paper>
		</Stack>
	);
};

export default PageHeader;
