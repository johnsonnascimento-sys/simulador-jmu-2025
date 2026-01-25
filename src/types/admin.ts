export type JsonObject = Record<string, unknown>;

export interface GlobalConfig {
  id: string;
  config_key: string;
  config_value: JsonObject;
  valid_from: string;
  valid_to: string | null;
}

export interface PowerConfig {
  id: string;
  power_name: string;
  config_key: string;
  config_value: JsonObject;
  valid_from: string;
  valid_to: string | null;
}

export interface OrgConfig {
  id: string;
  org_slug: string;
  org_name: string;
  power_name: string;
  configuration: JsonObject;
}

export type CreateGlobalConfigDTO = Omit<GlobalConfig, 'id'>;
export type UpdateGlobalConfigDTO = Partial<CreateGlobalConfigDTO> & { id: string };
export type UpsertGlobalConfigDTO = Omit<GlobalConfig, 'id'> & { id?: string };

export type CreatePowerConfigDTO = Omit<PowerConfig, 'id'>;
export type UpdatePowerConfigDTO = Partial<CreatePowerConfigDTO> & { id: string };
export type UpsertPowerConfigDTO = Omit<PowerConfig, 'id'> & { id?: string };

export type CreateOrgConfigDTO = Omit<OrgConfig, 'id'>;
export type UpdateOrgConfigDTO = Partial<CreateOrgConfigDTO> & { id: string };
export type UpsertOrgConfigDTO = Omit<OrgConfig, 'id'> & { id?: string };
