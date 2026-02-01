// Types pour le calendrier académique SYRAP

export type EventType = 'academic' | 'deadline' | 'meeting' | 'holiday' | 'validation' | 'exam';

export type EventSource = 'MINESUP' | 'CENADI' | 'University' | 'IPES';

export type EventVisibility = 'all' | 'minesup' | 'cenadi' | 'university' | 'ipes';

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	start_date: string;
	end_date?: string;
	all_day: boolean;
	type: EventType;
	color: string;
	source: EventSource;
	source_name?: string; // Nom de l'institution source
	source_id?: string;
	visibility: EventVisibility[];
	recurrence: 'none' | 'yearly';
	reminder_days?: number;
	created_by: {
		id: string;
		name: string;
	};
	created_at: string;
	updated_at?: string;
}

export interface CalendarEventFormData {
	title: string;
	description?: string;
	start_date: Date | null;
	end_date?: Date | null;
	all_day: boolean;
	type: EventType;
	visibility: EventVisibility[];
	recurrence: 'none' | 'yearly';
	reminder_days?: number;
}

export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
	{ value: 'academic', label: 'Académique', color: 'blue' },
	{ value: 'deadline', label: 'Échéance', color: 'red' },
	{ value: 'meeting', label: 'Réunion', color: 'violet' },
	{ value: 'exam', label: 'Examen', color: 'orange' },
	{ value: 'validation', label: 'Validation', color: 'green' },
	{ value: 'holiday', label: 'Congé', color: 'teal' },
];

export const EVENT_VISIBILITY: { value: EventVisibility; label: string }[] = [
	{ value: 'all', label: 'Tous les acteurs' },
	{ value: 'minesup', label: 'MINESUP seulement' },
	{ value: 'cenadi', label: 'CENADI seulement' },
	{ value: 'university', label: 'Universités' },
	{ value: 'ipes', label: 'IPES' },
];

export const getEventTypeColor = (type: EventType): string => {
	return EVENT_TYPES.find((t) => t.value === type)?.color || 'gray';
};

export const getEventTypeLabel = (type: EventType): string => {
	return EVENT_TYPES.find((t) => t.value === type)?.label || 'Événement';
};
