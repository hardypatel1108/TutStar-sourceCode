import { useEffect, useState } from 'react';
import { AlarmClock, BookOpenText, NotebookPen } from 'lucide-react';
export function ClassCountdown({ classDate }: { classDate: string }) {
    const [time, setTime] = useState(() => getRemainingTime(classDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getRemainingTime(classDate));
        }, 1000);

        return () => clearInterval(interval);
    }, [classDate]);

    // ❌ More than 20 minutes remaining → show nothing
    if (!time.shouldShow) {
        return null;
    }

    // ✅ Class started
    if (time.isStarted) {
        return <span className="text-xs text-green-600">⏱ Started</span>;
    }

    // ✅ Last 20 minutes countdown
    return (
        <span className="text-xs flex gap-1 items-center text-orange-500">
            <AlarmClock /><p className='text-base font-semibold'> {time.minutes}:{time.seconds.toString().padStart(2, '0')}</p>
        </span>
    );
}

function getRemainingTime(classDate: string) {
    const now = new Date();
    const classTime = new Date(classDate);

    const diffMs = classTime.getTime() - now.getTime();

    if (diffMs <= 0) {
        return {
            minutes: 0,
            seconds: 0,
            isStarted: true,
            shouldShow: true,
        };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        minutes,
        seconds,
        isStarted: false,
        shouldShow: minutes <= 20, // 👈 KEY LOGIC
    };
}