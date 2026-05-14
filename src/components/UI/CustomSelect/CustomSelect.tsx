'use client';
import "./CustomSelect.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface CustomSelectOption {
    label: string | number;
    value: string | number;
    type?: 'option' | 'button';
    btnCallback?: () => void;
}

export default function CustomSelect({
    className,
    value,
    onSelect,
    options
}: {
    className?: string;
    value?: (string | number);
    onSelect?: (newValue: (string | number)) => any;
    options?: CustomSelectOption[];
}) {

    const [isExpanded, setIsExpanded] = useState(false);
    const displayRef = useRef<HTMLDivElement | null>(null);


    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);


    return (
        <div className={`custom-select ${isExpanded ? 'expanded' : ''} ${className}`} ref={containerRef}>
            <div className="custom-select__display" ref={displayRef} onClick={() => setIsExpanded(p => !p)}>
                <div className="custom-select__display-left">{options?.find(o => o.value === value)?.label}</div>
                <div className="custom-select__display-right">▽</div>
            </div>
            <div className="custom-select__dropdown">{options?.map(opt => (
                <div
                    className={`custom-select__option ${(opt.value === value) ? 'selected' : ''} ${opt.type === 'button' ? 'button' : ''}`}
                    key={opt?.value}
                    onClick={() => {
                        if (opt.type === 'button') {
                            opt.btnCallback?.();
                        } else {
                            onSelect?.(opt.value);
                        }
                        setIsExpanded(false);
                    }}
                >
                    {/* {(opt.type !== 'button') && <input type="checkbox" checked={(value?.includes(opt?.value))} onChange={(e) => {
                        const newValue = (e.target.checked) ? (
                            (value) ? [...value, opt?.value] : [opt?.value]
                        ) : value?.filter(v => v !== opt?.value) || []

                        onSelect?.(newValue);
                    }} />} */}
                    <span>{opt?.label}</span>
                </div>
            ))}</div>
        </div>
    );
}