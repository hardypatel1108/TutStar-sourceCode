export const TIME_SLOT_OPTIONS = [
    { id: 'morning', label: '05:00 AM - 12:00 PM' },
    { id: 'afternoon', label: '12:00 PM - 04:00 PM' },
    { id: 'slot_4_6_pm', label: '04:00 PM - 06:00 PM' },
    { id: 'evening', label: '06:00 PM - 09:00 PM' },
    { id: 'night', label: '09:00 PM - 05:00 AM' },
] as const;

const TIME_SLOT_LABEL_MAP = Object.fromEntries(TIME_SLOT_OPTIONS.map((item) => [item.id, item.label])) as Record<string, string>;
const SLOT_TIME_MAP: Record<string, { from: string; to: string }> = {
    morning: { from: '05:00', to: '12:00' },
    afternoon: { from: '12:00', to: '16:00' },
    slot_4_6_pm: { from: '16:00', to: '18:00' },
    evening: { from: '18:00', to: '21:00' },
    night: { from: '21:00', to: '05:00' },
};

function to12HourLabel(time: string): string {
    const [hourRaw, minuteRaw] = time.split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);

    if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function parseRange(value?: string | null): { from: string; to: string } | null {
    if (!value || !value.includes('-')) return null;

    const [from, to] = value.split('-', 2);
    if (!/^\d{2}:\d{2}$/.test(from) || !/^\d{2}:\d{2}$/.test(to)) return null;

    return { from, to };
}

export function formatTimeSlot(slot?: string | null, fallback = '-'): string {
    if (!slot) return fallback;
    const mapped = TIME_SLOT_LABEL_MAP[slot];
    if (mapped) return mapped;

    const parsed = parseRange(slot);
    if (parsed) {
        return `${to12HourLabel(parsed.from)} - ${to12HourLabel(parsed.to)}`;
    }

    return slot;
}

export function getTimeSlotStyle(slot?: string) {
    const explicitMap: Record<string, { label: string; className: string }> = {
        morning: { label: '05:00 AM - 12:00 PM', className: 'border-emerald-300 bg-emerald-100 text-emerald-900' },
        afternoon: { label: '12:00 PM - 04:00 PM', className: 'border-sky-300 bg-sky-100 text-sky-900' },
        slot_4_6_pm: { label: '04:00 PM - 06:00 PM', className: 'border-amber-300 bg-amber-100 text-amber-900' },
        evening: { label: '06:00 PM - 09:00 PM', className: 'border-violet-300 bg-violet-100 text-violet-900' },
        night: { label: '09:00 PM - 05:00 AM', className: 'border-slate-300 bg-slate-100 text-slate-900' },
    };

    if (slot && explicitMap[slot]) return explicitMap[slot];

    const parsed = parseRange(slot);
    if (!parsed) {
        return {
            label: formatTimeSlot(slot),
            className: 'border-zinc-300 bg-zinc-100 text-zinc-900',
        };
    }

    const fromHour = Number(parsed.from.split(':')[0]);
    if (Number.isNaN(fromHour)) {
        return {
            label: formatTimeSlot(slot),
            className: 'border-zinc-300 bg-zinc-100 text-zinc-900',
        };
    }

    if (fromHour >= 5 && fromHour < 12) {
        return { label: formatTimeSlot(slot), className: 'border-emerald-300 bg-emerald-100 text-emerald-900' };
    }
    if (fromHour >= 12 && fromHour < 16) {
        return { label: formatTimeSlot(slot), className: 'border-sky-300 bg-sky-100 text-sky-900' };
    }
    if (fromHour >= 16 && fromHour < 18) {
        return { label: formatTimeSlot(slot), className: 'border-amber-300 bg-amber-100 text-amber-900' };
    }
    if (fromHour >= 18 && fromHour < 21) {
        return { label: formatTimeSlot(slot), className: 'border-violet-300 bg-violet-100 text-violet-900' };
    }

    return { label: formatTimeSlot(slot), className: 'border-slate-300 bg-slate-100 text-slate-900' };
}

export function getTimeRangeForSlot(slot?: string | null): { from: string; to: string } | null {
    if (!slot) return null;
    return SLOT_TIME_MAP[slot] ?? parseRange(slot);
}

export function resolveTimeSlotFromRange(from?: string | null, to?: string | null): string | null {
    if (!from || !to) return null;
    const entry = Object.entries(SLOT_TIME_MAP).find(([, value]) => value.from === from && value.to === to);
    return entry ? entry[0] : `${from}-${to}`;
}
