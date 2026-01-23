/**
 * Input Component - Componente de Input Reutilizável
 * 
 * Segue o DESIGN_SYSTEM.md com estilos padronizados
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
                    w-full bg-white dark:bg-slate-800 
                    border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}
                    rounded-xl py-3 px-4 
                    text-slate-900 dark:text-white 
                    placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent 
                    transition-all
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
        </div>
    );
};
