'use client';

import { useEffect, useState } from 'react';

interface ClockDisplayProps {
    className?: string;
    updateInterval?: number;
}

export default function ClockDisplay({ className, updateInterval = 1000 }: ClockDisplayProps) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), updateInterval);
        return () => clearInterval(interval);
    }, [updateInterval]);

    const formatted = now.toLocaleString('ru-RU').replace(',', ' |');

    return <h1 className={className} suppressHydrationWarning={true}>{formatted}</h1>;
}