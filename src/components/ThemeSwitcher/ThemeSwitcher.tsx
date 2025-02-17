// "use client";
//
// import {
// 	Group,
// 	type MantineColorScheme,
// 	Radio,
// 	useMantineColorScheme,
// 	Switch,
// } from "@mantine/core";
// import { IconMoonStars, IconSun } from "@tabler/icons-react";
//
// export const ThemeSwitcher = () => {
// 	const { colorScheme, setColorScheme } = useMantineColorScheme();
//
// 	const sunIcon = <IconSun stroke={2.5} size={18} />;
//
// 	const moonIcon = <IconMoonStars stroke={2.5} size={18} />;
//
// 	return (
// 		// <Radio.Group
// 		// 	value={colorScheme}
// 		// 	onChange={(value) => {
// 		// 		setColorScheme(value as MantineColorScheme);
// 		// 	}}
// 		// 	name="theme"
// 		// 	label="Theme Mode"
// 		// >
// 		// 	<Group mt="sm">
// 		// 		<Radio value="light" label="Light" />
// 		// 		<Radio value="dark" label="Dark" />
// 		// 	</Group>
// 		// </Radio.Group>
//
// 		<Switch
// 			size="md"
// 			onLabel={sunIcon}
// 			offLabel={moonIcon}
// 			onChange={(value) =>
// 				setColorScheme(value.target.checked ? "dark" : "light")
// 			}
// 		/>
// 	);
// };

import cx from "clsx";
import {
	ActionIcon,
	useMantineColorScheme,
	useComputedColorScheme,
	Group,
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
			>
				<IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
				<IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
			</ActionIcon>
		</Group>
	);
};
