import { DM_Sans, Bellota_Text, Gabarito, Inter } from "next/font/google";

const spaceGrotesk = Bellota_Text({
	weight: ["400", "700"],
	subsets: ["latin"],
});

const headingFont = Gabarito({
	weight: ["700", "900"],
	subsets: ["latin"],
});

const interFont = Inter({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export { spaceGrotesk };

export { headingFont };

export { interFont };
