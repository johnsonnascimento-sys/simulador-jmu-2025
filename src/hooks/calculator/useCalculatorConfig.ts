/**
 * Hook de Configuração e Carregamento - Calculadora
 * 
 * Responsável por:
 * - Carregamento de agência (agency) do Supabase
 * - Instanciação do service apropriado (JmuService, etc)
 * - Carregamento de configuração do tribunal (courtConfig)
 * - Estados de loading
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourtConfig } from '../../types';
import { getCourtBySlug } from '../../services/courtService';
import { configService } from '../../services/config';
import { mapEffectiveConfigToCourtConfig } from '../../services/config/mapEffectiveConfig';
import { supabase } from '../../lib/supabase';
import { JmuService } from '../../services/agency/implementations/JmuService';

export const useCalculatorConfig = (slug: string | undefined) => {
    const navigate = useNavigate();

    // Agency State
    const [agency, setAgency] = useState<{ name: string, type: string } | null>(null);
    const [agencyService, setAgencyService] = useState<JmuService | null>(null);
    const [loadingAgency, setLoadingAgency] = useState(true);

    // Court Config State
    const [courtConfig, setCourtConfig] = useState<CourtConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [configError, setConfigError] = useState<string | null>(null);

    // Load Agency
    useEffect(() => {
        const loadAgency = async () => {
            setLoadingAgency(true);
            try {
                if (!slug) {
                    navigate('/');
                    return;
                }

                const { data, error } = await supabase
                    .from('agencies')
                    .select('name, type, slug')
                    .eq('slug', slug)
                    .single();

                if (error || !data) {
                    console.error("Agency not found:", slug);
                    return;
                }

                setAgency(data);

                // Instantiate Service
                if (data.slug === 'stm' || data.slug === 'jmu' || data.slug === 'pju') {
                    setAgencyService(new JmuService());
                } else {
                    console.warn("Service not implemented for slug:", slug);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoadingAgency(false);
            }
        };

        loadAgency();
    }, [slug, navigate]);

    // Load Court Config
    useEffect(() => {
        async function fetchConfig() {
            try {
                if (slug) {
                    const effectiveConfig = await configService.getEffectiveConfig(slug);
                    setCourtConfig(mapEffectiveConfigToCourtConfig(effectiveConfig));
                    setConfigError(null);
                }
            } catch (err) {
                console.error("Failed to load config from ConfigService", err);
                try {
                    const court = slug ? await getCourtBySlug(slug) : null;
                    if (court) {
                        setCourtConfig(court.config);
                        setConfigError(null);
                        return;
                    }
                } catch (fallbackErr) {
                    console.error("Failed to load config from courts table", fallbackErr);
                }
                setConfigError('Configuração não encontrada.');
            } finally {
                setLoadingConfig(false);
            }
        }
        fetchConfig();
    }, [slug]);

    return {
        agency,
        agencyService,
        loadingAgency,
        courtConfig,
        loadingConfig,
        configError
    };
};
