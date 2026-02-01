"use client";

import { useState } from "react";
import {
	Stack,
	Group,
	Text,
	Paper,
	Timeline,
	ActionIcon,
	Button,
	Modal,
	Badge,
	Tooltip,
	Loader,
	Alert,
	Divider,
} from "@mantine/core";
import {
	IconHistory,
	IconDownload,
	IconRefresh,
	IconUser,
	IconFile,
	IconAlertCircle,
	IconCheck,
	IconClock,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DocumentVersion, FileDocument } from "@/types";
import { formatFileSize, formatDate } from "@/app/lib/utils";

interface VersionHistoryProps {
	document: FileDocument;
	versions: DocumentVersion[];
	onRestoreVersion: (versionNumber: number) => Promise<void>;
	onDownloadVersion: (version: DocumentVersion) => Promise<void>;
	isLoading?: boolean;
	onClose?: () => void;
}

export function VersionHistory({
	document,
	versions,
	onRestoreVersion,
	onDownloadVersion,
	isLoading = false,
	onClose,
}: VersionHistoryProps) {
	const [restoreModalOpened, { open: openRestoreModal, close: closeRestoreModal }] =
		useDisclosure(false);
	const [versionToRestore, setVersionToRestore] = useState<DocumentVersion | null>(null);
	const [isRestoring, setIsRestoring] = useState(false);
	const [isDownloading, setIsDownloading] = useState<string | null>(null);

	const handleRestoreClick = (version: DocumentVersion) => {
		setVersionToRestore(version);
		openRestoreModal();
	};

	const handleRestoreConfirm = async () => {
		if (!versionToRestore) return;

		setIsRestoring(true);
		try {
			await onRestoreVersion(versionToRestore.version_number);
			notifications.show({
				title: "Succès",
				message: `Version ${versionToRestore.version_number} restaurée avec succès`,
				color: "green",
				icon: <IconCheck size={16} />,
			});
			closeRestoreModal();
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Impossible de restaurer cette version",
				color: "red",
				icon: <IconAlertCircle size={16} />,
			});
		} finally {
			setIsRestoring(false);
		}
	};

	const handleDownload = async (version: DocumentVersion) => {
		setIsDownloading(version.id);
		try {
			await onDownloadVersion(version);
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Impossible de télécharger cette version",
				color: "red",
			});
		} finally {
			setIsDownloading(null);
		}
	};

	if (isLoading) {
		return (
			<Paper p="xl" withBorder radius="md">
				<Group justify="center" py="xl">
					<Loader size="md" />
					<Text>Chargement de l'historique...</Text>
				</Group>
			</Paper>
		);
	}

	if (versions.length === 0) {
		return (
			<Paper p="md" withBorder radius="md">
				<Alert
					icon={<IconHistory size={16} />}
					title="Aucun historique"
					color="gray"
					variant="light"
				>
					Ce document n'a pas encore d'historique de versions.
				</Alert>
			</Paper>
		);
	}

	// Sort versions by version number descending
	const sortedVersions = [...versions].sort(
		(a, b) => b.version_number - a.version_number,
	);

	return (
		<Paper p="md" withBorder radius="md">
			<Stack gap="md">
				<Group justify="space-between">
					<Group gap="xs">
						<IconHistory size={20} />
						<Text fw={600}>Historique des versions</Text>
						<Badge variant="light">{versions.length} version(s)</Badge>
					</Group>
					{onClose && (
						<Button variant="subtle" size="xs" onClick={onClose}>
							Fermer
						</Button>
					)}
				</Group>

				<Divider />

				<Timeline active={0} bulletSize={24} lineWidth={2}>
					{sortedVersions.map((version, index) => (
						<Timeline.Item
							key={version.id}
							bullet={
								version.is_current ? (
									<IconCheck size={12} />
								) : (
									<IconClock size={12} />
								)
							}
							title={
								<Group gap="xs">
									<Text fw={500}>Version {version.version_number}</Text>
									{version.is_current && (
										<Badge size="xs" color="green">
											Actuelle
										</Badge>
									)}
								</Group>
							}
						>
							<Stack gap="xs" mt="xs">
								<Group gap="xs">
									<IconUser size={14} />
									<Text size="sm" c="dimmed">
										{version.creator.name}
									</Text>
									<Text size="sm" c="dimmed">
										•
									</Text>
									<Text size="sm" c="dimmed">
										{formatDate(version.created_at)}
									</Text>
								</Group>

								<Group gap="xs">
									<IconFile size={14} />
									<Text size="sm">
										{version.file.name}
									</Text>
									<Badge size="xs" variant="light" color="gray">
										{version.file.size_formatted}
									</Badge>
								</Group>

								{version.change_notes && (
									<Text size="sm" c="dimmed" fs="italic">
										"{version.change_notes}"
									</Text>
								)}

								<Group gap="xs" mt="xs">
									<Tooltip label="Télécharger cette version">
										<ActionIcon
											variant="light"
											color="blue"
											size="sm"
											onClick={() => handleDownload(version)}
											loading={isDownloading === version.id}
										>
											<IconDownload size={14} />
										</ActionIcon>
									</Tooltip>

									{!version.is_current && (
										<Tooltip label="Restaurer cette version">
											<ActionIcon
												variant="light"
												color="orange"
												size="sm"
												onClick={() => handleRestoreClick(version)}
											>
												<IconRefresh size={14} />
											</ActionIcon>
										</Tooltip>
									)}
								</Group>
							</Stack>
						</Timeline.Item>
					))}
				</Timeline>
			</Stack>

			{/* Restore Confirmation Modal */}
			<Modal
				opened={restoreModalOpened}
				onClose={closeRestoreModal}
				title="Restaurer une version"
				centered
			>
				<Stack gap="md">
					<Alert
						icon={<IconAlertCircle size={16} />}
						title="Attention"
						color="orange"
						variant="light"
					>
						La restauration d'une ancienne version créera une nouvelle version du
						document avec le contenu de la version {versionToRestore?.version_number}.
						L'historique existant sera conservé.
					</Alert>

					{versionToRestore && (
						<Paper p="sm" withBorder>
							<Stack gap="xs">
								<Text size="sm" fw={500}>
									Version à restaurer: {versionToRestore.version_number}
								</Text>
								<Text size="sm" c="dimmed">
									Fichier: {versionToRestore.file.name}
								</Text>
								<Text size="sm" c="dimmed">
									Créée le: {formatDate(versionToRestore.created_at)}
								</Text>
								<Text size="sm" c="dimmed">
									Par: {versionToRestore.creator.name}
								</Text>
							</Stack>
						</Paper>
					)}

					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={closeRestoreModal} disabled={isRestoring}>
							Annuler
						</Button>
						<Button
							color="orange"
							onClick={handleRestoreConfirm}
							loading={isRestoring}
							leftSection={<IconRefresh size={14} />}
						>
							Restaurer
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Paper>
	);
}

interface VersionHistoryModalProps {
	opened: boolean;
	onClose: () => void;
	document: FileDocument | null;
	versions: DocumentVersion[];
	onRestoreVersion: (versionNumber: number) => Promise<void>;
	onDownloadVersion: (version: DocumentVersion) => Promise<void>;
	isLoading?: boolean;
}

export function VersionHistoryModal({
	opened,
	onClose,
	document,
	versions,
	onRestoreVersion,
	onDownloadVersion,
	isLoading = false,
}: VersionHistoryModalProps) {
	if (!document) return null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={`Historique: ${document.title}`}
			size="lg"
			centered
		>
			<VersionHistory
				document={document}
				versions={versions}
				onRestoreVersion={onRestoreVersion}
				onDownloadVersion={onDownloadVersion}
				isLoading={isLoading}
			/>
		</Modal>
	);
}
