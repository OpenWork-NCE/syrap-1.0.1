import { Institution, Profile } from "@/types";
export default interface IAccessToken {
	user: {
		id: string;
		name: string;
		email: string;
		created_at: string;
		institution: Institution;
		roles: Profile[];
	};
	token_type: "Bearer";
	token: string;
	expires_in: number;
}
