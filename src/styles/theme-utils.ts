"use client";

import { MantineTheme, useMantineTheme } from "@mantine/core";

/**
 * Convert hex color to RGB values
 * @param hex Hex color code (e.g. #ff0000)
 * @returns RGB values as an object { r, g, b }
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Utility function to create CSS variables from theme
 * This can be used in a component to generate CSS variables from the theme
 * @returns CSS variables string that can be injected into a style tag
 */
export function createCssVariables(theme: MantineTheme): string {
	// Convert primary colors to RGB for use in rgba() functions
	const primaryColors = Array.from({ length: 10 }, (_, i) => {
		const hex = theme.colors[theme.primaryColor][i];
		const rgb = hexToRgb(hex);
		return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
	});

	// Convert gray colors to RGB
	const grayColors = Array.from({ length: 10 }, (_, i) => {
		const hex = theme.colors.gray[i];
		const rgb = hexToRgb(hex);
		return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 0, 0";
	});

	return `
    :root {
      /* Primary colors */
      --primary-0: ${theme.colors[theme.primaryColor][0]};
      --primary-1: ${theme.colors[theme.primaryColor][1]};
      --primary-2: ${theme.colors[theme.primaryColor][2]};
      --primary-3: ${theme.colors[theme.primaryColor][3]};
      --primary-4: ${theme.colors[theme.primaryColor][4]};
      --primary-5: ${theme.colors[theme.primaryColor][5]};
      --primary-6: ${theme.colors[theme.primaryColor][6]};
      --primary-7: ${theme.colors[theme.primaryColor][7]};
      --primary-8: ${theme.colors[theme.primaryColor][8]};
      --primary-9: ${theme.colors[theme.primaryColor][9]};

      /* Primary colors as RGB values for rgba() functions */
      --primary-0-rgb: ${primaryColors[0]};
      --primary-1-rgb: ${primaryColors[1]};
      --primary-2-rgb: ${primaryColors[2]};
      --primary-3-rgb: ${primaryColors[3]};
      --primary-4-rgb: ${primaryColors[4]};
      --primary-5-rgb: ${primaryColors[5]};
      --primary-6-rgb: ${primaryColors[6]};
      --primary-7-rgb: ${primaryColors[7]};
      --primary-8-rgb: ${primaryColors[8]};
      --primary-9-rgb: ${primaryColors[9]};

      /* Gray colors */
      --gray-0: ${theme.colors.gray[0]};
      --gray-1: ${theme.colors.gray[1]};
      --gray-2: ${theme.colors.gray[2]};
      --gray-3: ${theme.colors.gray[3]};
      --gray-4: ${theme.colors.gray[4]};
      --gray-5: ${theme.colors.gray[5]};
      --gray-6: ${theme.colors.gray[6]};
      --gray-7: ${theme.colors.gray[7]};
      --gray-8: ${theme.colors.gray[8]};
      --gray-9: ${theme.colors.gray[9]};

      /* Gray colors as RGB values for rgba() functions */
      --gray-0-rgb: ${grayColors[0]};
      --gray-1-rgb: ${grayColors[1]};
      --gray-2-rgb: ${grayColors[2]};
      --gray-3-rgb: ${grayColors[3]};
      --gray-4-rgb: ${grayColors[4]};
      --gray-5-rgb: ${grayColors[5]};
      --gray-6-rgb: ${grayColors[6]};
      --gray-7-rgb: ${grayColors[7]};
      --gray-8-rgb: ${grayColors[8]};
      --gray-9-rgb: ${grayColors[9]};

      /* Light/Dark mode variables */
      --bg-light: rgba(255, 255, 255, 0.9);
      --bg-dark: rgba(26, 27, 30, 0.8);
      --border-light: rgba(0, 0, 0, 0.1);
      --border-dark: rgba(255, 255, 255, 0.1);
      --text-light: var(--gray-9);
      --text-dark: var(--gray-0);
      --text-dimmed-light: var(--gray-6);
      --text-dimmed-dark: var(--gray-5);

      /* Gradients */
      --gradient-primary: ${theme.other.gradients.primary};
      --gradient-secondary: ${theme.other.gradients.secondary};
      --gradient-text: ${theme.other.gradients.text};
      --gradient-border: ${theme.other.gradients.border};

      /* Transitions */
      --transition-default: ${theme.other.transitions.default};
      --transition-fast: ${theme.other.transitions.fast};
      --transition-slow: ${theme.other.transitions.slow};

      /* Shadows */
      --shadow-sm: ${theme.other.shadows.sm};
      --shadow-md: ${theme.other.shadows.md};
      --shadow-lg: ${theme.other.shadows.lg};
      --shadow-hover: ${theme.other.shadows.hover};
      --shadow-light-sm: 0 4px 6px rgba(0, 0, 0, 0.05);
      --shadow-light-md: 0 8px 15px rgba(0, 0, 0, 0.08);
      --shadow-light-lg: 0 12px 20px rgba(0, 0, 0, 0.1);
      --shadow-dark-sm: 0 4px 6px rgba(0, 0, 0, 0.2);
      --shadow-dark-md: 0 8px 15px rgba(0, 0, 0, 0.25);
      --shadow-dark-lg: 0 12px 20px rgba(0, 0, 0, 0.3);

      /* Radius */
      --radius-sm: ${theme.radius.sm};
      --radius-md: ${theme.radius.md};
      --radius-lg: ${theme.radius.lg};
      --radius-xl: ${theme.radius.xl};
    }
  `;
}

/**
 * Hook to inject theme CSS variables into the document
 * Use this in a client component near the root of your app
 */
export function useThemeCssVariables(): void {
	const theme = useMantineTheme();

	if (typeof document !== "undefined") {
		// Create or update the style element
		let styleEl = document.getElementById("theme-css-variables");
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "theme-css-variables";
			document.head.appendChild(styleEl);
		}

		// Set the CSS variables
		styleEl.textContent = createCssVariables(theme);
	}
}

/**
 * Common CSS class names that can be used across the application
 * These match the styles defined in the theme
 */
export const themeClasses = {
	// Card styles
	card: "theme-card",
	cardHover: "theme-card-hover",
	cardGradient: "theme-card-gradient",

	// Text styles
	title: "theme-title",
	titleGradient: "theme-title-gradient",

	// Button styles
	button: "theme-button",
	buttonPrimary: "theme-button-primary",
	buttonOutline: "theme-button-outline",

	// Form styles
	formContainer: "theme-form-container",
	formControl: "theme-form-control",

	// Layout styles
	container: "theme-container",
	section: "theme-section",

	// Animation styles
	fadeIn: "theme-fade-in",
	slideIn: "theme-slide-in",
};

/**
 * Helper function to get CSS variable with light/dark mode support
 * This can be used in CSS modules to handle light/dark mode
 * @example var(--color-bg, light-dark(var(--bg-light), var(--bg-dark)))
 */
export const lightDarkCss = `
  /* Light/Dark mode helper mixins */
  .light-dark-bg {
    background-color: light-dark(var(--bg-light), var(--bg-dark));
  }

  .light-dark-border {
    border: 1px solid light-dark(var(--border-light), var(--border-dark));
  }

  .light-dark-text {
    color: light-dark(var(--text-light), var(--text-dark));
  }

  .light-dark-text-dimmed {
    color: light-dark(var(--text-dimmed-light), var(--text-dimmed-dark));
  }

  .light-dark-shadow-sm {
    box-shadow: light-dark(var(--shadow-light-sm), var(--shadow-dark-sm));
  }

  .light-dark-shadow-md {
    box-shadow: light-dark(var(--shadow-light-md), var(--shadow-dark-md));
  }

  .light-dark-shadow-lg {
    box-shadow: light-dark(var(--shadow-light-lg), var(--shadow-dark-lg));
  }
`;

/**
 * CSS module helper to generate consistent class names
 * This can be used in CSS modules to ensure consistent styling
 */
export const cssModuleHelpers = `
  /* Card styles */
  .theme-card {
    position: relative;
    overflow: hidden;
    transition: var(--transition-default);
    background-color: light-dark(var(--bg-light), var(--bg-dark));
    border: 1px solid light-dark(var(--border-light), var(--border-dark));
    backdrop-filter: blur(10px);
    border-radius: var(--radius-md);
    box-shadow: light-dark(var(--shadow-light-sm), var(--shadow-dark-sm));
  }

  .theme-card-hover:hover {
    transform: translateY(-5px);
    box-shadow: light-dark(var(--shadow-light-lg), var(--shadow-dark-lg));
  }

  .theme-card-gradient::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(135deg, rgba(var(--primary-6-rgb), 0.1), rgba(var(--primary-4-rgb), 0.1));
    animation: rotate 4s linear infinite;
    z-index: -1;
  }

  .theme-card-gradient::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: light-dark(var(--bg-light), var(--bg-dark));
    border-radius: var(--radius-md);
    z-index: -1;
  }

  /* Text styles */
  .theme-title {
    font-family: var(--font-inter), var(--mantine-font-family);
    font-weight: 700;
    line-height: 1.2;
    color: light-dark(var(--text-light), var(--text-dark));
  }

  .theme-title-gradient {
    background: var(--gradient-text);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    position: relative;
  }

  /* Button styles */
  .theme-button {
    transition: var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  .theme-button:hover {
    transform: translateY(-2px);
    box-shadow: light-dark(var(--shadow-light-md), var(--shadow-dark-md));
  }

  .theme-button-primary {
    background: var(--gradient-primary);
    color: white;
    border: none;
  }

  .theme-button-outline {
    background: transparent;
    border: 1px solid var(--primary-6);
    color: var(--primary-6);
  }

  /* Form styles */
  .theme-form-container {
    padding: 2rem;
    border-radius: var(--radius-md);
    background-color: light-dark(var(--bg-light), var(--bg-dark));
    box-shadow: light-dark(var(--shadow-light-md), var(--shadow-dark-md));
    transition: var(--transition-default);
    border: 1px solid light-dark(var(--border-light), var(--border-dark));
  }

  .theme-form-control {
    margin-bottom: 1rem;
  }

  /* Layout styles */
  .theme-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .theme-section {
    padding: 2rem 0;
  }

  /* Animation styles */
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .theme-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .theme-slide-in {
    animation: slideIn 0.5s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  ${lightDarkCss}
`;
