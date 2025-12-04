'use client';

import { ReactNode } from 'react';

import { twMerge } from 'tailwind-merge';



interface ButtonProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
}

export default function Button({ children, onClick, className }: ButtonProps) {
    return(
        <button
            className={twMerge(
                'px-4 py-2 bg-(--primary) text-white rounded cursor-pointer transition-colors',
                className
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}