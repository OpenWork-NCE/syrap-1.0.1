"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to support page since registration is admin-only
		router.push("/support");
	}, [router]);

	return null;
}
