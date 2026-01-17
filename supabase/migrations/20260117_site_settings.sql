-- Script SQL para criar a tabela site_settings no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir valor inicial da chave Pix
INSERT INTO site_settings (key, value) 
VALUES ('pix_key', 'seu-pix-aqui@email.com')
ON CONFLICT (key) DO NOTHING;

-- Permitir leitura pública (para a página de doação)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
