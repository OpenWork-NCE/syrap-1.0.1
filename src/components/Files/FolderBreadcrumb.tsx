"use client";

import { Breadcrumbs, Anchor, Text, Group } from "@mantine/core";
import { IconFolder, IconHome } from "@tabler/icons-react";
import { Folder } from "@/types";

interface FolderBreadcrumbProps {
	folder: Folder | null;
	onNavigate: (folderId: string | null) => void;
}

export function FolderBreadcrumb({ folder, onNavigate }: FolderBreadcrumbProps) {
	if (!folder) {
		return (
			<Group gap="xs">
				<IconHome size={16} />
				<Text size="sm" fw={500}>
					Tous les documents
				</Text>
			</Group>
		);
	}

	const items = [
		<Anchor
			key="root"
			onClick={() => onNavigate(null)}
			style={{ cursor: "pointer" }}
			size="sm"
		>
			<Group gap={4}>
				<IconHome size={14} />
				<span>Accueil</span>
			</Group>
		</Anchor>,
		...folder.breadcrumbs.map((crumb, index) => {
			const isLast = index === folder.breadcrumbs.length - 1;
			return isLast ? (
				<Group key={crumb.id} gap={4}>
					<IconFolder size={14} />
					<Text size="sm" fw={500}>
						{crumb.name}
					</Text>
				</Group>
			) : (
				<Anchor
					key={crumb.id}
					onClick={() => onNavigate(crumb.id)}
					style={{ cursor: "pointer" }}
					size="sm"
				>
					<Group gap={4}>
						<IconFolder size={14} />
						<span>{crumb.name}</span>
					</Group>
				</Anchor>
			);
		}),
	];

	return <Breadcrumbs separator="/">{items}</Breadcrumbs>;
}
