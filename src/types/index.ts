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
	model: string;
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
	model?: string;
	// Additional properties for profile page
	phone?: string;
	position?: string;
	avatar?: string;
	github?: string;
	twitter?: string;
	linkedin?: string;
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

export type Localization = {
	id: string;
	name: string;
	department: string;
	region: string;
	created_at: string;
};

export type University = {
	id: string;
	name: string;
	code: string;
	phone: string;
	institute: string;
	description: string;
	email: string;
	arrondissement: Localization;
	user_id: string;
	cenadi_id: string;
	branches_count: string;
	levels_count: string;
};

export type Classroom = {
	id: string;
	designation: string;
	level: Level;
	branch: Branch;
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
	institute: string;
	user: string;
	branches_count: string;
	levels_count: string;
};

export type ClassroomForWithSyllabus = {
	id: string;
	designation: string;
	level: Level;
	branch: Branch;
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
	institute: string;
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
	levels_count: string;
	branches_count: string;
};

export type ShowIpesWithClassrooms = {
	id: string;
	name: string;
	code: string;
	phone: string;
	email: string;
	user: string;
	cenadi: string;
	institute: string;
	arrondissement?: Localization;
	user_id: string;
	cenadi_id: string;
	salles: ClassroomForWithSyllabus[];
	university: ShowUniversitWihClassrooms;
	arrete_ouverture: string;
	decret_creation: string;
	levels_count: string;
	branches_count	: string;
};

export type ShowIpes = {
	id: string;
	name: string;
	code: string;
	phone: string;
	email: string;
	user: string;
	cenadi: string;
	institute: string;
	university: ShowUniversity;
	arrondissement?: Localization;
	arrete_ouverture: string;
	decret_creation: string;
	promoteur: string;
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
	visibility: string[];
	file: File | null;
}

export interface ComparisonResult {
	commonsUes: Ue[];
	onlyInRecord1: Ue[];
	onlyInRecord2: Ue[];
	differentsUes: Ue[];
}
