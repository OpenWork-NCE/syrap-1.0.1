"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";

/**
 * Common theme configuration shared across all themes
 */
const baseThemeConfig = {
	fontFamily: "Inter, sans-serif",
	headings: {
		fontFamily: "Inter, sans-serif",
		fontWeight: "700",
	},
	defaultRadius: "md",
	components: {
		Button: {
			defaultProps: {
				radius: "md",
			},
			styles: {
				root: {
					transition: "all 0.2s ease",
					position: "relative",
					overflow: "hidden",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
					},
				},
			},
		},
		Card: {
			defaultProps: {
				radius: "md",
				withBorder: true,
				padding: "lg",
			},
			styles: {
				root: {
					transition: "all 0.3s ease",
					backdropFilter: "blur(10px)",
					backgroundColor:
						"light-dark(rgba(255, 255, 255, 0.9), rgba(26, 27, 30, 0.8))",
					border:
						"1px solid light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))",
				},
			},
		},
		Paper: {
			defaultProps: {
				radius: "md",
				withBorder: true,
				p: "lg",
			},
			styles: {
				root: {
					transition: "all 0.3s ease",
					backdropFilter: "blur(10px)",
					backgroundColor:
						"light-dark(rgba(255, 255, 255, 0.9), rgba(26, 27, 30, 0.8))",
					border:
						"1px solid light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))",
				},
			},
		},
		Title: {
			styles: {
				root: {
					fontFamily: "var(--font-inter), var(--mantine-font-family)",
					fontWeight: 700,
				},
			},
		},
		TextInput: {
			defaultProps: {
				radius: "md",
			},
		},
		Select: {
			defaultProps: {
				radius: "md",
			},
		},
		Textarea: {
			defaultProps: {
				radius: "md",
			},
		},
	},
	other: {
		gradients: {
			primary:
				"linear-gradient(45deg, var(--mantine-color-primary-6), var(--mantine-color-primary-4))",
			secondary:
				"linear-gradient(45deg, var(--mantine-color-primary-7), var(--mantine-color-primary-5))",
			text: "linear-gradient(45deg, var(--mantine-color-primary-6), var(--mantine-color-primary-4))",
			border:
				"linear-gradient(90deg, transparent, var(--mantine-color-primary-6), var(--mantine-color-primary-4), transparent)",
		},
		transitions: {
			default: "all 0.3s ease",
			fast: "all 0.2s ease",
			slow: "all 0.5s ease",
		},
		shadows: {
			sm: "0 4px 6px rgba(0, 0, 0, 0.05)",
			md: "0 8px 15px rgba(0, 0, 0, 0.08)",
			lg: "0 12px 20px rgba(0, 0, 0, 0.1)",
			hover: "0 10px 20px rgba(0, 0, 0, 0.15)",
		},
	},
};

/**
 * Cenadi theme - Blue color scheme
 */
export const themeMinesup = createTheme({
	...baseThemeConfig,
	colors: {
		minesup: [
			"#e7f5ff",
			"#d0ebff",
			"#a5d8ff",
			"#74c0fc",
			"#4dabf7",
			"#339af0",
			"#228be6",
			"#1c7ed6",
			"#1971c2",
			"#1864ab",
		] as MantineColorsTuple,
		emerald: [
			"#f0fdf5",
			"#dcfce8",
			"#bbf7d1",
			"#86efad",
			"#4ade80",
			"#22c55e",
			"#16a34a",
			"#15803c",
			"#166533",
			"#14532b",
			"#052e14",
		] as MantineColorsTuple,
		gray: [
			"#f8f9fa",
			"#f1f3f5",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#868e96",
			"#495057",
			"#343a40",
			"#212529",
		] as MantineColorsTuple,
	},
	primaryColor: "minesup",
	other: {
		...baseThemeConfig.other,
		gradients: {
			primary: "linear-gradient(45deg, #228be6, #4dabf7)",
			secondary: "linear-gradient(45deg, #1c7ed6, #339af0)",
			text: "linear-gradient(45deg, #228be6, #4dabf7)",
			border:
				"linear-gradient(90deg, transparent, #228be6, #4dabf7, transparent)",
		},
	},
});

/**
 * Minesup theme - Green color scheme
 */
export const themeCenadi = createTheme({
	...baseThemeConfig,
	colors: {
		cenadi: [
			"#E6FAF0",
			"#C3F2DE",
			"#9FEACA",
			"#7CE2B5",
			"#58DAA1",
			"#34D28C",
			"#20B172",
			"#19895A",
			"#126143",
			"#0A3A2B",
		] as MantineColorsTuple,
		emerald: [
			"#f0fdf5",
			"#dcfce8",
			"#bbf7d1",
			"#86efad",
			"#4ade80",
			"#22c55e",
			"#16a34a",
			"#15803c",
			"#166533",
			"#14532b",
			"#052e14",
		] as MantineColorsTuple,
		gray: [
			"#f8f9fa",
			"#f1f3f5",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#868e96",
			"#495057",
			"#343a40",
			"#212529",
		] as MantineColorsTuple,
	},
	primaryColor: "cenadi",
	other: {
		...baseThemeConfig.other,
		gradients: {
			primary: "linear-gradient(45deg, #20B172, #58DAA1)",
			secondary: "linear-gradient(45deg, #19895A, #34D28C)",
			text: "linear-gradient(45deg, #20B172, #58DAA1)",
			border:
				"linear-gradient(90deg, transparent, #20B172, #58DAA1, transparent)",
		},
	},
});

/**
 * University theme - Orange/Amber color scheme
 */
export const themeUniversity = createTheme({
	...baseThemeConfig,
	colors: {
		university: [
			"#FFFBEB",
			"#FEF3C7",
			"#FDE68A",
			"#FCD34D",
			"#FBBF24",
			"#F59E0B",
			"#D97706",
			"#B45309",
			"#92400E",
			"#78350F",
		] as MantineColorsTuple,
		gray: [
			"#f8f9fa",
			"#f1f3f5",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#868e96",
			"#495057",
			"#343a40",
			"#212529",
		] as MantineColorsTuple,
	},
	primaryColor: "university",
	other: {
		...baseThemeConfig.other,
		gradients: {
			primary: "linear-gradient(45deg, #F59E0B, #FBBF24)",
			secondary: "linear-gradient(45deg, #D97706, #F59E0B)",
			text: "linear-gradient(45deg, #D97706, #F59E0B)",
			border:
				"linear-gradient(90deg, transparent, #F59E0B, #FBBF24, transparent)",
		},
	},
});

/**
 * Ipes theme - Violet/Purple color scheme
 */
export const themeIpes = createTheme({
	...baseThemeConfig,
	colors: {
		ipes: [
			"#F5F3FF",
			"#EDE9FE",
			"#DDD6FE",
			"#C4B5FD",
			"#A78BFA",
			"#8B5CF6",
			"#7C3AED",
			"#6D28D9",
			"#5B21B6",
			"#4C1D95",
		] as MantineColorsTuple,
		gray: [
			"#f8f9fa",
			"#f1f3f5",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#868e96",
			"#495057",
			"#343a40",
			"#212529",
		] as MantineColorsTuple,
	},
	primaryColor: "ipes",
	other: {
		...baseThemeConfig.other,
		gradients: {
			primary: "linear-gradient(45deg, #8B5CF6, #A78BFA)",
			secondary: "linear-gradient(45deg, #7C3AED, #8B5CF6)",
			text: "linear-gradient(45deg, #7C3AED, #8B5CF6)",
			border:
				"linear-gradient(90deg, transparent, #8B5CF6, #A78BFA, transparent)",
		},
	},
});
