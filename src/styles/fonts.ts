import { DM_Sans, Bellota_Text, Gabarito } from "next/font/google";

const spaceGrotesk = Bellota_Text({
	weight: ["400", "700"],
	subsets: ["latin"],
});

const headingFont = Gabarito({
	weight: ["700", "900"],
	subsets: ["latin"],
});

export { spaceGrotesk };

export { headingFont };
