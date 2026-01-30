import { ThemeIcon, rem } from "@mantine/core";
import { useState, useEffect } from "react";
import {
	ThemedPaper,
	ThemedText,
	ThemedTitle,
} from "@/components/ui/ThemeComponents";
import classes from "./StatsCard.module.css";

interface StatsCardProps {
	icon: React.FC<any>;
	title: string;
	count: string;
	description?: string;
}

export function StatsCard({
	icon: Icon,
	title,
	count,
	description,
}: StatsCardProps) {
	const [isVisible, setIsVisible] = useState(false);

	// Animation on mount
	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<ThemedPaper
			withBorder
			className={`${classes.card} theme-card-hover`}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(20px)",
				transition: "opacity 0.5s ease, transform 0.5s ease",
			}}
		>
			<ThemeIcon className={classes.icon} size={72} radius={72}>
				<Icon style={{ width: rem(40), height: rem(40) }} stroke={1.5} />
			</ThemeIcon>

			<ThemedTitle order={4} ta="center" className={classes.title}>
				{title}
			</ThemedTitle>

			<ThemedText c="dimmed" ta="center" fz="xl" className={classes.count}>
				{count}
			</ThemedText>

			{description && (
				<ThemedText c="dimmed" ta="center" fz="xs" mt="sm">
					{description}
				</ThemedText>
			)}
		</ThemedPaper>
	);
}
