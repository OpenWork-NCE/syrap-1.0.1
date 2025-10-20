import {
	backendUrl,
	fetchJson,
	getClientIp,
	requestJsonBody,
} from "@/app/lib/utils";
import IAccessToken from "@/interfaces/IAccessToken";
import { cookies } from "next/headers";
import moment from "moment";
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

		const profiles: string[] = response.user.roles.map((role) => role.name);
		let mergedRights: string[] = [];
		for (const profiles of response.user.roles) {
			for (const right of profiles.permissions) {
				mergedRights.push(right.name);
			}
		}
		const rights: string[] = Array.from(new Set(mergedRights));

		// delete callback cookie
		cookies().delete(process.env.USER_AUTH_CALLBACK_URL_COOKIE_KEY!);

		// save the user token in the cookie
		cookies().set(process.env.USER_SESSION_COOKIE_KEY!, response.token, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			expires: moment().add(2, "days").toDate(),
		});

		// save the user token in the cookie
		cookies().set(
			process.env.USER_SESSION_USER_COOKIE_KEY!,
			JSON.stringify({
				id: response.user.id,
				name: response.user.name,
				email: response.user.email,
			}),
			{
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				expires: moment().add(2, "days").toDate(),
			},
		);

		// save the user institution in the cookie
		cookies().set(
			process.env.USER_SESSION_INSTITUTE_KEY!,
			JSON.stringify(response.user.institution),
			{
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				expires: moment().add(2, "days").toDate(),
			},
		);

		// save the user profiles in the cookie
		cookies().set(
			process.env.USER_SESSION_PROFILES_COOKIE_KEY!,
			JSON.stringify(profiles),
			{
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				expires: moment().add(2, "days").toDate(),
			},
		);

		// save the user authorizations in the cookie
		cookies().set(
			process.env.USER_SESSION_AUTHORIZATIONS_COOKIE_KEY!,
			JSON.stringify(rights),
			{
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				expires: moment().add(2, "days").toDate(),
			},
		);
		console.log("Voici les authorizations : ", rights);
		console.log("Voici la reponse du login : ", response.token);

		return new Response(
			JSON.stringify({
				institution: response.user.institution,
				authorizations: rights,
			}),
			{ status: 200 },
		);
	} catch (error) {
		return new Response(JSON.stringify(serializeError(error)), { status: 500 });
	}
}
