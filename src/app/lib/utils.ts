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
