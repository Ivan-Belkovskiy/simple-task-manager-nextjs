import { useCallback } from 'react';
import { FormNotification } from './types';

export function useNotifications(
    setNotifications: React.Dispatch<React.SetStateAction<FormNotification[]>>,
) {
    const add = useCallback(() => {
        setNotifications(prev => {
            const last = prev[prev.length - 1];
            if (prev.length > 0 && (!last?.hour_offset || last.hour_offset <= 1)) return prev;
            return [...prev, {
                hour_offset: last ? last.hour_offset - 1 : 5,
                isNew: true,
                target_platforms: ['WEB'],        
                display_format: 'POPUP',  
            }];
        });
    }, [setNotifications]);

    const remove = useCallback((index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index));
    }, [setNotifications]);

    const update = useCallback((index: number, value: number) => {
        setNotifications(prev => {
            const next = [...prev];
            let val = Math.max(1, value);

            const prevNt = next[index - 1];
            if (prevNt?.hour_offset) val = Math.min(val, prevNt.hour_offset - 1);

            if (value < (prev[index]?.hour_offset ?? 0)) {
                for (let i = index + 1; i < next.length; i++) {
                    const c = prev[i - 1];
                    const n = next[i];
                    const last = prev[prev.length - 1];
                    if (
                        c?.hour_offset && n?.hour_offset &&
                        n.hour_offset >= (c.hour_offset - (i === index + 1 ? 1 : 0))
                    ) {
                        if (last?.hour_offset && last.hour_offset > 1) n.hour_offset -= 1;
                        else val = prev[index].hour_offset;
                    }
                }
            }

            next[index] = { ...next[index], hour_offset: val, isNew: true };
            return next;
        });
    }, [setNotifications]);

    return { add, remove, update };
}