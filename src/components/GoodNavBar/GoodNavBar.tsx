import { ScrollArea, rem } from "@mantine/core";
import classes from "./GoodNavBar.module.css";
import type { NavItem } from "@/types/nav-item";
import { LinksGroup } from "@/components/GoodNavBar/GoodNavbarLinksGroup/GoodNavbarLinksGroup";
import { ThemedNavbar } from "@/components/ui/ThemeComponents";
import { useRef, useEffect } from "react";

interface Props {
	data: NavItem[];
	adminData: NavItem[];
	hidden?: boolean;
}

export function GoodNavbar({ data, adminData }: Props) {
	const links = data.map((item) => <LinksGroup {...item} key={item.label} />);
	const adminLinks = adminData.map((item) => <LinksGroup {...item} key={item.label} />);
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
				<ScrollArea
					className={classes.links}
					scrollbarSize={6}
					type="hover"
					offsetScrollbars
					scrollHideDelay={500}
					viewportRef={scrollAreaRef}
				>
					<div className={classes.linksInner}>{adminLinks}</div>
				</ScrollArea>
			</div>
		</ThemedNavbar>
	);
}
