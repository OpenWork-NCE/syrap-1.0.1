import { NextResponse } from "next/server";
import { mockFiles } from "@/types";

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const data = await request.json();
	return NextResponse.json({ ...data, id: params.id });
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	return NextResponse.json({ success: true });
}
