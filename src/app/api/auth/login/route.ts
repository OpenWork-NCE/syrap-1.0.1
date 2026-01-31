import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import IAccessToken from "@/interfaces/IAccessToken";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import { serializeError } from "serialize-error";
import { z } from "zod";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
	email: z
		.string({ required_error: "Votre adresse e-mail est nécessaire" })
		.email("Une addresse corriel valide est requise"),
	password: z.string({ required_error: "Le mot de passe est requis" }),
});

export async function POST(request: Request) {
	try {
		const bodyPayload = loginSchema.parse(await requestJsonBody(request));

		const response = await fetchJson<IAccessToken>(
			backendUrl(`/api/auth/login`),
			{
				method: "POST",
				body: JSON.stringify(bodyPayload),
				headers: {
					"Content-Type": "application/json",
					"x-user-ip": getClientIp(request),
					"x-user-agent": request.headers.get("user-agent")!,
				},
			},
		);

		// Validation de la réponse
		if (!response.user || !response.token) {
			throw new Error("Invalid response from backend: missing user or token");
		}

		const roles = response.user.roles || [];
		const profiles: string[] = roles.map((role) => role.name);
		const mergedRights: string[] = [];
		for (const role of roles) {
			for (const right of role.permissions || []) {
				mergedRights.push(right.name);
			}
		}
		const rights: string[] = Array.from(new Set(mergedRights));

		// Normaliser l'organisation pour s'assurer que 'type' est présent
		const organisation = response.user.organisation || {
			type: "",
			id: "",
			slug: "",
			name: "",
		};

		const cookieOptions = {
			path: "/",
			httpOnly: true,
			sameSite: "strict" as const,
			expires: dayjs().add(2, "day").toDate(),
		};

		// delete callback cookie
		cookies().delete(process.env.USER_AUTH_CALLBACK_URL_COOKIE_KEY!);

		// save the user token in the cookie
		cookies().set(process.env.USER_SESSION_COOKIE_KEY!, response.token, cookieOptions);

		// save the user info in the cookie
		cookies().set(
			process.env.USER_SESSION_USER_COOKIE_KEY!,
			JSON.stringify({
				id: response.user.id,
				name: response.user.name,
				email: response.user.email,
			}),
			cookieOptions,
		);

		// save the user organisation in the cookie (format standardisé avec 'type')
		cookies().set(
			process.env.USER_SESSION_INSTITUTE_KEY!,
			JSON.stringify(organisation),
			cookieOptions,
		);

		// save the user profiles in the cookie
		cookies().set(
			process.env.USER_SESSION_PROFILES_COOKIE_KEY!,
			JSON.stringify(profiles),
			cookieOptions,
		);

		// save the user authorizations in the cookie
		cookies().set(
			process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!,
			JSON.stringify(rights),
			cookieOptions,
		);

		return new Response(
			JSON.stringify({
				organisation,
				authorizations: rights,
			}),
			{ status: 200 },
		);
	} catch (error) {
		console.error("Login API error:", error);
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
