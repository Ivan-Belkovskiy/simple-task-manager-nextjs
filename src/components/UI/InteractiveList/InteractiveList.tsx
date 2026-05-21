'use client';
import "./InteractiveList.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface InteractiveListOption {
    label: string | number;
    value: string | number;
    type?: 'checkbox' | 'button';
    btnCallback?: () => void
    // selected?: boolean;
}

export default function InteractiveList({
    className,
    value,
    onSelect,
    options
}: {
    className?: string;
    value?: (string | number)[];
    onSelect?: (newValue: (string | number)[]) => any;
    options?: InteractiveListOption[];
}) {
    return (
        <div className={`interactive-list ${className}`}>{options?.map(opt => (
            <div
                className={`interactive-list__option ${(value?.includes(opt?.value)) ? 'selected' : ''} ${opt.type === 'button' ? 'button' : ''}`}
                key={opt?.value}
                onClick={() => {
                    if (opt.type === 'button') opt.btnCallback?.();
                    else {
                        const newValue = ( !value?.includes(opt.value) ) ? (
                            (value) ? [...value, opt?.value] : [opt?.value]
                        ) : value?.filter(v => v !== opt?.value) || []

                        onSelect?.(newValue);
                    }
                }}
            >
                {(opt.type !== 'button') && <input type="checkbox" checked={(value?.includes(opt?.value))} onChange={(e) => {
                    // const newValue = (e.target.checked) ? (
                    //     (value) ? [...value, opt?.value] : [opt?.value]
                    // ) : value?.filter(v => v !== opt?.value) || []

                    // onSelect?.(newValue);
                }} />}
                <span>{opt?.label}</span>
            </div>
        ))}</div>
    );
}