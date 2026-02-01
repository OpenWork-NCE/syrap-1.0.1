"use client";

import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { UnreadCountResponse } from "@/types";
import { PATH_SECTIONS } from "@/routes";

export function UnreadMessagesBadge() {
	const { data } = useQuery<UnreadCountResponse>({
		queryKey: ["unread-count"],
		queryFn: async () => {
			const res = await fetch("/api/messages/unread-count");
			if (!res.ok) return { unread_count: 0 };
			return res.json();
		},
		refetchInterval: 60000, // Polling toutes les 60s
		refetchOnWindowFocus: true,
	});

	const count = data?.unread_count || 0;

	return (
		<Tooltip label={count > 0 ? `${count} message(s) non lu(s)` : "Messagerie"}>
			<Indicator
				label={count > 99 ? "99+" : count}
				size={16}
				disabled={count === 0}
				color="red"
				offset={4}
			>
				<ActionIcon
					component={Link}
					href={PATH_SECTIONS.messages}
					variant="subtle"
					size="lg"
					color="gray"
				>
					<IconMessage size={20} />
				</ActionIcon>
			</Indicator>
		</Tooltip>
	);
}
