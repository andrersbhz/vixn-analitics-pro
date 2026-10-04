Use a reference-capable image provider whenever a creative request includes uploaded product photos; text-only generation cannot preserve the supplied product.
- Catalog (products, catalog_plans) lives in the database and is read via src/hooks/use-catalog.ts; Landing falls back to static plans when the table is empty — keeps the home editable from the dashboard.
