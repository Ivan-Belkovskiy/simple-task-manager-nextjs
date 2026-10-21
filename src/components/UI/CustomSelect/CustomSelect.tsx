'use client';
import "./CustomSelect.css";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface CustomSelectOption {
    label: string | number;
    value: string | number;
    type?: 'option' | 'button';
    btnCallback?: () => void;

    innerOptions?: CustomSelectOption[];
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

    const renderOptions = (options?: CustomSelectOption[], level: number = 0): ReactNode => {
        if (level > 30 || !options) return null;

        return options?.map(opt => (
            <>
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
                    style={{ paddingLeft: `${7 + (level * 10)}px` }}
                >
                    {/* {(opt.type !== 'button') && <input type="checkbox" checked={(value?.includes(opt?.value))} onChange={(e) => {
                        const newValue = (e.target.checked) ? (
                            (value) ? [...value, opt?.value] : [opt?.value]
                        ) : value?.filter(v => v !== opt?.value) || []

                        onSelect?.(newValue);
                    }} />} */}
                    <span>{opt?.label}</span>
                </div>
                {(opt.innerOptions) && renderOptions(opt.innerOptions, (level + 1))}
            </>
        ))
    }

    const displayCurrentValue = (options?: CustomSelectOption[]): string => {
        if (!options || value === undefined) return '';

        const findPath = (
            opts: CustomSelectOption[],
            currentPath: string[]
        ): string[] | null => {
            for (const opt of opts) {
                const newPath = [...currentPath, String(opt.label)];

                if (opt.value === value) {
                    return newPath;
                }

                if (opt.innerOptions) {
                    const subPath = findPath(opt.innerOptions, newPath);
                    if (subPath) return subPath;
                }
            }
            return null;
        };

        const path = findPath(options, []);
        return path ? path.join(' >> ') : '';
    };



    return (
        <>
            <div className={`custom-select ${isExpanded ? 'expanded' : ''} ${className}`} ref={containerRef}>
                <div className="custom-select__display" ref={displayRef} onClick={() => setIsExpanded(p => !p)}>
                    <div className="custom-select__display-left">{displayCurrentValue(options)}</div>
                    <div className="custom-select__display-right">▽</div>
                </div>
                <div className="custom-select__dropdown --desktop-only">{renderOptions(options, 0)}</div>

                <div className="custom-select__mobile-dropdown-modal --mobile-only" onClick={(e) => {
                    if (!e.currentTarget.closest('.custom-select.--mobile-only')) {
                        setIsExpanded(false)
                    }
                }}>
                    <div className={`custom-select --mobile-only ${isExpanded ? 'expanded' : ''}`}>
                        {isExpanded && <h1>Выберите значение</h1>}
                        <div className="custom-select__dropdown">{renderOptions(options, 0)}</div>
                    </div>
                </div>
            </div>
        </>
    );
}