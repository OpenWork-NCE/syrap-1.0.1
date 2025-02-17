import { NextResponse } from "next/server";
import { mockFiles, FileDocument } from "@/types";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get("search") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "10");
	const type = searchParams.get("type") || "all";

	let filteredFiles = [...mockFiles];

	if (search) {
		filteredFiles = filteredFiles.filter(
			(file) =>
				file.title.toLowerCase().includes(search.toLowerCase()) ||
				file.description.toLowerCase().includes(search.toLowerCase()),
		);
	}

	if (type !== "all") {
		filteredFiles = filteredFiles.filter((file) => file.type === type);
	}

	const total = filteredFiles.length;
	const files = filteredFiles.slice((page - 1) * limit, page * limit);

	return NextResponse.json({
		files,
		total,
		page,
		totalPages: Math.ceil(total / limit),
	});
}

export async function POST(request: Request) {
	const data = await request.json();
	const newFile = {
		id: (mockFiles.length + 1).toString(),
		...data,
		uploadDate: new Date().toISOString(),
	};

	return NextResponse.json(newFile);
}
