import os
import mysql.connector
import json

# Connect to MySQL
conn = mysql.connector.connect(
    host=os.environ['DATABASE_URL'].split('@')[1].split(':')[0],
    user=os.environ['DATABASE_URL'].split('//')[1].split(':')[0],
    password=os.environ['DATABASE_URL'].split(':')[2].split('@')[0],
    database=os.environ['DATABASE_URL'].split('/')[-1].split('?')[0]
)

cursor = conn.cursor()

# Get all tables
cursor.execute("SHOW TABLES")
tables = [table[0] for table in cursor.fetchall()]

print(f"Found {len(tables)} tables in database\n")

# Focus on tables with known errors
error_tables = ['whitepaperDownloads', 'set7Tasklog', 'leads', 'users']

discrepancies = []

for table in error_tables:
    cursor.execute(f"SHOW COLUMNS FROM {table}")
    columns = cursor.fetchall()
    
    print(f"\n=== Table: {table} ===")
    print(f"Columns in MySQL:")
    for col in columns:
        field, type_, null, key, default, extra = col
        print(f"  {field}: {type_} {'NOT NULL' if null == 'NO' else 'NULL'}")
    
    # Common discrepancies
    col_names = [col[0] for col in columns]
    if 'organization' in col_names:
        discrepancies.append(f"{table}.organization exists in MySQL but may be missing in Drizzle")
    if 'logourl' in col_names or 'logoUrl' in col_names:
        discrepancies.append(f"{table} has logo URL column (check camelCase)")
    if 'labelkey' in col_names or 'labelKey' in col_names:
        discrepancies.append(f"{table} has label key column (check camelCase)")

cursor.close()
conn.close()

print("\n\n=== DISCREPANCIES FOUND ===")
for disc in discrepancies:
    print(f"  - {disc}")

