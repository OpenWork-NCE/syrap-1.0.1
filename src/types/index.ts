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
