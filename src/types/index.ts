export type Ue = {
	id: string;
	name: string;
	slug: string;
	description: string;
	validate?: string;
};

export type Institution = {
	id: string;
	name: string;
	slug: string;
	code: string;
	created_at: string;
};

export type Authorization = {
	id: string;
	name: string;
	guard_name: string;
	created_at: string;
	updated_at: string;
};

export type Profile = {
	id: string;
	name: string;
	permissions: Authorization[];
	institution: Institution;
	created_at: string;
	updated_at: string;
};

export type User = {
	id: string;
	name: string;
	email: string;
	password?: string;
	roles: Profile[];
	model_id?: string;
	model: string;
};

export type Cenadi = {
	id: string;
	code: string;
	name: string;
};

export type Minesup = {
	id: string;
	code: string;
	name: string;
};

export type Branch = {
	id: string;
	name: string;
	description: string;
	validate: string;
	author: {
		user_id: string;
	};
};

export type Level = {
	id: string;
	name: string;
	description: string;
	validate: string;
	author: {
		user_id: string;
	};
};

export type University = {
	id: string;
	name: string;
	code: string;
	phone: string;
	description: string;
	email: string;
	arrondissement_id: string;
	user_id: string;
	cenadi_id: string;
};

export type Localization = {
	id: string;
	slug: string;
	name: string;
	department_id: string;
	created_at: string;
	updated_at: string;
};

export type Classroom = {
	id: string;
	designation: string;
	niveau: Level;
	filiere: Branch;
};

export type FormattedClassroom = {
	id: string;
	designation: string;
	levelId: string;
	levelName: string;
	levelDescription: string;
	branchId: string;
	branchName: string;
	branchDescription: string;
	institute_id?: string;
};

export type ShowUniversity = {
	id: string;
	name: string;
	code: string;
	phone: string;
	description: string;
	email: string;
	arrondissement?: Localization;
	institute_id: string;
	user: string;
	salles?: Classroom;
	ipes_count: string;
	branch_count: string;
	global_matching: string;
};

export type ClassroomForWithSyllabus = {
	id: string;
	designation: string;
	niveau: Level;
	filiere: Branch;
	ues: {
		id: string;
		name: string;
		slug: string;
		description: string;
	}[];
};

export type ShowUniversitWihClassrooms = {
	id: string;
	name: string;
	code: string;
	phone: string;
	description: string;
	email: string;
	arrondissement?: Localization;
	institute_id: string;
	user: string;
	salles: ClassroomForWithSyllabus[];
};

export type Ipes = {
	id: string;
	name: string;
	code: string;
	phone: string;
	email: string;
	arrondissement_id: string;
	user_id: string;
	cenadi_id: string;
	university_id: string;
	arrete_ouverture: string;
	decret_creation: string;
	promoteur_id: string;
};

export type ShowIpes = {
	id: string;
	name: string;
	code: string;
	phone: string;
	email: string;
	arrondissement?: Localization;
	user_id: string;
	cenadi_id: string;
	salles?: Classroom;
	university?: University;
	arrete_ouverture: string;
	decret_creation: string;
	promoteur_id: string;
};

export type SyllabusUe = {
	id: string;
	ue: string;
	year: string;
	nbr_hrs: string;
	credit: string;
};

export type Syllabus = {
	id: string;
	name: string;
};

export type LogLevel = "error" | "warning" | "info" | "debug";

export interface LogEntry {
	id: string;
	level: LogLevel;
	log_type: string;
	created_at: string;
	description: string;
	target: string;
	timestamp: number;
}

export interface LogCounts {
	error: number;
	warning: number;
	info: number;
	debug: number;
}

export interface LogFile {
	id: string;
	name: string;
	date: string;
	size: number;
}

export type FileType =
	| "pdf"
	| "word"
	| "excel"
	| "text"
	| "zip"
	| "image"
	| "other";

export interface FileDocument {
	id: string;
	title: string;
	description: string;
	size: number;
	type: FileType;
	author: string;
	uploadDate: string;
	visibility: ("CENADI" | "MINESUP" | "IPES")[];
	url: string;
}

export const mockFiles: FileDocument[] = [
	{
		id: "1",
		title: "Rapport Annuel 2023",
		description: "Rapport annuel des activités académiques",
		size: 2.5 * 1024 * 1024,
		type: "pdf",
		author: "Jean Dupont",
		uploadDate: "2023-12-25T10:30:00",
		visibility: ["CENADI", "MINESUP"],
		url: "/files/rapport-2023.pdf",
	},
	{
		id: "2",
		title: "Guide d'utilisation",
		description: "Manuel utilisateur du système",
		size: 1.8 * 1024 * 1024,
		type: "word",
		author: "Marie Claire",
		uploadDate: "2023-12-24T15:45:00",
		visibility: ["CENADI", "MINESUP", "IPES"],
		url: "/files/guide.docx",
	},
	// Add more mock data with various file types
];

export interface FileFormData {
	title: string;
	description: string;
	file?: File;
	visibility: ("CENADI" | "MINESUP" | "IPES")[];
}

export interface ComparisonResult {
	commonsUes: Ue[];
	onlyInRecord1: Ue[];
	onlyInRecord2: Ue[];
	differentsUes: Ue[];
}
