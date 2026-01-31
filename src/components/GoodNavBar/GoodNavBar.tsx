import { Box, ScrollArea } from "@mantine/core";
import classes from "./GoodNavBar.module.css";
import type { NavItem } from "@/types/nav-item";
import { LinksGroup } from "@/components/GoodNavBar/GoodNavbarLinksGroup/GoodNavbarLinksGroup";

interface Props {
	data: NavItem[];
	adminData: NavItem[];
	hidden?: boolean;
}

export function GoodNavbar({ data, adminData }: Props) {
	const links = data.map((item) => <LinksGroup {...item} key={item.label} />);
	const adminLinks = adminData.map((item) => (
		<LinksGroup {...item} key={item.label} />
	));

	return (
		<nav className={classes.navbar}>
			{/* Main navigation */}
			<ScrollArea
				className={classes.links}
				scrollbarSize={4}
				type="hover"
				offsetScrollbars
			>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			{/* Admin section */}
			{adminLinks.length > 0 && (
				<div className={classes.footer}>
					<div className={classes.linksInner}>{adminLinks}</div>
				</div>
			)}
		</nav>
	);
}
