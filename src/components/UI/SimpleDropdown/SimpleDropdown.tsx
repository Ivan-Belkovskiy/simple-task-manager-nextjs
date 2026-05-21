import "./SimpleDropdown.css";
import { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from "react";

interface SimpleDropdownOption {
    label: string | number;
    value: string | number;
    // type?: 'checkbox' | 'button';
    btnCallback?: () => void
    // selected?: boolean;
}

interface SimpleDropdownAutomaticOptions {
    container?: RefObject<HTMLElement | null>;
}

export default function SimpleDropdown({
    children,
    buttonLabel,
    className,
    styles,
    position
    // options
}: {
    children?: ReactNode,
    buttonLabel?: string;
    className?: string;
    styles?: {
        main?: CSSProperties;
        button?: CSSProperties;
        dropdown?: CSSProperties;
    };
    position?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
        automatic?: {
            horizontal?: SimpleDropdownAutomaticOptions;
            vertical?: SimpleDropdownAutomaticOptions;
        }
    };
    // options?: SimpleDropdownOption[];
}) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [buttonHeight, setButtonHeight] = useState(0);


    const containerRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // buttonRef.current?.addEventListener('resize', () => {
        //     const rect = buttonRef.current?.getBoundingClientRect();

        //     setButtonHeight(rect?.height)
        // });



        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);

    // const getButtonHeight = async () => {

    // }



    const [dropdownRect, setDropdownRect] = useState<DOMRect | undefined>(dropdownRef.current?.getBoundingClientRect());

    useEffect(() => {

        setDropdownRect(
            dropdownRef.current?.getBoundingClientRect()
        );
        
        // alert?.(((dropdownRect?.top || 0) + (dropdownRect?.height || 0)));

        // alert?.(position?.automatic?.vertical?.container?.current?.getBoundingClientRect().height);
    }, [isExpanded]);

    const dropdownStyles = {
        top: ((
            (position?.automatic?.vertical?.container?.current) && (
                ((dropdownRect?.top || 0) + (dropdownRect?.height || 0))
                <
                (position.automatic.vertical.container.current.getBoundingClientRect().height / 1)
            )
        ) || position?.top !== undefined) ? `${(position?.top || 0) + (
            buttonRef.current?.getBoundingClientRect()?.height || 0
        )}px` : styles?.dropdown?.top || 'auto',

        right: (position?.right !== undefined) ? `${position.right}px` : styles?.dropdown?.right || 'auto',

        bottom: ((
            (position?.automatic?.vertical?.container?.current) && (
                ((dropdownRect?.top || 0) + (dropdownRect?.height || 0))
                >
                (position.automatic.vertical.container.current.getBoundingClientRect().height / 1)
            )
        ) || position?.bottom !== undefined) ? `${((position?.bottom || 0) + (
            buttonRef.current?.getBoundingClientRect()?.height || 0
        ))}px` : styles?.dropdown?.bottom || 'auto',

        left: (position?.left !== undefined) ? `${position.left}px` : styles?.dropdown?.left || 'auto',
    };

    return (
        <div className={`simple-dropdown ${className} ${isExpanded ? 'expanded' : ''}`} ref={containerRef} style={styles?.main}>
            <button ref={buttonRef} className="simple-dropdown__button" onClick={() => setIsExpanded(p => !p)} style={styles?.button}>{buttonLabel}</button>
            <div ref={dropdownRef} className={`simple-dropdown__dropdown ${isExpanded ? 'expanded' : ''}`} style={{
                ...styles?.dropdown,
                ...dropdownStyles,
            }}>
                {children}
            </div>
        </div>
    )
}