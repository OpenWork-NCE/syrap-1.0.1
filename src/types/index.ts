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
		author: {
			user_id: string;
		};
		pivot: {
			salle_id: string;
			ue_id: string;
			year: string;
			nbr_hrs: string;
			credit: string;
		};
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
	university_id: string;
	arrete_ouverture: string;
	decret_creation: string;
	promoteur: string;
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
	institute: string;
	arrondissement?: Localization;
	user_id: string;
	salles: ClassroomForWithSyllabus[];
	university: ShowUniversitWihClassrooms;
	arrete_ouverture: string;
	decret_creation: string;
	promoteur: string;
	levels_count: string;
	branches_count: string;
};

export type ShowIpes = {
	id: string;
	name: string;
	code: string;
	phone: string;
	email: string;
	user: string;
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

// ============================================
// GESTION DOCUMENTAIRE (Module M06)
// ============================================

export interface DocumentVersion {
	id: string;
	version_number: number;
	is_current: boolean;
	creator: {
		id: string;
		name: string;
		email: string;
	};
	file: {
		name: string;
		mime_type: string;
		size: number;
		size_formatted: string;
		download_url: string;
	};
	change_notes: string | null;
	created_at: string;
}

export interface Folder {
	id: string;
	name: string;
	description: string | null;
	parent_id: string | null;
	owner: {
		id: string;
		name: string;
		email: string;
	};
	scope: {
		type: string;
		id: string;
	} | null;
	path: string;
	breadcrumbs: { id: string; name: string }[];
	children_count: number;
	documents_count: number;
	children?: Folder[];
	documents?: FileDocument[];
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export interface FolderFormData {
	name: string;
	description?: string;
	parent_id?: string | null;
	model?: string;
	model_id?: string;
}

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
	folder?: {
		id: string;
		name: string;
		path: string;
	} | null;
	current_version?: number;
	versions?: DocumentVersion[];
	latest_version?: DocumentVersion;
	deleted_at?: string | null;
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
	folder_id?: string | null;
	change_notes?: string;
}

export interface ComparisonResult {
	commonsUes: Ue[];
	onlyInRecord1: Ue[];
	onlyInRecord2: Ue[];
	differentsUes: Ue[];
}

// ============================================
// MESSAGERIE INTERNE (Module M10)
// ============================================

export interface MessageUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	institution?: {
		id: string;
		name: string;
		type: string;
	};
}

export interface Message {
	id: string;
	conversation_id: string;
	sender_id: string;
	sender: MessageUser;
	body: string;
	attachments?: string[];
	created_at: string;
	updated_at: string;
}

export interface ConversationParticipant {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role?: string;
	institution?: {
		id: string;
		name: string;
		type: "cenadi" | "minesup" | "university" | "ipes";
	};
	pivot?: {
		last_read_at: string | null;
		joined_at: string;
	};
}

export interface Conversation {
	id: string;
	subject?: string;
	type: "direct" | "group";
	participants: ConversationParticipant[];
	latest_message?: Message;
	unread_count: number;
	created_at: string;
	updated_at: string;
}

export interface ConversationWithMessages {
	conversation: Conversation;
	messages: {
		data: Message[];
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface UnreadCountResponse {
	unread_count: number;
}

export interface SendMessagePayload {
	body: string;
	attachments?: string[];
}

export interface CreateConversationPayload {
	recipient_id: string;
	message: string;
	subject?: string;
}
