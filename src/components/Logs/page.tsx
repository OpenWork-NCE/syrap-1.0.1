import React, { useState, useEffect } from "react";
import {
	MantineProvider,
	AppShell,
	Table,
	Text,
	ScrollArea,
	Group,
	Button,
	Loader,
	Container,
	Badge,
	ActionIcon,
	Paper,
	Box,
	Flex,
} from "@mantine/core";
import { LogViewer } from "@/components/LogViewer/LogViewer";

function Logs() {
	return (
		<Flex style={{ maxHeight: "80vh", width: "100%" }}>
			<ScrollArea
				style={{
					flex: "1",
					border: "1px solid #e0e0e0",
					borderRadius: "8px",
				}}
			>
				<Paper p={"sm"}>
					<LogViewer />
				</Paper>
			</ScrollArea>
		</Flex>
	);
}

export default Logs;
