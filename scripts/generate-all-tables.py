#!/usr/bin/env python3
"""
Script para gerar SQL de criação de todas as tabelas do schema Drizzle.
Converte tipos TypeScript/Drizzle para MySQL com regras específicas:
- text() com .default() → VARCHAR(255)
- text() sem .default() → TEXT
- int() → INT ou BIGINT (para timestamps)
- varchar() → VARCHAR(n)
"""

import re
import sys

# Mapeamento de tipos Drizzle → MySQL
TYPE_MAP = {
    'int': 'INT',
    'varchar': 'VARCHAR',
    'text': 'TEXT',
}

def parse_drizzle_column(line):
    """
    Extrai informações de uma coluna Drizzle.
    Exemplo: email: varchar("email", { length: 320 }).notNull().unique(),
    """
    # Extrair nome da coluna
    col_match = re.match(r'\s*(\w+):\s*(\w+)\("(\w+)"', line)
    if not col_match:
        return None
    
    col_name = col_match.group(1)
    drizzle_type = col_match.group(2)
    sql_name = col_match.group(3)
    
    # Extrair length para VARCHAR
    length_match = re.search(r'length:\s*(\d+)', line)
    length = length_match.group(1) if length_match else None
    
    # Detectar flags
    not_null = '.notNull()' in line
    unique = '.unique()' in line
    primary_key = '.primaryKey()' in line
    auto_increment = 'autoIncrement: true' in line
    
    # Detectar default value
    default_match = re.search(r'\.default\(["\']?([^)"\']+)["\']?\)', line)
    default_value = default_match.group(1) if default_match else None
    
    # Determinar tipo SQL
    if drizzle_type == 'int':
        # Se tem 'At' no nome, provavelmente é timestamp (BIGINT)
        if 'At' in col_name or 'Date' in col_name:
            sql_type = 'BIGINT'
        else:
            sql_type = 'INT'
    elif drizzle_type == 'varchar':
        sql_type = f'VARCHAR({length})' if length else 'VARCHAR(255)'
    elif drizzle_type == 'text':
        # TEXT com DEFAULT precisa virar VARCHAR
        if default_value and default_value not in ['true', 'false', '0']:
            sql_type = 'VARCHAR(255)'
        else:
            sql_type = 'TEXT'
    else:
        sql_type = 'TEXT'  # fallback
    
    # Construir definição SQL
    sql_parts = [f'`{sql_name}` {sql_type}']
    
    if auto_increment:
        sql_parts.append('AUTO_INCREMENT')
    
    if not_null:
        sql_parts.append('NOT NULL')
    
    if default_value:
        # Converter boolean para MySQL
        if default_value == 'true':
            sql_parts.append('DEFAULT 1')
        elif default_value == 'false':
            sql_parts.append('DEFAULT 0')
        elif default_value.isdigit():
            sql_parts.append(f'DEFAULT {default_value}')
        else:
            sql_parts.append(f"DEFAULT '{default_value}'")
    
    if unique:
        sql_parts.append('UNIQUE')
    
    if primary_key:
        sql_parts.append('PRIMARY KEY')
    
    return ' '.join(sql_parts)

def generate_table_sql(table_name, columns):
    """Gera SQL CREATE TABLE a partir de lista de colunas."""
    sql = f"CREATE TABLE IF NOT EXISTS `{table_name}` (\n"
    sql += ',\n'.join(f'  {col}' for col in columns)
    sql += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
    return sql

def main():
    schema_file = '/home/ubuntu/impact7-platform-permanent/drizzle/schema.ts'
    
    with open(schema_file, 'r') as f:
        content = f.read()
    
    # Encontrar todas as definições de tabelas
    table_pattern = r'export const (\w+) = mysqlTable\("(\w+)", \{([^}]+)\}\);'
    tables = re.findall(table_pattern, content, re.DOTALL)
    
    all_sql = []
    
    for var_name, table_name, columns_block in tables:
        columns = []
        for line in columns_block.split('\n'):
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            
            col_sql = parse_drizzle_column(line)
            if col_sql:
                columns.append(col_sql)
        
        if columns:
            table_sql = generate_table_sql(table_name, columns)
            all_sql.append(table_sql)
            print(f"✅ Generated SQL for table: {table_name} ({len(columns)} columns)")
    
    # Salvar SQL em arquivo
    output_file = '/home/ubuntu/impact7-platform-permanent/scripts/create-all-tables.sql'
    with open(output_file, 'w') as f:
        f.write('\n\n'.join(all_sql))
    
    print(f"\n✅ Generated SQL for {len(all_sql)} tables")
    print(f"📝 SQL saved to: {output_file}")
    print(f"\nTo execute: pnpm exec tsx scripts/execute-sql-file.ts")

if __name__ == '__main__':
    main()
