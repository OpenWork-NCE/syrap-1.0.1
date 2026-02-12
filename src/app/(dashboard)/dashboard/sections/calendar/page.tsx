"use client";

import { Container, Stack } from "@mantine/core";
import PageHeader from "@/components/PageHeader/PageHeader";
import { CalendarPage } from "@/components/Calendar";

const items = [{ title: "Calendrier", href: "#" }];

export default function CalendarRoute() {
	return (
		<>
			<>
				<title>Calendrier | IPES-SCpro</title>
				<meta name="description" content="" />
			</>
			<Container fluid>
				<Stack gap="lg">
					<PageHeader
						title="Calendrier"
						breadcrumbItems={items}
					/>
					<CalendarPage />
				</Stack>
			</Container>
		</>
	);
}
