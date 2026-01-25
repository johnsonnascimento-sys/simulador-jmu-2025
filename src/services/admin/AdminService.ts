import { supabase } from '../../lib/supabase';
import {
  GlobalConfig,
  OrgConfig,
  PowerConfig,
  UpsertGlobalConfigDTO,
  UpsertOrgConfigDTO,
  UpsertPowerConfigDTO,
  JsonObject,
} from '../../types/admin';

const isPlainObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const parseJsonIfString = (value: unknown, fieldName: string): JsonObject => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (!isPlainObject(parsed)) {
        throw new Error(`${fieldName} deve ser um objeto JSON.`);
      }
      return parsed;
    } catch (err) {
      throw new Error(`${fieldName} invalido: ${(err as Error).message}`);
    }
  }

  if (!isPlainObject(value)) {
    throw new Error(`${fieldName} deve ser um objeto JSON.`);
  }

  return value;
};

const sanitizePayload = <T extends Record<string, unknown>>(payload: T) => {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;
};

export class AdminService {
  static async listGlobalConfigs(): Promise<GlobalConfig[]> {
    const { data, error } = await supabase
      .from('global_config')
      .select('*')
      .order('valid_from', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as GlobalConfig[];
  }

  static async getGlobalConfigById(id: string): Promise<GlobalConfig | null> {
    const { data, error } = await supabase
      .from('global_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return data as GlobalConfig;
  }

  static async upsertGlobalConfig(payload: UpsertGlobalConfigDTO): Promise<GlobalConfig> {
    const configValue = parseJsonIfString(payload.config_value, 'config_value');
    const sanitized = sanitizePayload({ ...payload, config_value: configValue });

    const { data, error } = await supabase
      .from('global_config')
      .upsert(sanitized)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as GlobalConfig;
  }

  static async listPowerConfigs(): Promise<PowerConfig[]> {
    const { data, error } = await supabase
      .from('power_config')
      .select('*')
      .order('power_name', { ascending: true })
      .order('valid_from', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as PowerConfig[];
  }

  static async upsertPowerConfig(payload: UpsertPowerConfigDTO): Promise<PowerConfig> {
    const configValue = parseJsonIfString(payload.config_value, 'config_value');
    const sanitized = sanitizePayload({ ...payload, config_value: configValue });

    const { data, error } = await supabase
      .from('power_config')
      .upsert(sanitized)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as PowerConfig;
  }

  static async listOrgConfigs(): Promise<OrgConfig[]> {
    const { data, error } = await supabase
      .from('org_config')
      .select('*')
      .order('org_slug', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as OrgConfig[];
  }

  static async upsertOrgConfig(payload: UpsertOrgConfigDTO): Promise<OrgConfig> {
    const configValue = parseJsonIfString(payload.configuration, 'configuration');
    const sanitized = sanitizePayload({ ...payload, configuration: configValue });

    const { data, error } = await supabase
      .from('org_config')
      .upsert(sanitized)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as OrgConfig;
  }
}
