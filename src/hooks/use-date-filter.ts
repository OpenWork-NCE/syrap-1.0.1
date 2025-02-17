"use client";

import { useEffect, useState } from "react";

interface DateFilterResult {
	startDate: Date;
	endDate: Date;
}

export function useDateFilter(
	period: string,
	customRange?: [Date | null, Date | null],
): DateFilterResult {
	const [dateRange, setDateRange] = useState<DateFilterResult>({
		startDate: new Date(),
		endDate: new Date(),
	});

	useEffect(() => {
		const end = new Date();
		const start = new Date();

		if (customRange && customRange[0] && customRange[1]) {
			return setDateRange({
				startDate: customRange[0],
				endDate: customRange[1],
			});
		}

		switch (period) {
			case "7d":
				start.setDate(end.getDate() - 7);
				break;
			case "1m":
				start.setMonth(end.getMonth() - 1);
				break;
			case "3m":
				start.setMonth(end.getMonth() - 3);
				break;
			case "1y":
				start.setFullYear(end.getFullYear() - 1);
				break;
			default:
				start.setDate(end.getDate() - 7);
		}

		setDateRange({ startDate: start, endDate: end });
	}, [period, customRange]);

	return dateRange;
}
