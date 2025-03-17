import { ScrollArea, rem } from "@mantine/core";
import { UserButton } from "../UserButton/UserButton";
import classes from "./GoodNavBar.module.css";
import type { NavItem } from "@/types/nav-item";
import { LinksGroup } from "@/components/GoodNavbarLinksGroup/GoodNavbarLinksGroup";
import { ThemedNavbar } from "@/components/ui/ThemeComponents";
import { useRef, useEffect } from "react";

interface Props {
	data: NavItem[];
	hidden?: boolean;
}

export function GoodNavbar({ data }: Props) {
	const links = data.map((item) => <LinksGroup {...item} key={item.label} />);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	// Update scroll behavior when data changes
	useEffect(() => {
		// Force recalculation of scrollbars
		if (scrollAreaRef.current) {
			// Small timeout to ensure DOM is updated
			setTimeout(() => {
				// Trigger resize event to recalculate scrollbars
				window.dispatchEvent(new Event("resize"));
			}, 100);
		}
	}, [data]);

	return (
		<ThemedNavbar className={classes.navbar}>
			<ScrollArea
				className={classes.links}
				scrollbarSize={6}
				type="hover"
				offsetScrollbars
				scrollHideDelay={500}
				viewportRef={scrollAreaRef}
			>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			<div className={classes.footer}>
				<UserButton
					image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
					name="Harriette"
					email="hspoon@outlook.com"
				/>
			</div>
		</ThemedNavbar>
	);
}
