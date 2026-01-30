"use client";

import {
	Box,
	Button,
	Card,
	Container,
	Paper,
	Text,
	Title,
	useMantineTheme,
	type ButtonProps,
	type CardProps,
	type PaperProps,
	type TextProps,
	type TitleProps,
	type BoxProps,
	type ContainerProps,
	Group,
	Flex,
	Anchor,
	type GroupProps,
	type FlexProps,
	type AnchorProps,
	NavLink,
	type NavLinkProps,
	ActionIcon,
	type ActionIconProps,
} from "@mantine/core";
import { forwardRef, ReactNode } from "react";
import { useThemeCssVariables } from "@/styles/theme-utils";
import { useEffect } from "react";

// Define extended prop types with children
type WithChildren<T> = T & { children?: ReactNode };

/**
 * ThemeProvider component that injects CSS variables into the document
 * This should be used at the root of the application
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
	// Use the hook to inject CSS variables
	useThemeCssVariables();

	return <>{children}</>;
}

/**
 * Themed Card component with consistent styling
 */
export const ThemedCard = forwardRef<
	HTMLDivElement,
	WithChildren<CardProps & { gradient?: boolean }>
>(({ children, gradient = false, className, ...props }, ref) => {
	const theme = useMantineTheme();

	return (
		<Card
			ref={ref}
			className={`${gradient ? "theme-card theme-card-gradient" : "theme-card"} ${className || ""}`}
			{...props}
		>
			{children}
		</Card>
	);
});
ThemedCard.displayName = "ThemedCard";

/**
 * Themed Paper component with consistent styling
 */
export const ThemedPaper = forwardRef<
	HTMLDivElement,
	WithChildren<PaperProps & { gradient?: boolean }>
>(({ children, gradient = false, className, ...props }, ref) => {
	return (
		<Paper
			ref={ref}
			className={`${gradient ? "theme-card theme-card-gradient" : "theme-card"} ${className || ""}`}
			{...props}
		>
			{children}
		</Paper>
	);
});
ThemedPaper.displayName = "ThemedPaper";

/**
 * Themed Title component with gradient text option
 */
export const ThemedTitle = forwardRef<
	HTMLHeadingElement,
	WithChildren<TitleProps & { gradient?: boolean }>
>(({ children, gradient = false, className, ...props }, ref) => {
	return (
		<Title
			ref={ref}
			className={`${gradient ? "theme-title theme-title-gradient" : "theme-title"} ${className || ""}`}
			{...props}
		>
			{children}
		</Title>
	);
});
ThemedTitle.displayName = "ThemedTitle";

/**
 * Themed Button component with primary and outline variants
 */
export const ThemedButton = forwardRef<
	HTMLButtonElement,
	WithChildren<ButtonProps & { variant?: "primary" | "outline" | "default" }>
>(({ children, variant = "default", className, ...props }, ref) => {
	let variantClass = "theme-button";
	if (variant === "primary") variantClass += " theme-button-primary";
	if (variant === "outline") variantClass += " theme-button-outline";

	return (
		<Button
			ref={ref}
			className={`${variantClass} ${className || ""}`}
			{...props}
		>
			{children}
		</Button>
	);
});
ThemedButton.displayName = "ThemedButton";

/**
 * Themed Container component with consistent styling
 */
export const ThemedContainer = forwardRef<
	HTMLDivElement,
	WithChildren<ContainerProps>
>(({ children, className, ...props }, ref) => {
	return (
		<Container
			ref={ref}
			className={`theme-container ${className || ""}`}
			{...props}
		>
			{children}
		</Container>
	);
});
ThemedContainer.displayName = "ThemedContainer";

/**
 * Themed Section component with consistent styling
 */
export const ThemedSection = forwardRef<HTMLDivElement, WithChildren<BoxProps>>(
	({ children, className, ...props }, ref) => {
		return (
			<Box ref={ref} className={`theme-section ${className || ""}`} {...props}>
				{children}
			</Box>
		);
	},
);
ThemedSection.displayName = "ThemedSection";

/**
 * Themed Form Container component
 */
export const ThemedFormContainer = forwardRef<
	HTMLDivElement,
	WithChildren<BoxProps>
>(({ children, className, ...props }, ref) => {
	return (
		<Box
			ref={ref}
			className={`theme-form-container ${className || ""}`}
			{...props}
		>
			{children}
		</Box>
	);
});
ThemedFormContainer.displayName = "ThemedFormContainer";

/**
 * Themed Text component with gradient option
 */
export const ThemedText = forwardRef<
	HTMLParagraphElement,
	WithChildren<TextProps & { gradient?: boolean }>
>(({ children, gradient = false, className, ...props }, ref) => {
	return (
		<Text
			ref={ref}
			className={`${gradient ? "theme-title-gradient" : ""} ${className || ""}`}
			{...props}
		>
			{children}
		</Text>
	);
});
ThemedText.displayName = "ThemedText";

/**
 * Themed Auth Container component for auth pages
 */
export const ThemedAuthContainer = forwardRef<
	HTMLDivElement,
	WithChildren<BoxProps>
>(({ children, className, ...props }, ref) => {
	return (
		<Box
			ref={ref}
			className={`theme-auth-container ${className || ""}`}
			{...props}
		>
			{children}
		</Box>
	);
});
ThemedAuthContainer.displayName = "ThemedAuthContainer";

/**
 * Themed Auth Card component for auth forms
 */
export const ThemedAuthCard = forwardRef<
	HTMLDivElement,
	WithChildren<CardProps>
>(({ children, className, ...props }, ref) => {
	return (
		<Card ref={ref} className={`theme-auth-card ${className || ""}`} {...props}>
			{children}
		</Card>
	);
});
ThemedAuthCard.displayName = "ThemedAuthCard";

/**
 * Themed Navbar component
 */
export const ThemedNavbar = forwardRef<HTMLDivElement, WithChildren<BoxProps>>(
	({ children, className, ...props }, ref) => {
		return (
			<Box ref={ref} className={`theme-navbar ${className || ""}`} {...props}>
				{children}
			</Box>
		);
	},
);
ThemedNavbar.displayName = "ThemedNavbar";

/**
 * Themed Navbar Link component
 */
export const ThemedNavbarLink = forwardRef<
	HTMLAnchorElement,
	WithChildren<AnchorProps & { active?: boolean }>
>(({ children, className, active, ...props }, ref) => {
	return (
		<Anchor
			ref={ref}
			className={`theme-navbar-link ${active ? "theme-navbar-link-active" : ""} ${className || ""}`}
			{...props}
		>
			{children}
		</Anchor>
	);
});
ThemedNavbarLink.displayName = "ThemedNavbarLink";

/**
 * Themed NavLink component for sidebar navigation
 */
export const ThemedNavLink = forwardRef<
	HTMLAnchorElement,
	WithChildren<NavLinkProps>
>(({ children, className, ...props }, ref) => {
	return (
		<NavLink ref={ref} className={`${className || ""}`} {...props}>
			{children}
		</NavLink>
	);
});
ThemedNavLink.displayName = "ThemedNavLink";

/**
 * Themed Header component
 */
export const ThemedHeader = forwardRef<HTMLDivElement, WithChildren<BoxProps>>(
	({ children, className, ...props }, ref) => {
		return (
			<Box ref={ref} className={`theme-header ${className || ""}`} {...props}>
				{children}
			</Box>
		);
	},
);
ThemedHeader.displayName = "ThemedHeader";

/**
 * Themed Group component
 */
export const ThemedGroup = forwardRef<HTMLDivElement, WithChildren<GroupProps>>(
	({ children, className, ...props }, ref) => {
		return (
			<Group ref={ref} className={`${className || ""}`} {...props}>
				{children}
			</Group>
		);
	},
);
ThemedGroup.displayName = "ThemedGroup";

/**
 * Themed Flex component
 */
export const ThemedFlex = forwardRef<HTMLDivElement, WithChildren<FlexProps>>(
	({ children, className, ...props }, ref) => {
		return (
			<Flex ref={ref} className={`${className || ""}`} {...props}>
				{children}
			</Flex>
		);
	},
);
ThemedFlex.displayName = "ThemedFlex";

/**
 * Themed ActionIcon component
 */
export const ThemedActionIcon = forwardRef<
	HTMLButtonElement,
	WithChildren<ActionIconProps>
>(({ children, className, ...props }, ref) => {
	return (
		<ActionIcon
			ref={ref}
			className={`theme-action-icon ${className || ""}`}
			{...props}
		>
			{children}
		</ActionIcon>
	);
});
ThemedActionIcon.displayName = "ThemedActionIcon";

/**
 * Themed Page Background component
 */
export const ThemedPageBackground = forwardRef<
	HTMLDivElement,
	WithChildren<BoxProps>
>(({ children, className, ...props }, ref) => {
	return (
		<Box ref={ref} className={`theme-page-bg ${className || ""}`} {...props}>
			{children}
		</Box>
	);
});
ThemedPageBackground.displayName = "ThemedPageBackground";
