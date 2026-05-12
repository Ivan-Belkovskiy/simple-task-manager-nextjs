'use client';
import "./MultiSelect.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface MultiSelectOption {
    label: string | number;
    value: string | number;
    // selected?: boolean;
}

export default function MultiSelect({
    className,
    value,
    onSelect,
    options
}: {
    className?: string;
    value?: (string | number)[];
    onSelect?: (newValue: (string | number)[]) => any;
    options?: MultiSelectOption[];
}) {

    const [isExpanded, setIsExpanded] = useState(false);
    const displayRef = useRef<HTMLDivElement | null>(null);

    const containerMouseDownHandler = useCallback(() => {
        setIsExpanded(p => !p);
        // containerRef.current?.removeEventListener('mousedown', containerMouseDownHandler);
    }, []);

    const windowMouseDownHandler = useCallback(() => {
         setIsExpanded(false);
        // alert('window click')
        // window.removeEventListener('mousedown', windowMouseDownHandler);
    }, []);

    useEffect(() => {
        displayRef.current?.addEventListener('mousedown', containerMouseDownHandler);
        // window.addEventListener('mousedown', windowMouseDownHandler);
        return () => {
            displayRef.current?.removeEventListener('mousedown', containerMouseDownHandler);
            // window.removeEventListener('mousedown', windowMouseDownHandler);
        }
    }, []);


    return (
        <div className={`multi-select ${className} ${isExpanded ? 'expanded' : ''}`}>
            <div className="multi-select__display" ref={displayRef}>
                <div className="multi-select__display-left">{options?.filter(o => value?.includes(o.value))?.map(o => o.label).join(', ')}</div>
                <div className="multi-select__display-right">▽</div>
            </div>
            <div className="multi-select__dropdown">{options?.map(opt => (
                <div className={`multi-select__option ${(value?.includes(opt.value)) ? 'selected' : ''}`} key={opt.value}>
                    <input type="checkbox" checked={(value?.includes(opt.value))} onChange={(e) => {
                        const newValue = (e.target.checked) ? (
                            (value) ? [...value, opt.value] : [opt.value]
                        ) : value?.filter(v => v !== opt.value) || []

                        onSelect?.(newValue);
                    }} />
                    <span>{opt.label}</span>
                </div>
            ))}</div>
        </div>
    );
}