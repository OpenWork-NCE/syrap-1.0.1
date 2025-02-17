"use client";

import { createTheme } from "@mantine/core";
import { headingFont } from "@/styles/fonts";

export const themeCenadi = createTheme({
	fontFamily: "Gabarito, MD Sans, sans-serif",
	headings: {
		fontFamily: "PT Serif, Radley, Garamond, MD Sans, sans-serif",
		fontWeight: "700",
	},
	components: {
		Input: {
			styles: {
				input: {
					fontFamily: "Gabarito, MD Sans, sans-serif", // Police pour les champs d'entrée
					fontSize: "16px", // Taille de la police
				},
			},
		},
		Select: {
			styles: {
				input: {
					fontFamily: "Gabarito, MD Sans, sans-serif", // Police pour les selects
					fontSize: "16px",
				},
			},
		},
		Button: {
			styles: {
				root: {
					fontFamily: "Gabarito, MD Sans,sans-serif", // Police pour les boutons
				},
			},
		},
	},
	colors: {
		blue: [
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
		],
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
		],
	},
	primaryColor: "blue",
	defaultRadius: "md",
});

export const themeMinesup = createTheme({
	fontFamily: "Gabarito, sans-serif",
	headings: {
		fontFamily: "Comic Sans MS, MD Sans, sans-serif",
	},
	colors: {
		minesup: [
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
		],
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
		],
	},
	primaryColor: "minesup",
	defaultRadius: "md",
});

export const themeIpes = createTheme({
	fontFamily: "Gabarito, sans-serif",
	headings: {
		fontFamily: "Comic Sans MS, MD Sans, sans-serif",
	},
	colors: {
		ipes: [
			"#E5EAEA",
			"#C2CCCC",
			"#9EADAF",
			"#7B8F91",
			"#587174",
			"#4F6367",
			"#3F4F52",
			"#303B3D",
			"#202729",
			"#101314",
		],
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
		],
	},
	primaryColor: "ipes",
	defaultRadius: "md",
});
