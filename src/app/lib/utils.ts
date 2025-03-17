import { Institution } from "@/types";
import { FileType } from "@/types";
import {
	IconFileTypePdf,
	IconFileTypeDocx,
	IconFileTypeXls,
	IconFileDescription,
	IconFileZip,
	IconFileTypeJpg,
	IconFile,
} from "@tabler/icons-react";
import { MRT_Column, MRT_Row } from "mantine-react-table";
import { jsPDF } from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { download, generateCsv } from "export-to-csv";
import { csvConfig } from "@/config";

export function extractQueryParams(req: Request) {
	const urlParsed = new URL(req.url);
	const r: any = {};
	urlParsed.searchParams.forEach((value, key) => {
		r[key] = value;
	});
	return r;
}

export const fetchJson = <ResponseType extends any = any>(
	input: string | URL,
	init?:
		| (RequestInit & {
				query?: Record<string, string | number | boolean | null | undefined>;
		  })
		| undefined,
): Promise<ResponseType> => {
	const url = typeof input === "string" ? new URL(input) : input;

	const { query, ...restInit } = init ?? {};

	if (typeof query === "object") {
		for (const key of Object.keys(query)) {
			const value = query[key];
			switch (typeof value) {
				case "number":
				case "string":
				case "bigint":
					url.searchParams.set(key, `${value}`);
					break;
				case "boolean":
					url.searchParams.set(key, value ? "true" : "false");
					break;

				default:
					url.searchParams.set(key, "");
					break;
			}
		}
	}

	return fetch(input, {
		...restInit,
	}).then(async (response) => {
		if (response.status !== 204) {
			const json = (await response.json()) as ResponseType;
			if (response.ok) {
				return json;
			} else {
				throw json;
			}
		} else {
			return null as ResponseType;
		}
	});
};

export function backendUrl(path: string, queryParams?: any) {
	const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`);
	if (queryParams) {
		for (const key of Object.keys(queryParams)) {
			url.searchParams.set(key, queryParams[key] ?? "");
		}
	}
	return url.toString();
}

export function getClientIp(request: Request) {
	let ip: string;
	const xForwordedFor = request.headers.get("x-forwarded-for"),
		xRealIp = request.headers.get("x-real-ip");
	if (xForwordedFor) {
		ip = xForwordedFor.split(",")[0];
	} else if (xRealIp) {
		ip = xRealIp;
	} else {
		ip = "::1";
	}
	return ip;
}

export async function requestJsonBody(req: Request) {
	return JSON.parse(await req.text());
}

export function internalApiUrl(path: string, queryParams?: any) {
	const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${path}`);
	if (queryParams) {
		for (const key of Object.keys(queryParams)) {
			url.searchParams.set(key, queryParams[key] ?? "");
		}
	}
	return url.toString();
}

export function removeNullEntries<T>(array: (T | null)[]): T[] {
	return array.filter((item): item is T => item !== null);
}

export function getInstitutionName(institutionSlug: string): string {
	return institutionSlug.includes("cenadi")
		? "cenadi"
		: institutionSlug.includes("minsup")
			? "minsup"
			: "Ipes";
}

export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDate(date: string): string {
	return new Date(date).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getFileTypeFromExtension(
	filename: string | undefined,
): FileType {
	if (!filename) return "other";
	const extension = filename.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "pdf":
			return "pdf";
		case "doc":
		case "docx":
			return "word";
		case "xls":
		case "xlsx":
			return "excel";
		case "txt":
			return "text";
		case "zip":
		case "rar":
			return "zip";
		case "png":
		case "jpg":
		case "jpeg":
		case "gif":
		case "avif":
		case "svg":
			return "image";
		default:
			return "other";
	}
}

export function getFileTypeIcon(type: FileType) {
	switch (type) {
		case "pdf":
			return IconFileTypePdf;
		case "word":
			return IconFileTypeDocx;
		case "excel":
			return IconFileTypeXls;
		case "text":
			return IconFileDescription;
		case "zip":
			return IconFileZip;
		case "image":
			return IconFileTypeJpg;
		default:
			return IconFile;
	}
}

export function getFileTypeColor(type: FileType): string {
	switch (type) {
		case "pdf":
			return "red";
		case "word":
			return "blue";
		case "excel":
			return "green";
		case "text":
			return "gray";
		case "zip":
			return "yellow";
		case "image":
			return "purple";
		default:
			return "dark";
	}
}

export const handleExportRowsAsPDF = (
	tableHeaders: string[],
	tableData: RowInput[],
	title?: string,
	customFilename?: string,
) => {
	const doc = new jsPDF("portrait", "pt", "A4");
	const pageWidth = doc.internal.pageSize.getWidth();
	const logoUrl = "/thumbnail.png"; // Path to your logo

	// French Column (Left)
	const frenchText = `
      REPUBLIQUE DU CAMEROUN
             Paix – Travail – Patrie
              -------------------------
        MINISTERE DES FINANCES
              -------------------------
         SECRETARIAT GENERAL
              ------------------------
          CENTRE NATIONAL DE
           DEVELOPPEMENT DE
               L'INFORMATIQUE
               -------------------------
    `;

	// English Column (Right)
	const englishText = `
          REPUBLIC OF CAMEROON
           Peace – Work – Fatherland
                  -------------------------
             MINISTRY OF FINANCE
                  -------------------------
            GENERAL SECRETARIAT
                  -------------------------
          NATIONAL CENTRE FOR THE
        DEVELOPMENT OF COMPUTER
                           SERVICES
              ------------------------------------
    `;

	// Add Header with 3 columns
	doc.setFontSize(10);

	// Column 1: French text
	doc.text(frenchText, 40, 50); // Positioned on the left side

	// Column 2: Logo
	doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 40, 60, 60); // Centered logo

	// Column 3: English text
	doc.text(englishText, pageWidth - 250, 50); // Positioned on the right side

	// Add title if provided
	if (title) {
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text(title, pageWidth / 2, 150, { align: "center" });
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
	}

	// Add table using autoTable
	autoTable(doc, {
		startY: title ? 180 : 150, // Start after the header and title if present
		head: [tableHeaders],
		body: tableData,
	});

	doc.save(customFilename ? `${customFilename}.pdf` : "syrap-export.pdf");
};

export const handleExportAsCSV = <T extends Record<string, any>>(
	rowsData: any,
	customFilename?: string,
) => {
	const csv = generateCsv(csvConfig)(rowsData);
	download({
		...csvConfig,
		filename: customFilename ? `${customFilename}.csv` : "syrap-export.csv",
	})(csv);
};

export const handleExportComparisonAsPDF = (
	result: any,
	classroom1: any,
	classroom2: any,
	customFilename?: string,
) => {
	import("jspdf").then(({ default: jsPDF }) => {
		import("jspdf-autotable").then(({ default: autoTable }) => {
			const doc = new jsPDF("portrait", "pt", "A4");
			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();
			const margin = 40;
			const contentWidth = pageWidth - 2 * margin;
			const logoUrl = "/thumbnail.png"; // Path to your logo

			// Add null checks for classroom properties
			const program1Name = classroom1.designation || "Programme 1";
			const program2Name = classroom2.designation || "Programme 2";
			const program1Branch = classroom1.branch?.name || "Non spécifié";
			const program2Branch = classroom2.branch?.name || "Non spécifié";
			const program1Level = classroom1.level?.name || "Non spécifié";
			const program2Level = classroom2.level?.name || "Non spécifié";

			// French Column (Left)
			const frenchText = `
      REPUBLIQUE DU CAMEROUN
             Paix – Travail – Patrie
              -------------------------
        MINISTERE DES FINANCES
              -------------------------
         SECRETARIAT GENERAL
              ------------------------
          CENTRE NATIONAL DE
           DEVELOPPEMENT DE
               L'INFORMATIQUE
               -------------------------
    `;

			// English Column (Right)
			const englishText = `
          REPUBLIC OF CAMEROON
           Peace – Work – Fatherland
                  -------------------------
             MINISTRY OF FINANCE
                  -------------------------
            GENERAL SECRETARIAT
                  -------------------------
          NATIONAL CENTRE FOR THE
        DEVELOPMENT OF COMPUTER
                           SERVICES
              ------------------------------------
    `;

			// Add Header with 3 columns
			doc.setFontSize(10);

			// Column 1: French text
			doc.text(frenchText, 40, 50); // Positioned on the left side

			// Column 2: Logo
			doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 40, 60, 60); // Centered logo

			// Column 3: English text
			doc.text(englishText, pageWidth - 250, 50); // Positioned on the right side

			// Add title
			doc.setFontSize(16);
			doc.setFont("helvetica", "bold");
			doc.text("RAPPORT DE COMPARAISON DE PROGRAMMES", pageWidth / 2, 200, {
				align: "center",
			});
			doc.setFontSize(12);
			doc.text(
				"Analyse détaillée des similitudes et différences entre programmes",
				pageWidth / 2,
				220,
				{ align: "center" },
			);

			// Current Y position tracker
			let yPos = 250;

			// Program Information
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("Informations des Programmes", margin, yPos);
			yPos += 20;

			// Draw program comparison boxes
			const boxHeight = 80;
			const boxWidth = contentWidth / 2 - 10;

			// Program 1 Box
			doc.setDrawColor(0, 0, 255); // Blue for Program 1
			doc.setFillColor(240, 248, 255); // Light blue background
			doc.roundedRect(margin, yPos, boxWidth, boxHeight, 5, 5, "FD");

			doc.setFontSize(12);
			doc.setTextColor(0, 0, 150);
			doc.text("Programme 1", margin + 10, yPos + 20);
			doc.setTextColor(0);
			doc.setFontSize(10);
			doc.text(`Désignation: ${program1Name}`, margin + 10, yPos + 40);
			doc.text(`Filière: ${program1Branch}`, margin + 10, yPos + 55);
			doc.text(`Niveau: ${program1Level}`, margin + 10, yPos + 70);

			// Program 2 Box
			doc.setDrawColor(255, 140, 0); // Orange for Program 2
			doc.setFillColor(255, 245, 238); // Light orange background
			doc.roundedRect(
				margin + boxWidth + 20,
				yPos,
				boxWidth,
				boxHeight,
				5,
				5,
				"FD",
			);

			doc.setFontSize(12);
			doc.setTextColor(200, 80, 0);
			doc.text("Programme 2", margin + boxWidth + 30, yPos + 20);
			doc.setTextColor(0);
			doc.setFontSize(10);
			doc.text(
				`Désignation: ${program2Name}`,
				margin + boxWidth + 30,
				yPos + 40,
			);
			doc.text(`Filière: ${program2Branch}`, margin + boxWidth + 30, yPos + 55);
			doc.text(`Niveau: ${program2Level}`, margin + boxWidth + 30, yPos + 70);

			yPos += boxHeight + 30;

			// Calculate metrics
			const totalUEs =
				result.commonsUes.length +
				result.onlyInRecord1.length +
				result.onlyInRecord2.length;
			const commonPercentage = (result.commonsUes.length / totalUEs) * 100;

			// Match level determination
			const getMatchLabel = () => {
				if (commonPercentage >= 100) return "Correspondance Optimale";
				if (commonPercentage >= 85) return "Correspondance Avancée";
				if (commonPercentage >= 70) return "Correspondance Moyenne";
				if (commonPercentage >= 50) return "Correspondance Partielle";
				if (commonPercentage >= 30) return "Correspondance Minimale";
				return "Correspondance Faible";
			};

			const getMatchDescription = () => {
				if (commonPercentage >= 100)
					return "Les programmes sont parfaitement alignés, avec toutes les UEs en commun.";
				if (commonPercentage >= 85)
					return "Excellente correspondance entre les programmes, avec la majorité des UEs en commun.";
				if (commonPercentage >= 70)
					return "Bonne correspondance entre les programmes, avec une majorité d'UEs en commun.";
				if (commonPercentage >= 50)
					return "Correspondance modérée entre les programmes, avec environ la moitié des UEs en commun.";
				if (commonPercentage >= 30)
					return "Correspondance limitée entre les programmes, avec peu d'UEs en commun.";
				return "Faible correspondance entre les programmes, avec très peu d'UEs en commun.";
			};

			const getMatchColor = () => {
				if (commonPercentage >= 100) return [0, 0, 255]; // Blue
				if (commonPercentage >= 85) return [0, 128, 128]; // Teal
				if (commonPercentage >= 70) return [0, 128, 0]; // Green
				if (commonPercentage >= 50) return [255, 215, 0]; // Yellow
				if (commonPercentage >= 30) return [255, 140, 0]; // Orange
				return [255, 0, 0]; // Red
			};

			const matchLabel = getMatchLabel();
			const matchDescription = getMatchDescription();
			const matchColor = getMatchColor();

			// Summary Section
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(0);
			doc.text("Résumé de la Comparaison", margin, yPos);
			yPos += 20;

			// Draw summary box
			doc.setDrawColor(200, 200, 200);
			doc.setFillColor(248, 248, 248);
			doc.roundedRect(margin, yPos, contentWidth, 100, 5, 5, "FD");

			// Match percentage
			doc.setFontSize(24);
			doc.setTextColor(matchColor[0], matchColor[1], matchColor[2]);
			doc.text(`${commonPercentage.toFixed(1)}%`, margin + 50, yPos + 40);

			// Match label
			doc.setFontSize(14);
			doc.text(matchLabel, margin + 50, yPos + 60);

			// Match description
			doc.setFontSize(10);
			doc.setTextColor(80, 80, 80);

			// Split description into multiple lines if needed
			const splitDescription = doc.splitTextToSize(
				matchDescription,
				contentWidth - 120,
			);
			doc.text(splitDescription, margin + 50, yPos + 80);

			// Draw pie chart
			const centerX = margin + contentWidth - 70;
			const centerY = yPos + 50;
			const radius = 30;

			// Calculate segment angles
			const commonAngle = (result.commonsUes.length / totalUEs) * 360;
			const record1Angle = (result.onlyInRecord1.length / totalUEs) * 360;
			const record2Angle = (result.onlyInRecord2.length / totalUEs) * 360;

			// Draw pie chart using simple arcs and lines for better rendering
			// Common UEs segment (Teal)
			doc.setFillColor(0, 128, 128);
			doc.circle(centerX, centerY, radius, "F");

			// Only draw other segments if they exist
			if (record1Angle > 0 || record2Angle > 0) {
				// Clear the portion for Program 1 UEs
				if (record1Angle > 0) {
					doc.setFillColor(0, 0, 255); // Blue
					doc.saveGraphicsState();

					// Use ellipse instead of arc (which doesn't exist on jsPDF)
					const startAngle = 0;
					const endAngle = (commonAngle * Math.PI) / 180;

					// Draw a wedge using lines and curves
					doc.moveTo(centerX, centerY);
					doc.lineTo(centerX + radius, centerY);

					// Draw an elliptical arc approximating the circular arc
					const steps = 20; // Number of steps to approximate the arc
					for (let i = 1; i <= steps; i++) {
						const angle = startAngle + (endAngle - startAngle) * (i / steps);
						const x = centerX + radius * Math.cos(angle);
						const y = centerY + radius * Math.sin(angle);
						doc.lineTo(x, y);
					}

					doc.lineTo(centerX, centerY);
					doc.clip();
					doc.circle(centerX, centerY, radius, "F");
					doc.restoreGraphicsState();
				}

				// Clear the portion for Program 2 UEs
				if (record2Angle > 0) {
					doc.setFillColor(255, 140, 0); // Orange
					doc.saveGraphicsState();
					const startAngle = ((commonAngle + record1Angle) * Math.PI) / 180;

					// Draw a wedge using lines and curves
					doc.moveTo(centerX, centerY);
					doc.lineTo(
						centerX + radius * Math.cos(startAngle),
						centerY + radius * Math.sin(startAngle),
					);

					// Draw an elliptical arc approximating the circular arc
					const endAngle = 2 * Math.PI;
					const steps = 20; // Number of steps to approximate the arc
					for (let i = 1; i <= steps; i++) {
						const angle = startAngle + (endAngle - startAngle) * (i / steps);
						const x = centerX + radius * Math.cos(angle);
						const y = centerY + radius * Math.sin(angle);
						doc.lineTo(x, y);
					}

					doc.lineTo(centerX, centerY);
					doc.clip();
					doc.circle(centerX, centerY, radius, "F");
					doc.restoreGraphicsState();
				}
			}

			// Draw circle outline
			doc.setDrawColor(100, 100, 100);
			doc.circle(centerX, centerY, radius, "S");

			// Add legend with better spacing and alignment
			doc.setFontSize(8);
			doc.setTextColor(0);

			const legendY = centerY + 70;
			const legendSpacing = 15;

			// Common UEs legend
			doc.setFillColor(0, 128, 128);
			doc.rect(centerX - 50, legendY, 8, 8, "F");
			doc.text(
				`UEs en commun (${result.commonsUes.length})`,
				centerX - 35,
				legendY + 6,
			);

			// Program 1 UEs legend
			doc.setFillColor(0, 0, 255);
			doc.rect(centerX - 50, legendY + legendSpacing, 8, 8, "F");
			doc.text(
				`UEs P1 (${result.onlyInRecord1.length})`,
				centerX - 35,
				legendY + legendSpacing + 6,
			);

			// Program 2 UEs legend
			doc.setFillColor(255, 140, 0);
			doc.rect(centerX - 50, legendY + legendSpacing * 2, 8, 8, "F");
			doc.text(
				`UEs P2 (${result.onlyInRecord2.length})`,
				centerX - 35,
				legendY + legendSpacing * 2 + 6,
			);

			yPos += 160;

			// Continue with the rest of the PDF generation...
			// UE Details Section
			if (yPos > pageHeight - 100) {
				doc.addPage();
				yPos = 50;
			}

			// UE Details Section
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(0);
			doc.text("Détails des UEs", margin, yPos);
			yPos += 20;

			// Common UEs Table
			doc.setFontSize(12);
			doc.setTextColor(0, 128, 128);
			doc.text("UEs en commun", margin, yPos);
			yPos += 10;

			if (result.commonsUes.length > 0) {
				autoTable(doc, {
					startY: yPos,
					head: [["Nom", "Slug", "Description"]],
					body: result.commonsUes.map((ue: any) => [
						ue.name,
						ue.slug,
						ue.description || "-",
					]),
					theme: "grid",
					headStyles: { fillColor: [0, 128, 128] },
					margin: { left: margin, right: margin },
				});

				yPos = (doc as any).lastAutoTable.finalY + 20;
			} else {
				doc.setFontSize(10);
				doc.setTextColor(100, 100, 100);
				doc.text("Aucune UE en commun", margin, yPos);
				yPos += 20;
			}

			// Add page break if needed
			if (yPos > pageHeight - 150) {
				doc.addPage();
				yPos = 50;
			}

			// UEs only in Program 1
			doc.setFontSize(12);
			doc.setTextColor(0, 0, 255);
			doc.text("UEs uniquement dans Programme 1", margin, yPos);
			yPos += 10;

			if (result.onlyInRecord1.length > 0) {
				autoTable(doc, {
					startY: yPos,
					head: [["Nom", "Slug", "Description"]],
					body: result.onlyInRecord1.map((ue: any) => [
						ue.name,
						ue.slug,
						ue.description || "-",
					]),
					theme: "grid",
					headStyles: { fillColor: [0, 0, 255] },
					margin: { left: margin, right: margin },
				});

				yPos = (doc as any).lastAutoTable.finalY + 20;
			} else {
				doc.setFontSize(10);
				doc.setTextColor(100, 100, 100);
				doc.text("Aucune UE uniquement dans Programme 1", margin, yPos);
				yPos += 20;
			}

			// Add page break if needed
			if (yPos > pageHeight - 150) {
				doc.addPage();
				yPos = 50;
			}

			// UEs only in Program 2
			doc.setFontSize(12);
			doc.setTextColor(255, 140, 0);
			doc.text("UEs uniquement dans Programme 2", margin, yPos);
			yPos += 10;

			if (result.onlyInRecord2.length > 0) {
				autoTable(doc, {
					startY: yPos,
					head: [["Nom", "Slug", "Description"]],
					body: result.onlyInRecord2.map((ue: any) => [
						ue.name,
						ue.slug,
						ue.description || "-",
					]),
					theme: "grid",
					headStyles: { fillColor: [255, 140, 0] },
					margin: { left: margin, right: margin },
				});

				yPos = (doc as any).lastAutoTable.finalY + 20;
			} else {
				doc.setFontSize(10);
				doc.setTextColor(100, 100, 100);
				doc.text("Aucune UE uniquement dans Programme 2", margin, yPos);
				yPos += 20;
			}

			// Add page break for statistics section
			doc.addPage();
			yPos = 50;

			// Statistics Section
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(0);
			doc.text("Statistiques et Graphiques", margin, yPos);
			yPos += 30;

			// Draw bar chart for match percentage with adjusted dimensions
			const barWidth = contentWidth - 40;
			const barHeight = 25;

			// Draw background bar
			doc.setDrawColor(200, 200, 200);
			doc.setFillColor(240, 240, 240);
			doc.roundedRect(margin + 20, yPos, barWidth, barHeight, 3, 3, "FD");

			// Draw filled portion based on match percentage
			doc.setFillColor(matchColor[0], matchColor[1], matchColor[2]);
			doc.roundedRect(
				margin + 20,
				yPos,
				barWidth * (commonPercentage / 100),
				barHeight,
				3,
				3,
				"F",
			);

			// Add percentage text
			doc.setFontSize(12);
			doc.setTextColor(255, 255, 255);
			const percentageText = `${commonPercentage.toFixed(1)}%`;
			if (commonPercentage > 20) {
				doc.text(percentageText, margin + 40, yPos + 17);
			} else {
				doc.setTextColor(0);
				doc.text(percentageText, margin + barWidth + 30, yPos + 17);
			}

			yPos += barHeight + 25;

			// Draw markers
			doc.setFontSize(8);
			doc.setTextColor(100, 100, 100);
			doc.setDrawColor(200, 200, 200);

			const markerPositions = [
				{ percent: 30, label: "Minimale (30%)" },
				{ percent: 50, label: "Partielle (50%)" },
				{ percent: 70, label: "Moyenne (70%)" },
				{ percent: 85, label: "Avancée (85%)" },
				{ percent: 100, label: "Optimale (100%)" },
			];

			markerPositions.forEach(({ percent, label }) => {
				const xPos = margin + 20 + (barWidth * percent) / 100;
				doc.line(xPos, yPos - 15, xPos, yPos - 5);
				doc.text(label, xPos - 20, yPos + 5, { align: "center" });
			});

			yPos += 40;

			// Draw detailed statistics table
			autoTable(doc, {
				startY: yPos,
				head: [["Catégorie", "Nombre d'UEs", "Pourcentage"]],
				body: [
					[
						"UEs en commun",
						result.commonsUes.length,
						`${((result.commonsUes.length / totalUEs) * 100).toFixed(1)}%`,
					],
					[
						"UEs uniquement dans Programme 1",
						result.onlyInRecord1.length,
						`${((result.onlyInRecord1.length / totalUEs) * 100).toFixed(1)}%`,
					],
					[
						"UEs uniquement dans Programme 2",
						result.onlyInRecord2.length,
						`${((result.onlyInRecord2.length / totalUEs) * 100).toFixed(1)}%`,
					],
					["Total", totalUEs, "100%"],
				],
				theme: "grid",
				headStyles: { fillColor: [70, 70, 70] },
				margin: { left: margin + 20, right: margin + 20 },
				bodyStyles: { fontSize: 10 },
				alternateRowStyles: { fillColor: [245, 245, 245] },
				foot: [["", "Total des UEs", totalUEs.toString()]],
				footStyles: { fillColor: [200, 200, 200], fontStyle: "bold" },
			});

			yPos = (doc as any).lastAutoTable.finalY + 40;

			// Conclusion
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(0);
			doc.text("Conclusion", margin, yPos);
			yPos += 20;

			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			doc.setTextColor(80, 80, 80);

			const conclusion = `Cette analyse comparative montre un taux de correspondance de ${commonPercentage.toFixed(1)}% entre les deux programmes, ce qui indique une ${matchLabel.toLowerCase()}. ${matchDescription} Pour une analyse plus détaillée, veuillez consulter les sections précédentes du rapport.`;

			const splitConclusion = doc.splitTextToSize(conclusion, contentWidth);
			doc.text(splitConclusion, margin, yPos);

			// Footer with date
			const today = new Date();
			const dateStr = today.toLocaleDateString("fr-FR", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			doc.setFontSize(8);
			doc.setTextColor(150, 150, 150);
			doc.text(
				`Rapport généré le ${dateStr} via SYRAP - Système de Rapprochement Automatique des Programmes`,
				pageWidth / 2,
				pageHeight - 20,
				{ align: "center" },
			);

			// Save the PDF
			doc.save(
				customFilename
					? `${customFilename}.pdf`
					: "rapport-comparaison-programmes.pdf",
			);
		});
	});
};
