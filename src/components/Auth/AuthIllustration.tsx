"use client";

import { Box } from "@mantine/core";

interface AuthIllustrationProps {
	className?: string;
}

export function AuthIllustration({ className }: AuthIllustrationProps) {
	return (
		<Box className={className}>
			<svg
				viewBox="0 0 500 500"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style={{ width: "100%", height: "100%", maxWidth: "400px" }}
			>
				{/* Background circles */}
				<circle cx="250" cy="250" r="200" fill="rgba(255,255,255,0.05)" />
				<circle cx="250" cy="250" r="150" fill="rgba(255,255,255,0.05)" />
				<circle cx="250" cy="250" r="100" fill="rgba(255,255,255,0.08)" />

				{/* Main building/institution icon */}
				<g transform="translate(150, 120)">
					{/* Building base */}
					<rect x="20" y="80" width="160" height="120" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

					{/* Roof/Triangle */}
					<path d="M0 85 L100 20 L200 85" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

					{/* Pillars */}
					<rect x="40" y="100" width="15" height="80" rx="2" fill="rgba(255,255,255,0.2)"/>
					<rect x="70" y="100" width="15" height="80" rx="2" fill="rgba(255,255,255,0.2)"/>
					<rect x="115" y="100" width="15" height="80" rx="2" fill="rgba(255,255,255,0.2)"/>
					<rect x="145" y="100" width="15" height="80" rx="2" fill="rgba(255,255,255,0.2)"/>

					{/* Door */}
					<rect x="85" y="140" width="30" height="40" rx="4" fill="rgba(16,185,129,0.4)" stroke="rgba(16,185,129,0.6)" strokeWidth="2"/>

					{/* Windows */}
					<rect x="45" y="110" width="20" height="20" rx="2" fill="rgba(16,185,129,0.3)"/>
					<rect x="135" y="110" width="20" height="20" rx="2" fill="rgba(16,185,129,0.3)"/>
				</g>

				{/* Floating documents */}
				<g transform="translate(80, 280)">
					<rect x="0" y="0" width="60" height="75" rx="4" fill="rgba(255,255,255,0.9)" transform="rotate(-10)"/>
					<line x1="10" y1="20" x2="45" y2="18" stroke="rgba(16,185,129,0.6)" strokeWidth="3" transform="rotate(-10)"/>
					<line x1="12" y1="32" x2="42" y2="30" stroke="rgba(200,200,200,1)" strokeWidth="2" transform="rotate(-10)"/>
					<line x1="14" y1="42" x2="38" y2="40" stroke="rgba(200,200,200,1)" strokeWidth="2" transform="rotate(-10)"/>
					<line x1="14" y1="52" x2="35" y2="50" stroke="rgba(200,200,200,1)" strokeWidth="2" transform="rotate(-10)"/>
				</g>

				<g transform="translate(340, 270)">
					<rect x="0" y="0" width="55" height="70" rx="4" fill="rgba(255,255,255,0.85)" transform="rotate(8)"/>
					<line x1="8" y1="18" x2="40" y2="20" stroke="rgba(16,185,129,0.6)" strokeWidth="3" transform="rotate(8)"/>
					<line x1="10" y1="30" x2="38" y2="32" stroke="rgba(200,200,200,1)" strokeWidth="2" transform="rotate(8)"/>
					<line x1="10" y1="40" x2="35" y2="42" stroke="rgba(200,200,200,1)" strokeWidth="2" transform="rotate(8)"/>
				</g>

				{/* Connection lines representing coordination */}
				<g stroke="rgba(16,185,129,0.5)" strokeWidth="2" strokeDasharray="5,5">
					<line x1="140" y1="320" x2="200" y2="280" />
					<line x1="300" y1="280" x2="360" y2="310" />
					<line x1="250" y1="320" x2="250" y2="380" />
				</g>

				{/* Central hub circle */}
				<circle cx="250" cy="400" r="35" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.6)" strokeWidth="2"/>
				<circle cx="250" cy="400" r="20" fill="rgba(16,185,129,0.4)"/>

				{/* Checkmark in center */}
				<path d="M240 400 L248 410 L265 390" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

				{/* Graduation cap */}
				<g transform="translate(220, 40)">
					<path d="M30 25 L0 40 L30 55 L60 40 Z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
					<rect x="25" y="40" width="10" height="20" fill="rgba(255,255,255,0.25)"/>
					<line x1="55" y1="42" x2="55" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
					<circle cx="55" cy="62" r="4" fill="rgba(16,185,129,0.6)"/>
				</g>

				{/* Decorative dots */}
				<circle cx="100" cy="150" r="5" fill="rgba(16,185,129,0.4)"/>
				<circle cx="400" cy="180" r="5" fill="rgba(16,185,129,0.4)"/>
				<circle cx="380" cy="420" r="4" fill="rgba(255,255,255,0.3)"/>
				<circle cx="120" cy="430" r="4" fill="rgba(255,255,255,0.3)"/>
				<circle cx="420" cy="350" r="3" fill="rgba(16,185,129,0.3)"/>
				<circle cx="80" cy="200" r="3" fill="rgba(16,185,129,0.3)"/>
			</svg>
		</Box>
	);
}
