import sqlite3
import pandas as pd


db_path = f"D:/NOMO/backend/instance/momo_orders.db"   # path to .db file
conn = sqlite3.connect(db_path)

# Get all table names
tables = pd.read_sql(
    "SELECT name FROM sqlite_master WHERE type='table';",
    conn
)

with pd.ExcelWriter("database_export.xlsx", engine="openpyxl") as writer:
    for table in tables["name"]:
        df = pd.read_sql(f"SELECT * FROM {table}", conn)
        df.to_excel(writer, sheet_name=table, index=False)

conn.close()

print("Done! Excel file created.")
