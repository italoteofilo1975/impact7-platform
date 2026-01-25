import os
import mysql.connector
from urllib.parse import urlparse

# Parse DATABASE_URL
db_url = os.getenv('DATABASE_URL')
parsed = urlparse(db_url)

# Connect
conn = mysql.connector.connect(
    host=parsed.hostname,
    port=parsed.port or 3306,
    user=parsed.username,
    password=parsed.password,
    database=parsed.path[1:].split('?')[0]
)

cursor = conn.cursor()

# Check roles table
print("=== ROLES TABLE ===")
cursor.execute("SHOW COLUMNS FROM roles")
for row in cursor.fetchall():
    print(f"  {row[0]} | {row[1]} | Null:{row[2]} | Key:{row[3]} | Default:{row[4]}")

print("\n=== PERMISSIONS TABLE ===")
cursor.execute("SHOW COLUMNS FROM permissions")
for row in cursor.fetchall():
    print(f"  {row[0]} | {row[1]} | Null:{row[2]} | Key:{row[3]} | Default:{row[4]}")

conn.close()
