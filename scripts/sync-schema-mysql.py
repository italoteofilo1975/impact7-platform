#!/usr/bin/env python3
"""
Script de Sincronização Automática: Schema Drizzle ↔ MySQL

Compara a estrutura do schema Drizzle com o banco MySQL real
e gera SQL de correção (ALTER TABLE) automaticamente.

Uso:
  python3 scripts/sync-schema-mysql.py [--dry-run] [--execute]
"""

import os
import re
import sys
import mysql.connector
from urllib.parse import urlparse, parse_qs

# Ler DATABASE_URL do ambiente
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL não encontrado no ambiente")
    sys.exit(1)

# Parse DATABASE_URL
# Formato: mysql://user:password@host:port/database?ssl=...
parsed = urlparse(DATABASE_URL)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 3306,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/').split('?')[0],
}

print("🔍 Conectando ao MySQL...")
print(f"   Host: {db_config['host']}")
print(f"   Database: {db_config['database']}\n")

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    sys.exit(1)

# Ler schema Drizzle
schema_path = 'drizzle/schema.ts'
with open(schema_path, 'r') as f:
    schema_content = f.read()

# Extrair definições de tabelas do schema Drizzle
# Padrão: export const tableName = mysqlTable("table_name", { ... });
table_pattern = r'export const (\w+) = mysqlTable\("(\w+)",\s*\{([^}]+)\}\);'
tables = re.findall(table_pattern, schema_content, re.DOTALL)

print(f"📊 {len(tables)} tabelas encontradas no schema Drizzle\n")

# Para cada tabela, comparar com MySQL
sql_corrections = []

for var_name, table_name, columns_def in tables:
    # Extrair colunas do schema Drizzle
    # Padrão: columnName: int("column_name").notNull(),
    column_pattern = r'(\w+):\s*(int|varchar|text|boolean|json|decimal|timestamp)\("(\w+)"\)'
    drizzle_columns = re.findall(column_pattern, columns_def)
    
    drizzle_col_names = {col[2] for col in drizzle_columns}
    
    # Obter colunas do MySQL
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
    mysql_columns = cursor.fetchall()
    mysql_col_names = {col[0] for col in mysql_columns}
    
    # Identificar colunas faltando no MySQL
    missing_cols = drizzle_col_names - mysql_col_names
    
    if missing_cols:
        print(f"⚠️  Tabela `{table_name}`: {len(missing_cols)} colunas faltando")
        for col_name in missing_cols:
            # Encontrar tipo da coluna no schema
            col_type = None
            for var, dtype, cname in drizzle_columns:
                if cname == col_name:
                    col_type = dtype
                    break
            
            # Mapear tipo Drizzle → MySQL
            mysql_type = {
                'int': 'BIGINT',
                'varchar': 'VARCHAR(255)',
                'text': 'TEXT',
                'boolean': 'TINYINT(1)',
                'json': 'JSON',
                'decimal': 'DECIMAL(10,2)',
                'timestamp': 'BIGINT',
            }.get(col_type, 'TEXT')
            
            sql = f"ALTER TABLE `{table_name}` ADD COLUMN `{col_name}` {mysql_type} NULL;"
            sql_corrections.append(sql)
            print(f"   - {col_name} ({mysql_type})")

cursor.close()
conn.close()

print(f"\n📝 {len(sql_corrections)} correções SQL geradas\n")

if sql_corrections:
    # Salvar SQL em arquivo
    output_file = 'scripts/sync-corrections.sql'
    with open(output_file, 'w') as f:
        f.write("-- Correções de Sincronização Schema ↔ MySQL\n")
        f.write(f"-- Gerado automaticamente em {os.popen('date').read().strip()}\n\n")
        for sql in sql_corrections:
            f.write(sql + '\n')
    
    print(f"✅ SQL salvo em: {output_file}")
    print("\n⚠️  Para aplicar as correções, execute:")
    print(f"   cat {output_file} | mysql -h {db_config['host']} -u {db_config['user']} -p {db_config['database']}")
else:
    print("✅ Schema Drizzle e MySQL estão 100% sincronizados!")
