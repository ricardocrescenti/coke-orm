-- =============================================================================
-- Query Performance Plan - indices (implementacao C)
-- -----------------------------------------------------------------------------
-- Indices para a consulta de busca de produtos (listagem com filtro em
-- relacoes OneToMany). Aplicar no banco da aplicacao.
--
-- Para tabelas muito grandes, usar `CREATE INDEX CONCURRENTLY` em producao
-- (nao e possivel dentro de transacao).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- raiz: filtro + ordenacao (evita sort externo no ORDER BY reference)
CREATE INDEX IF NOT EXISTS idx_products_root_reference
  ON products (reference) WHERE parent_id IS NULL AND status = 1;

-- raiz: ILIKE em name/reference (fase 1)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops) WHERE parent_id IS NULL AND status = 1;
CREATE INDEX IF NOT EXISTS idx_products_reference_trgm
  ON products USING gin (reference gin_trgm_ops) WHERE parent_id IS NULL AND status = 1;

-- FK das tabelas filhas (EXISTS da fase 1 e FK IN da fase 2)
CREATE INDEX IF NOT EXISTS idx_products_barcodes_product   ON products_barcodes (product_id);
CREATE INDEX IF NOT EXISTS idx_products_prices_product     ON products_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_products_suppliers_product  ON products_suppliers (product_id);
CREATE INDEX IF NOT EXISTS idx_products_images_product     ON products_images (product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product              ON stocks (product_id);
CREATE INDEX IF NOT EXISTS idx_products_units_measure_product ON products_units_measure (product_id);
CREATE INDEX IF NOT EXISTS idx_products_packaging_product  ON products_packaging (product_id);
CREATE INDEX IF NOT EXISTS idx_products_parent             ON products (parent_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_entity            ON suppliers (entity_id);
CREATE INDEX IF NOT EXISTS idx_stocks_warehouse            ON stocks (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_files_annotations_file      ON files_annotations (file_id);

-- ILIKE '%brinco%' nas tabelas pesquisadas pelos EXISTS da fase 1
CREATE INDEX IF NOT EXISTS idx_products_barcodes_barcode_trgm
  ON products_barcodes USING gin (barcode gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_suppliers_reference_trgm
  ON products_suppliers USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entities_name_trgm
  ON entities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stocks_locale_trgm
  ON stocks USING gin (locale gin_trgm_ops);