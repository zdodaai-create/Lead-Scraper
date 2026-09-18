import sqlite3
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.name_extractor import derive_client_name

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lead_finder.db")
if not os.path.exists(db_path):
    # Check current directory
    db_path = "lead_finder.db"

print(f"Connecting to database: {os.path.abspath(db_path)}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, company_name, email, full_name, first_name, last_name FROM leads")
rows = cursor.fetchall()

updated_count = 0
for row in rows:
    lead_id, company_name, email, full_name, first_name, last_name = row
    if not full_name or full_name in ("N/A", "Not Available") or not first_name or first_name in ("N/A", "Not Available"):
        names = derive_client_name(company_name=company_name or "", email=email, existing_full=full_name, existing_first=first_name, existing_last=last_name)
        cursor.execute(
            """
            UPDATE leads
            SET full_name = ?, first_name = ?, last_name = ?, name = ?
            WHERE id = ?
            """,
            (names["full_name"], names["first_name"], names["last_name"], names["full_name"], lead_id)
        )
        updated_count += 1
        print(f"Updated lead #{lead_id}: '{company_name}' -> Full: '{names['full_name']}', First: '{names['first_name']}', Last: '{names['last_name']}'")

conn.commit()
conn.close()
print(f"Successfully updated {updated_count} existing lead records with derived client names!")
