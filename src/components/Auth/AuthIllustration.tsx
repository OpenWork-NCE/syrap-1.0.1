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
				<defs>
					{/* Subtle glow for the central hub */}
					<radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0)" />
					</radialGradient>
					{/* Connection line gradient */}
					<linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="rgba(16,185,129,0.15)" />
						<stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
						<stop offset="100%" stopColor="rgba(16,185,129,0.15)" />
					</linearGradient>
					{/* Document face gradient */}
					<linearGradient id="docFace" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
					</linearGradient>
				</defs>

				{/* === BACKGROUND GEOMETRY === */}
				{/* Outer ring - dashed orbit */}
				<circle
					cx="250" cy="250" r="210"
					stroke="rgba(255,255,255,0.06)"
					strokeWidth="1"
					strokeDasharray="8,12"
					fill="none"
				/>
				{/* Middle ring */}
				<circle
					cx="250" cy="250" r="155"
					stroke="rgba(255,255,255,0.05)"
					strokeWidth="1"
					fill="none"
				/>
				{/* Inner ring */}
				<circle
					cx="250" cy="250" r="90"
					stroke="rgba(255,255,255,0.08)"
					strokeWidth="1.5"
					strokeDasharray="4,6"
					fill="none"
				/>
				{/* Hub glow */}
				<circle cx="250" cy="250" r="120" fill="url(#hubGlow)" />

				{/* === CONNECTION PATHS === */}
				{/* Hub to MINESUP (top) */}
				<line
					x1="250" y1="200" x2="250" y2="85"
					stroke="rgba(255,255,255,0.2)"
					strokeWidth="1.5"
				/>
				{/* Hub to University Left */}
				<line
					x1="210" y1="265" x2="95" y2="330"
					stroke="rgba(255,255,255,0.2)"
					strokeWidth="1.5"
				/>
				{/* Hub to University Right */}
				<line
					x1="290" y1="265" x2="405" y2="330"
					stroke="rgba(255,255,255,0.2)"
					strokeWidth="1.5"
				/>
				{/* Hub to IPES Bottom-Left */}
				<line
					x1="230" y1="290" x2="145" y2="420"
					stroke="rgba(255,255,255,0.15)"
					strokeWidth="1"
					strokeDasharray="4,4"
				/>
				{/* Hub to IPES Bottom-Right */}
				<line
					x1="270" y1="290" x2="355" y2="420"
					stroke="rgba(255,255,255,0.15)"
					strokeWidth="1"
					strokeDasharray="4,4"
				/>
				{/* University Left to IPES Bottom-Left */}
				<line
					x1="95" y1="345" x2="145" y2="410"
					stroke="rgba(255,255,255,0.1)"
					strokeWidth="1"
					strokeDasharray="3,5"
				/>
				{/* University Right to IPES Bottom-Right */}
				<line
					x1="405" y1="345" x2="355" y2="410"
					stroke="rgba(255,255,255,0.1)"
					strokeWidth="1"
					strokeDasharray="3,5"
				/>

				{/* === CENTRAL HUB (SYRAP/CENADI) === */}
				{/* Hex-inspired shape using a rounded rect rotated slightly */}
				<g transform="translate(250,250)">
					{/* Outer hex ring */}
					<polygon
						points="0,-52 45,-26 45,26 0,52 -45,26 -45,-26"
						fill="rgba(255,255,255,0.08)"
						stroke="rgba(255,255,255,0.3)"
						strokeWidth="2"
					/>
					{/* Inner hex */}
					<polygon
						points="0,-36 31,-18 31,18 0,36 -31,18 -31,-18"
						fill="rgba(16,185,129,0.25)"
						stroke="rgba(16,185,129,0.5)"
						strokeWidth="1.5"
					/>
					{/* Network/coordination symbol - 3 connected dots */}
					<circle cx="0" cy="-14" r="5" fill="rgba(255,255,255,0.9)" />
					<circle cx="-12" cy="8" r="4" fill="rgba(255,255,255,0.7)" />
					<circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.7)" />
					<line x1="0" y1="-14" x2="-12" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
					<line x1="0" y1="-14" x2="12" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
					<line x1="-12" y1="8" x2="12" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
				</g>

				{/* === MINESUP NODE (TOP) - Ministry/oversight === */}
				<g transform="translate(250,65)">
					{/* Shield shape with subtle tricolor fill */}
					<clipPath id="shieldClip">
						<path d="M0,-30 L22,-18 L22,8 C22,22 0,34 0,34 C0,34 -22,22 -22,8 L-22,-18 Z" />
					</clipPath>
					{/* Shield background */}
					<path
						d="M0,-30 L22,-18 L22,8 C22,22 0,34 0,34 C0,34 -22,22 -22,8 L-22,-18 Z"
						fill="rgba(255,255,255,0.08)"
					/>
					{/* Cameroon tricolor bands inside shield */}
					<g clipPath="url(#shieldClip)">
						{/* Green band (left) */}
						<rect x="-22" y="-30" width="15" height="64" fill="rgba(0,128,0,0.2)" />
						{/* Red band (center) */}
						<rect x="-7" y="-30" width="14" height="64" fill="rgba(206,17,38,0.2)" />
						{/* Yellow band (right) */}
						<rect x="7" y="-30" width="15" height="64" fill="rgba(252,209,22,0.2)" />
					</g>
					{/* Shield outline */}
					<path
						d="M0,-30 L22,-18 L22,8 C22,22 0,34 0,34 C0,34 -22,22 -22,8 L-22,-18 Z"
						fill="none"
						stroke="rgba(255,255,255,0.35)"
						strokeWidth="1.5"
					/>
					{/* Star - yellow like the Cameroon flag star */}
					<path
						d="M0,-8 L2,-2 L8,-2 L3.5,2 L5,8 L0,4.5 L-5,8 L-3.5,2 L-8,-2 L-2,-2 Z"
						fill="rgba(252,209,22,0.7)"
						stroke="rgba(252,209,22,0.3)"
						strokeWidth="0.5"
					/>
					{/* Label background */}
					<rect x="-28" y="38" width="56" height="16" rx="8" fill="rgba(255,255,255,0.1)" />
					<text
						x="0" y="50"
						textAnchor="middle"
						fill="rgba(255,255,255,0.7)"
						fontSize="8"
						fontWeight="600"
						fontFamily="system-ui, sans-serif"
						letterSpacing="0.5"
					>
						MINESUP
					</text>
				</g>

				{/* === UNIVERSITY LEFT NODE === */}
				<g transform="translate(80,320)">
					{/* Building silhouette */}
					<rect x="-22" y="-8" width="44" height="32" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
					{/* Roof triangle */}
					<path d="M-26,-6 L0,-24 L26,-6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
					{/* Pillars */}
					<rect x="-14" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					<rect x="-3" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					<rect x="9" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					{/* Label */}
					<rect x="-22" y="32" width="44" height="14" rx="7" fill="rgba(255,255,255,0.1)" />
					<text
						x="0" y="42"
						textAnchor="middle"
						fill="rgba(255,255,255,0.65)"
						fontSize="7"
						fontWeight="500"
						fontFamily="system-ui, sans-serif"
					>
						Université
					</text>
				</g>

				{/* === UNIVERSITY RIGHT NODE === */}
				<g transform="translate(420,320)">
					{/* Building silhouette */}
					<rect x="-22" y="-8" width="44" height="32" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
					{/* Roof triangle */}
					<path d="M-26,-6 L0,-24 L26,-6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
					{/* Pillars */}
					<rect x="-14" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					<rect x="-3" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					<rect x="9" y="2" width="5" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
					{/* Label */}
					<rect x="-22" y="32" width="44" height="14" rx="7" fill="rgba(255,255,255,0.1)" />
					<text
						x="0" y="42"
						textAnchor="middle"
						fill="rgba(255,255,255,0.65)"
						fontSize="7"
						fontWeight="500"
						fontFamily="system-ui, sans-serif"
					>
						Université
					</text>
				</g>

				{/* === IPES NODE BOTTOM-LEFT === */}
				<g transform="translate(140,430)">
					{/* Rounded square - modern institution */}
					<rect x="-20" y="-20" width="40" height="36" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
					{/* Book icon inside */}
					<path d="M-8,-8 L-8,8 C-8,8 0,4 0,4 C0,4 8,8 8,8 L8,-8 C8,-8 0,-4 0,-4 C0,-4 -8,-8 -8,-8" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
					{/* Label */}
					<rect x="-16" y="22" width="32" height="14" rx="7" fill="rgba(16,185,129,0.15)" />
					<text
						x="0" y="32"
						textAnchor="middle"
						fill="rgba(255,255,255,0.7)"
						fontSize="7"
						fontWeight="600"
						fontFamily="system-ui, sans-serif"
					>
						IPES
					</text>
				</g>

				{/* === IPES NODE BOTTOM-RIGHT === */}
				<g transform="translate(360,430)">
					{/* Rounded square */}
					<rect x="-20" y="-20" width="40" height="36" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
					{/* Book icon inside */}
					<path d="M-8,-8 L-8,8 C-8,8 0,4 0,4 C0,4 8,8 8,8 L8,-8 C8,-8 0,-4 0,-4 C0,-4 -8,-8 -8,-8" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
					{/* Label */}
					<rect x="-16" y="22" width="32" height="14" rx="7" fill="rgba(16,185,129,0.15)" />
					<text
						x="0" y="32"
						textAnchor="middle"
						fill="rgba(255,255,255,0.7)"
						fontSize="7"
						fontWeight="600"
						fontFamily="system-ui, sans-serif"
					>
						IPES
					</text>
				</g>

				{/* === DOCUMENT COMPARISON SYMBOLS === */}
				{/* Document pair near left connection */}
				<g transform="translate(155,275)">
					{/* Doc 1 */}
					<rect x="-18" y="-14" width="16" height="20" rx="2" fill="url(#docFace)" />
					<line x1="-14" y1="-6" x2="-6" y2="-6" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" />
					<line x1="-14" y1="-1" x2="-8" y2="-1" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<line x1="-14" y1="3" x2="-9" y2="3" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					{/* Doc 2 - slightly offset */}
					<rect x="2" y="-12" width="16" height="20" rx="2" fill="url(#docFace)" opacity="0.85" />
					<line x1="6" y1="-4" x2="14" y2="-4" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" />
					<line x1="6" y1="1" x2="12" y2="1" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<line x1="6" y1="5" x2="11" y2="5" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					{/* Comparison arrows */}
					<path d="M-1,0 L1,0" stroke="rgba(16,185,129,0.6)" strokeWidth="2" />
				</g>

				{/* Document pair near right connection */}
				<g transform="translate(345,275)">
					<rect x="-18" y="-14" width="16" height="20" rx="2" fill="url(#docFace)" />
					<line x1="-14" y1="-6" x2="-6" y2="-6" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" />
					<line x1="-14" y1="-1" x2="-8" y2="-1" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<line x1="-14" y1="3" x2="-9" y2="3" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<rect x="2" y="-12" width="16" height="20" rx="2" fill="url(#docFace)" opacity="0.85" />
					<line x1="6" y1="-4" x2="14" y2="-4" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" />
					<line x1="6" y1="1" x2="12" y2="1" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<line x1="6" y1="5" x2="11" y2="5" stroke="rgba(200,200,200,0.8)" strokeWidth="1" />
					<path d="M-1,0 L1,0" stroke="rgba(16,185,129,0.6)" strokeWidth="2" />
				</g>

				{/* === GRADUATION CAP (top) === */}
				<g transform="translate(250,18)">
					<path
						d="M0,-8 L-18,2 L0,12 L18,2 Z"
						fill="rgba(255,255,255,0.25)"
						stroke="rgba(255,255,255,0.4)"
						strokeWidth="1"
					/>
					<line x1="0" y1="2" x2="0" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
					<line x1="14" y1="4" x2="14" y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
					<circle cx="14" cy="18" r="2.5" fill="rgba(16,185,129,0.5)" />
				</g>

				{/* === CHECKMARK BADGE - bottom center === */}
				<g transform="translate(250,480)">
					<circle cx="0" cy="0" r="12" fill="rgba(16,185,129,0.3)" stroke="rgba(16,185,129,0.5)" strokeWidth="1" />
					<path d="M-5,0 L-2,4 L6,-4" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>

				{/* === SMALL ACCENT DOTS (data flow particles) === */}
				{/* Along top connection */}
				<circle cx="250" cy="140" r="3" fill="rgba(255,255,255,0.35)" />
				<circle cx="250" cy="165" r="2" fill="rgba(255,255,255,0.2)" />
				{/* Along left connection */}
				<circle cx="150" cy="295" r="3" fill="rgba(255,255,255,0.3)" />
				<circle cx="120" cy="310" r="2" fill="rgba(255,255,255,0.2)" />
				{/* Along right connection */}
				<circle cx="350" cy="295" r="3" fill="rgba(255,255,255,0.3)" />
				<circle cx="380" cy="310" r="2" fill="rgba(255,255,255,0.2)" />
				{/* Scattered ambient dots */}
				<circle cx="60" cy="180" r="2" fill="rgba(16,185,129,0.3)" />
				<circle cx="440" cy="200" r="2" fill="rgba(16,185,129,0.3)" />
				<circle cx="70" cy="450" r="2.5" fill="rgba(255,255,255,0.15)" />
				<circle cx="430" cy="460" r="2" fill="rgba(255,255,255,0.15)" />
				<circle cx="170" cy="130" r="1.5" fill="rgba(255,255,255,0.2)" />
				<circle cx="330" cy="140" r="1.5" fill="rgba(255,255,255,0.2)" />
				<circle cx="480" cy="280" r="2" fill="rgba(16,185,129,0.2)" />
				<circle cx="20" cy="260" r="2" fill="rgba(16,185,129,0.2)" />
			</svg>
		</Box>
	);
}
