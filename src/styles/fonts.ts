import { DM_Sans, Bellota_Text, Inter } from "next/font/google";

const spaceGrotesk = Bellota_Text({
	weight: ["400", "700"],
	subsets: ["latin"],
});

const interFont = Inter({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export { spaceGrotesk };

export { interFont };
