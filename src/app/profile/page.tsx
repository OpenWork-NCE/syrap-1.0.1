"use client";

import { useEffect, useState, useMemo } from "react";
import {
	Avatar,
	Button,
	Divider,
	Grid,
	Group,
	PasswordInput,
	Select,
	SimpleGrid,
	Stack,
	TextInput,
	useMantineColorScheme,
	Loader,
	Alert,
	Paper,
} from "@mantine/core";
import {
	ThemedContainer,
	ThemedFlex,
	ThemedText,
	ThemedTitle,
} from "@/components/ui/ThemeComponents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import {
	IconCheck,
	IconLock,
	IconMail,
	IconPalette,
	IconPhone,
	IconUser,
	IconAlertCircle,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import classes from "./profile.module.css";
import { User, Institution } from "@/types";

// Define schemas using Zod
const profileSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		phone: z.string().optional(),
		position: z.string().optional(),
		department: z.string().optional(),
		// Password fields
		currentPassword: z.string().optional(),
		newPassword: z.string().optional(),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			// If any password field is filled, all must be filled and valid
			const hasPasswordData =
				data.currentPassword || data.newPassword || data.confirmPassword;
			if (!hasPasswordData) return true;

			return (
				data.currentPassword &&
				data.newPassword &&
				data.newPassword.length >= 6 &&
				data.newPassword === data.confirmPassword
			);
		},
		{
			message: "Passwords don't match or are too short",
			path: ["confirmPassword"],
		},
	);

// Type for profile form data
type ProfileFormData = z.infer<typeof profileSchema>;

// Fetch user data function
const fetchUserData = async (): Promise<User> => {
	const response = await fetch("/api/cookies/currentuser");
	if (!response.ok) {
		throw new Error("Failed to fetch user data");
	}
	return response.json();
};

// Fetch institution data function
const fetchInstitutionData = async (): Promise<Institution> => {
	const response = await fetch("/api/cookies/userinstitution");
	if (!response.ok) {
		throw new Error("Failed to fetch institution data");
	}
	return response.json();
};

export default function ProfilePage() {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const [loading, setLoading] = useState(false);

	// Use TanStack Query for data fetching
	const {
		data: userData,
		isLoading: isUserLoading,
		error: userError,
	} = useQuery({
		queryKey: ["user"],
		queryFn: fetchUserData,
	});

	const {
		data: institutionData,
		isLoading: isInstitutionLoading,
		error: institutionError,
	} = useQuery({
		queryKey: ["institution"],
		queryFn: fetchInstitutionData,
	});

	// Derived loading and error states
	const isLoading = isUserLoading || isInstitutionLoading;
	const error = userError || institutionError;

	// Combined form for profile and password
	const methods = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			position: "",
			department: "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const {
		handleSubmit,
		register,
		formState: { errors },
		reset,
	} = methods;

	// Update form values when user data is loaded
	useEffect(() => {
		if (userData && institutionData) {
			reset({
				name: userData.name || "",
				email: userData.email || "",
				phone: userData.phone || "",
				position: userData.position || "",
				department: institutionData?.name || "",
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}
	}, [userData, institutionData, reset]);

	// Handle form submission
	const onSubmit = (data: ProfileFormData) => {
		setLoading(true);

		// Check if password fields are filled
		const isPasswordUpdate =
			data.currentPassword && data.newPassword && data.confirmPassword;

		// API call would go here
		setTimeout(() => {
			// Show appropriate notification
			if (isPasswordUpdate) {
				notifications.show({
					title: "Profile and Password updated",
					message:
						"Your profile information and password have been updated successfully",
					color: "green",
					icon: <IconCheck size={16} />,
				});
			} else {
				notifications.show({
					title: "Profile updated",
					message: "Your profile information has been updated successfully",
					color: "green",
					icon: <IconCheck size={16} />,
				});
			}

			setLoading(false);

			// Clear password fields
			reset({
				...data,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}, 1000);
	};

	// Memoize the first letter of the user's name for the avatar
	const userInitial = useMemo(() => {
		return userData?.name?.charAt(0) || "U";
	}, [userData?.name]);

	if (isLoading) {
		return (
			<ThemedContainer size="lg" py="xl">
				<ThemedFlex
					align="center"
					justify="center"
					direction="column"
					gap="md"
					py="xl"
				>
					<Loader size="lg" />
					<ThemedText>Loading profile data...</ThemedText>
				</ThemedFlex>
			</ThemedContainer>
		);
	}

	if (error) {
		return (
			<ThemedContainer size="lg" py="xl">
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Error loading profile"
					color="red"
					variant="filled"
				>
					{error instanceof Error ? error.message : "An unknown error occurred"}
					<Button
						variant="white"
						color="red"
						mt="md"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</Alert>
			</ThemedContainer>
		);
	}

	return (
		<ThemedContainer size="lg" py="xl">
			<ThemedTitle order={2} mb="lg" className={classes.pageTitle}>
				User Profile
			</ThemedTitle>

			<Grid gutter="lg">
				{/* Profile Information */}
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Paper
						withBorder
						shadow="xs"
						p="lg"
						radius="md"
						className={classes.card}
					>
						<ThemedTitle order={3} mb="md">
							Profile Information
						</ThemedTitle>
						<Divider mb="lg" />

						<FormProvider {...methods}>
							<form onSubmit={handleSubmit(onSubmit)}>
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
									<TextInput
										label="Full Name"
										placeholder="Your name"
										leftSection={<IconUser size={16} />}
										error={errors.name?.message}
										size="md"
										{...register("name")}
									/>
									<TextInput
										label="Email"
										placeholder="Your email"
										leftSection={<IconMail size={16} />}
										error={errors.email?.message}
										size="md"
										{...register("email")}
									/>
									<TextInput
										label="Phone"
										placeholder="Your phone number"
										leftSection={<IconPhone size={16} />}
										error={errors.phone?.message}
										size="md"
										{...register("phone")}
									/>
									<TextInput
										label="Position"
										placeholder="Your position"
										error={errors.position?.message}
										size="md"
										{...register("position")}
									/>
									<TextInput
										label="Department"
										placeholder="Your department"
										error={errors.department?.message}
										size="md"
										{...register("department")}
									/>
								</SimpleGrid>

								<ThemedTitle order={4} mt="xl" mb="md">
									Change Password
								</ThemedTitle>
								<Divider mb="lg" />

								<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
									<PasswordInput
										label="Current Password"
										placeholder="Your current password"
										leftSection={<IconLock size={16} />}
										error={errors.currentPassword?.message}
										size="md"
										{...register("currentPassword")}
									/>
									<PasswordInput
										label="New Password"
										placeholder="Your new password"
										leftSection={<IconLock size={16} />}
										error={errors.newPassword?.message}
										size="md"
										{...register("newPassword")}
									/>
									<PasswordInput
										label="Confirm Password"
										placeholder="Confirm your new password"
										leftSection={<IconLock size={16} />}
										error={errors.confirmPassword?.message}
										size="md"
										{...register("confirmPassword")}
									/>
								</SimpleGrid>

								<Group justify="flex-end" mt="xl">
									<Button
										type="submit"
										loading={loading}
										variant="filled"
										color="primary"
										radius="md"
										className="theme-button theme-button-primary"
									>
										Save Changes
									</Button>
								</Group>
							</form>
						</FormProvider>
					</Paper>
				</Grid.Col>

				{/* Sidebar */}
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Stack gap="lg">
						{/* User Card */}
						<Paper
							withBorder
							shadow="xs"
							p="lg"
							radius="md"
							className={`${classes.card} ${classes.userCard}`}
						>
							<ThemedFlex direction="column" align="center" gap="md">
								<Avatar
									src={userData?.avatar || null}
									size={120}
									radius={120}
									className={classes.avatar}
								>
									{userInitial}
								</Avatar>
								<ThemedTitle order={3} ta="center">
									{userData?.name || "User"}
								</ThemedTitle>
								<ThemedText c="dimmed" ta="center">
									{userData?.position || "User"}
								</ThemedText>
								<ThemedText size="sm" ta="center">
									{institutionData?.name || ""}
								</ThemedText>
							</ThemedFlex>
						</Paper>

						{/* Preferences */}
						<Paper
							withBorder
							shadow="xs"
							p="lg"
							radius="md"
							className={classes.card}
						>
							<ThemedTitle order={3} mb="md">
								Preferences
							</ThemedTitle>
							<Divider mb="lg" />

							<Stack gap="md">
								<Group>
									<IconPalette size={20} />
									<ThemedText>Theme</ThemedText>
								</Group>
								<Select
									value={colorScheme}
									onChange={(value) =>
										setColorScheme(value as "light" | "dark" | "auto")
									}
									data={[
										{ value: "light", label: "Light" },
										{ value: "dark", label: "Dark" },
										{ value: "auto", label: "System" },
									]}
									size="md"
								/>
							</Stack>
						</Paper>
					</Stack>
				</Grid.Col>
			</Grid>
		</ThemedContainer>
	);
}
