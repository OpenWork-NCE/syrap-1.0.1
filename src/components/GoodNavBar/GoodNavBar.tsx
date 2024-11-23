import { Group, Code, ScrollArea, rem } from "@mantine/core";
import { UserButton } from "../UserButton/UserButton";
import classes from "./GoodNavBar.module.css";
import type { NavItem } from "@/types/nav-item";
import { LinksGroup } from "@/components/GoodNavbarLinksGroup/GoodNavbarLinksGroup";

interface Props {
	data: NavItem[];
	hidden?: boolean;
}

export function GoodNavbar({ data }: Props) {
	const links = data.map((item) => <LinksGroup {...item} key={item.label} />);

	return (
		<>
			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			<div className={classes.footer}>
				<UserButton
					image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
					name="Harriette"
					email="hspoon@outlook.com"
				/>
			</div>
		</>
	);
}
