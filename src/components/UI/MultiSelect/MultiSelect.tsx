'use client';
import "./MultiSelect.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface MultiSelectOption {
    label: string | number;
    value: string | number;
    type?: 'checkbox' | 'button';
    btnCallback?: () => void
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


    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const containerMouseDownHandler = () => {
            setIsExpanded(p => !p);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        // displayRef.current?.addEventListener('mousedown', containerMouseDownHandler);

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            // displayRef.current?.removeEventListener('mousedown', containerMouseDownHandler);
        };

    }, []);


    return (
        <div className={`multi-select ${isExpanded ? 'expanded' : ''} ${className}`} ref={containerRef}>
            <div className="multi-select__display" ref={displayRef} onClick={() => setIsExpanded(p => !p)}>
                <div className="multi-select__display-left">{options?.filter(o => value?.includes(o.value))?.map(o => o.label).join(', ')}</div>
                <div className="multi-select__display-right">▽</div>
            </div>
            <div className="multi-select__dropdown">{options?.map(opt => (
                <div
                    className={`multi-select__option ${(value?.includes(opt?.value)) ? 'selected' : ''} ${opt.type === 'button' ? 'button' : ''}`}
                    key={opt?.value}
                    onClick={() => opt.btnCallback?.()}
                >
                    {(opt.type !== 'button') && <input type="checkbox" checked={(value?.includes(opt?.value))} onChange={(e) => {
                        const newValue = (e.target.checked) ? (
                            (value) ? [...value, opt?.value] : [opt?.value]
                        ) : value?.filter(v => v !== opt?.value) || []

                        onSelect?.(newValue);
                    }} />}
                    <span>{opt?.label}</span>
                </div>
            ))}</div>
        </div>
    );
}