function path(root: string, sublink: string) {
	return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "/dashboard";

export const PATH_BOARD = {
	root: ROOTS_DASHBOARD,
};

const ROOTS_UES = "/ues/";
const ROOTS_AUTH = "/";
const ROOTS_DOCUMENTS = "/documents";
const ROOTS_USERS = "/users";
const ROOT_SECTIONS = path(ROOTS_DASHBOARD, "/sections");
const ROOTS_UNIVERSITIES = "/universities";
const ROOTS_IPES = "/ipes";

export const PATH_SECTIONS = {
	root: ROOT_SECTIONS,
	ues: path(ROOT_SECTIONS, "/ues/list"),
	branchesNlevels: path(ROOT_SECTIONS, "/branchesNlevels"),
	branches: path(ROOT_SECTIONS, "/branches"),
	levels: path(ROOT_SECTIONS, "/levels"),
	users: path(ROOT_SECTIONS, "/users"),
	profiles: path(ROOT_SECTIONS, "/profiles"),
	authorizations: path(ROOT_SECTIONS, "/authorizations"),
	universities: {
		all: path(ROOT_SECTIONS, ROOTS_UNIVERSITIES + "/"),
		syllabus: path(ROOT_SECTIONS, ROOTS_UNIVERSITIES + `/syllabus`),
		university_details: (id: string): string =>
			path(ROOT_SECTIONS, ROOTS_UNIVERSITIES + `/${id}`),
	},
	crosscompare: path(ROOT_SECTIONS, "/crosscompare"),
	ipes: {
		all: path(ROOT_SECTIONS, ROOTS_IPES + "/"),
		syllabus: path(ROOT_SECTIONS, ROOTS_IPES + `/syllabus`),
		documents: path(ROOT_SECTIONS, ROOTS_IPES + `/documents`),
		ipes_details: (id: string): string =>
			path(ROOT_SECTIONS, ROOTS_IPES + `/${id}`),
	},
	documents: path(ROOT_SECTIONS, "/documents/documents"),
	cenadis: path(ROOT_SECTIONS, "/cenadis"),
	minesups: path(ROOT_SECTIONS, "/minesups"),
	reports: path(ROOT_SECTIONS, "/reports"),
	logs: path(ROOT_SECTIONS, "/logs"),
};

export const PATH_AUTHENTICATIONS = {
	root: ROOTS_AUTH,
	login: "/login",
	forgotPassword: "/forgotPassword",
};
