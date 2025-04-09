import {
	IconAdjustmentsBolt,
	IconAffiliate,
	IconAlertCircle,
	IconChartArea,
	IconComponents,
	IconDashboard,
	IconFiles,
	IconFolders,
	IconFolderShare,
	IconFridge,
	IconGitCompare,
	IconHomeCog,
	IconHomeEdit,
	IconLock,
	IconMoodSmile,
	IconNotebook,
	IconSchool,
	IconUserCheck,
	IconUsers,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";
import { PATH_SECTIONS } from "../routes";
import { mkConfig } from "export-to-csv";

export const navLinks = (authorizations: string[]) => {
	return [
		{ label: "Accueil", icon: IconDashboard, link: "/dashboard" },
		...(authorizations.includes("list-ues")
			? [
					{
						label: "UEs",
						icon: IconFolders,
						link: `${PATH_SECTIONS.ues}`,
					},
				]
			: []),
		...(authorizations.includes("list-branchs") &&
		authorizations.includes("list-levels")
			? [
					{
						label: "Filières et Niveaux",
						icon: IconFridge,
						link: `${PATH_SECTIONS.branchesNlevels}`,
					},
				]
			: []),
		...(authorizations.includes("list-branchs") &&
		!authorizations.includes("list-levels")
			? [
					{
						label: "Filières",
						icon: IconFridge,
						link: `${PATH_SECTIONS.branches}`,
					},
				]
			: []),
		...(!authorizations.includes("list-branchs") &&
		authorizations.includes("list-levels")
			? [
					{
						label: "Niveaux",
						icon: IconFridge,
						link: `${PATH_SECTIONS.levels}`,
					},
				]
			: []),
		...(authorizations.includes("show-universities")
			? [
					{
						label: "Universités de Tutelle",
						icon: IconSchool,
						initiallyOpened: true,
						links: [
							{
								label: "Toutes les universités",
								link: `${PATH_SECTIONS.universities.all}`,
							},
							{
								label: "Programmes",
								link: `${PATH_SECTIONS.universities.syllabus}`,
							},
						],
					},
				]
			: []),
		...(authorizations.includes("list-ipes")
			? [
		{
			label: "IPES",
			icon: IconNotebook,
			initiallyOpened: true,
			links: [
				{
					label: "Toutes les IPES",
					link: `${PATH_SECTIONS.ipes.all}`,
				},
				{
					label: "Programmes",
					link: `${PATH_SECTIONS.ipes.syllabus}`,
				},
			],
		},
			]
		: []),
		...(((authorizations.includes("list-ues")) && (authorizations.includes("show-universities")))
		 	? [
		{
			label: "Croiser et Comparer",
			icon: IconGitCompare,
			link: `${PATH_SECTIONS.crosscompare}`,
		},
		 	]
		 : []),

		// ...(authorizations.includes("list-ues")
		// 	? [
			{
				label: "Documents",
				icon: IconChartArea,
				initiallyOpened: true,
				links: [
					{
						label: "Rapports",
						link: `${PATH_SECTIONS.reports}`,
					},
					{
						label: "Logs",
						link: `${PATH_SECTIONS.logs}`,
					},
				],
			},
			// ]
			// : []),
	] as NavItem[];
};

export const adminNavLinks = (authorizations: string[]) => {
	return [
		{
			label: "Institutions",
			icon: IconHomeEdit,
			links: [
				...(authorizations.includes("list-cenadis")
					? [
							{
								label: "Cenadi",
								link: `${PATH_SECTIONS.cenadis}`,
							},
						]
					: []),

				...(authorizations.includes("list-minsup")
					? [
							{
								label: "Minesup",
								link: `${PATH_SECTIONS.minesups}`,
							},
						]
					: []),
			],
		},
		{
			label: "Utilisateurs & Rôles",
			icon: IconUsers,
			links: [
				...(authorizations.includes("list-ues")
					? [
							{
								label: "Utilisateurs",
								icon: IconUsers,
								link: `${PATH_SECTIONS.users}`,
							},
						]
					: []),
				...(authorizations.includes("list-ues")
					? [
							{
								label: "Rôles",
								icon: IconUserCheck,
								link: `${PATH_SECTIONS.profiles}`,
							},
						]
					: []),
				// ...(authorizations.includes("list-ues")
				// // 	? [
							{
								label: "Permissions",
								icon: IconAffiliate,
								link: `${PATH_SECTIONS.authorizations}`,
							},
				// 		]
				// 	: []),
			],
		},
	] as NavItem[];
};

export const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});
