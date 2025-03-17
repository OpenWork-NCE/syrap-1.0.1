import { useState } from "react";
import {
	Group,
	Box,
	Collapse,
	ThemeIcon,
	UnstyledButton,
	rem,
	useDirection,
} from "@mantine/core";
import {
	IconCalendarStats,
	IconChevronLeft,
	IconChevronRight,
} from "@tabler/icons-react";
import { ThemedText, ThemedNavbarLink } from "@/components/ui/ThemeComponents";
import classes from "./GoodNavbarLinkGroup.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface LinksGroupProps {
	icon: React.FC<any>;
	label: string;
	link?: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
}

export function LinksGroup({
	icon: Icon,
	label,
	link,
	initiallyOpened,
	links,
}: LinksGroupProps) {
	const pathname = usePathname();
	const { dir } = useDirection();

	const hasLinks = Array.isArray(links);
	const [opened, setOpened] = useState(initiallyOpened || false);
	const ChevronIcon = dir === "ltr" ? IconChevronRight : IconChevronLeft;
	const items = (hasLinks ? links : []).map((link) => (
		<Link
			href={link.link}
			key={link.label}
			className={`${classes.link} ${link.link === pathname && classes.activeLink}`}
		>
			{link.label}
		</Link>
	));

	return (
		<>
			{link ? (
				<Link
					href={link}
					className={`${classes.control} ${link === pathname && classes.activeControl}`}
				>
					<Group gap={0} justify="space-between">
						<Box style={{ display: "flex", alignItems: "center" }}>
							<ThemeIcon variant="light" size={30}>
								<Icon size="1.1rem" />
							</ThemeIcon>
							<Box ml="md">
								<ThemedText>{label}</ThemedText>
							</Box>
						</Box>
					</Group>
				</Link>
			) : (
				<UnstyledButton
					onClick={() => {
						if (hasLinks) {
							setOpened((o) => !o);
							return;
						}
					}}
					className={classes.control}
				>
					<Group gap={0} justify="space-between">
						<Box style={{ display: "flex", alignItems: "center" }}>
							<ThemeIcon variant="light" size={30}>
								<Icon size="1.1rem" />
							</ThemeIcon>
							<Box ml="md">
								<ThemedText>{label}</ThemedText>
							</Box>
						</Box>
						{hasLinks && (
							<ChevronIcon
								className={classes.chevron}
								size="1rem"
								stroke={1.5}
								style={{
									transform: opened
										? `rotate(${dir === "rtl" ? -90 : 90}deg)`
										: "none",
								}}
							/>
						)}
					</Group>
				</UnstyledButton>
			)}
			{hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
		</>
	);
}
