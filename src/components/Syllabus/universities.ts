export const universities = [
	{ id: 1, name: "Université de Paris" },
	{ id: 2, name: "Université de Lyon" },
	{ id: 3, name: "Université de Marseille" },
];

export const departments = [
	{ id: 1, universityId: 1, name: "Informatique" },
	{ id: 2, universityId: 1, name: "Mathématiques" },
	{ id: 3, universityId: 2, name: "Physique" },
	{ id: 4, universityId: 2, name: "Chimie" },
	{ id: 5, universityId: 3, name: "Biologie" },
];

export const levels = [
	{ id: 1, departmentId: 1, name: "Licence 1" },
	{ id: 2, departmentId: 1, name: "Licence 2" },
	{ id: 3, departmentId: 1, name: "Licence 3" },
	{ id: 4, departmentId: 2, name: "Master 1" },
	{ id: 5, departmentId: 2, name: "Master 2" },
];

export const courses = [
	{
		id: 1,
		name: "Algorithmique",
		slug: "algorithmique",
		description: "Introduction aux algorithmes",
		author: { user_id: 1 },
		created: "2024-01-23T00:00:00.000Z",
	},
	{
		id: 2,
		name: "Structures de données",
		slug: "structures-donnees",
		description: "Étude des structures de données",
		author: { user_id: 1 },
		created: "2024-01-23T00:00:00.000Z",
	},
	{
		id: 3,
		name: "Base de données",
		slug: "base-donnees",
		description: "Introduction aux bases de données",
		author: { user_id: 2 },
		created: "2024-01-23T00:00:00.000Z",
	},
];

export const programs = [
	{
		id: 1,
		universityId: 1,
		departmentId: 1,
		levelId: 1,
		courses: [
			{
				courseId: 1,
				name: "Algorithmique",
				description: "Introduction aux algorithmes",
				nbr_hrs: 30,
				year: "2024",
				credit: 3,
			},
			{
				courseId: 2,
				name: "Structures de données",
				description: "Étude des structures de données",
				nbr_hrs: 24,
				year: "2024",
				credit: 3,
			},
		],
	},
	{
		id: 2,
		universityId: 1,
		departmentId: 1,
		levelId: 1,
		courses: [
			{
				courseId: 1,
				name: "Algorithmique",
				description: "Introduction aux algorithmes",
				nbr_hrs: 30,
				year: "2024",
				credit: 3,
			},
			{
				courseId: 2,
				name: "Structures de données",
				description: "Étude des structures de données",
				nbr_hrs: 24,
				year: "2024",
				credit: 3,
			},
		],
	},
	{
		id: 3,
		universityId: 1,
		departmentId: 1,
		levelId: 1,
		courses: [
			{
				courseId: 1,
				name: "Algorithmique",
				description: "Introduction aux algorithmes",
				nbr_hrs: 30,
				year: "2024",
				credit: 3,
			},
			{
				courseId: 2,
				name: "Structures de données",
				description: "Étude des structures de données",
				nbr_hrs: 24,
				year: "2024",
				credit: 3,
			},
		],
	},
	{
		id: 4,
		universityId: 1,
		departmentId: 1,
		levelId: 1,
		courses: [
			{
				courseId: 1,
				name: "Algorithmique",
				description: "Introduction aux algorithmes",
				nbr_hrs: 30,
				year: "2024",
				credit: 3,
			},
			{
				courseId: 2,
				name: "Structures de données",
				description: "Étude des structures de données",
				nbr_hrs: 24,
				year: "2024",
				credit: 3,
			},
		],
	},
];
