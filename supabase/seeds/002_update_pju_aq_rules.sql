-- =====================================================
-- Seed: Update PJU AQ Rules (history)
-- =====================================================
-- Objective: store AQ rules for pre-2026 and 2026+.
-- Usage: run in Supabase SQL editor.
-- =====================================================

-- Old rules: valid until 2025-12-31
INSERT INTO power_config (power_name, config_key, config_value, valid_from, valid_to)
VALUES (
  'PJU',
  'aq_rules',
  '{
    "graduacao": 0.05,
    "treinamento_coef": 0.01,
    "treinamento_max": 0.03
  }'::jsonb,
  '2025-01-01',
  '2025-12-31'
)
ON CONFLICT (power_name, config_key, valid_from) DO UPDATE
SET
  config_value = EXCLUDED.config_value,
  valid_to = EXCLUDED.valid_to;

-- New rules: valid from 2026-01-01
INSERT INTO power_config (power_name, config_key, config_value, valid_from, valid_to)
VALUES (
  'PJU',
  'aq_rules',
  '{
    "graduacao": 0.0,
    "treinamento_coef": 0.01,
    "treinamento_max": 0.03
  }'::jsonb,
  '2026-01-01',
  NULL
)
ON CONFLICT (power_name, config_key, valid_from) DO UPDATE
SET
  config_value = EXCLUDED.config_value,
  valid_to = EXCLUDED.valid_to;
