import cx from "clsx";
import {
	useMantineColorScheme,
	useComputedColorScheme,
	Group,
	ActionIcon,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import classes from "./ThemeSwitcher.module.css";

export const ThemeSwitcher = () => {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light", {
		getInitialValueInEffect: true,
	});

	return (
		<Group justify="center">
			<ActionIcon
				onClick={() =>
					setColorScheme(computedColorScheme === "light" ? "dark" : "light")
				}
				variant="subtle"
				size="md"
				aria-label="Toggle color scheme"
				className={classes.themeButton}
			>
				<IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
				<IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
			</ActionIcon>
		</Group>
	);
};
