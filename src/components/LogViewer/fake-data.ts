import { LogEntry, LogLevel } from "@/types";

const levels: LogLevel[] = ["error", "warning", "info", "debug"];
const environments = ["local", "development", "staging", "production"];

export function getLogCounts(logs: LogEntry[]) {
	return logs.reduce(
		(acc, log) => {
			acc[log.level]++;
			return acc;
		},
		{
			error: 0,
			warning: 0,
			info: 0,
			debug: 0,
		},
	);
}
