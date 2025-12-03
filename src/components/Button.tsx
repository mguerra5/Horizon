'use client';

import { ReactNode, CSSProperties } from 'react';



interface ButtonProps {
    children: ReactNode;
    onClick: () => void;
    style?: CSSProperties;
}

export default function Button({ children, onClick, style }: ButtonProps) {
    const defaultStyle: CSSProperties = {
        padding: '8px 16px',
        backgroundColor: '#ff794d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return(
        <button
            style={{ ...defaultStyle, ...style }}
            onClick={onClick}
        >
            {children}
        </button>
    );
}