import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface VersionInfo {
    version: string;
    commit: string;
    commitFull: string;
    branch: string;
    isDirty: boolean;
    buildDate: string;
    buildTimestamp: number;
}

/**
 * Badge discreto que mostra informações de versão da aplicação
 *
 * Lê do arquivo /version.json gerado no build e exibe:
 * - Versão (do package.json)
 * - Hash do commit (7 caracteres)
 * - Data do build
 *
 * Uso: <VersionBadge />
 */
export const VersionBadge: React.FC = () => {
    const [version, setVersion] = useState<VersionInfo | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Buscar version.json
        fetch('/version.json')
            .then(res => res.json())
            .then(data => setVersion(data))
            .catch(err => {
                console.warn('Failed to load version info:', err);
                // Fallback para desenvolvimento
                setVersion({
                    version: 'dev',
                    commit: 'local',
                    commitFull: 'local',
                    branch: 'dev',
                    isDirty: false,
                    buildDate: new Date().toISOString(),
                    buildTimestamp: Date.now(),
                });
            });
    }, []);

    if (!version) return null;

    const formatBuildDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Badge compacto */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono cursor-help">
                <Info size={12} className="opacity-50" />
                <span>
                    v{version.version} • {version.commit}
                    {version.isDirty && <span className="text-amber-500">*</span>}
                </span>
            </div>

            {/* Tooltip expandido */}
            {isExpanded && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg border border-slate-700 z-[60] min-w-[240px]">
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Versão:</span>
                            <span className="font-semibold">{version.version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Commit:</span>
                            <span className="font-mono text-xs">{version.commit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Branch:</span>
                            <span className="font-mono text-xs">{version.branch}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Build:</span>
                            <span className="text-xs">{formatBuildDate(version.buildDate)}</span>
                        </div>
                        {version.isDirty && (
                            <div className="text-amber-400 text-[10px] mt-2 pt-2 border-t border-slate-700">
                                * Uncommitted changes
                            </div>
                        )}
                    </div>

                    {/* Seta do tooltip */}
                    <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-slate-800 dark:bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};
