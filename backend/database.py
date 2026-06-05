import sqlite3
import os
from typing import Tuple, List, Dict, Any

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "university.db")

def init_db():
    """Initialize the database and seed it with the new relational college data."""
    # Remove existing db file if exists to rebuild schema correctly
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
        except Exception:
            pass

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")

    # Create departments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT NOT NULL UNIQUE,
        head_of_department TEXT NOT NULL,
        budget INTEGER NOT NULL
    )
    """)

    # Create students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        cgpa REAL NOT NULL,
        FOREIGN KEY (department) REFERENCES departments(department_name)
    )
    """)

    # Seed departments
    departments_data = [
        ("Computer Science", "Dr. Alan Turing", 500000),
        ("Mechanical", "Dr. Nikolaus Otto", 400000),
        ("Electrical", "Dr. Nikola Tesla", 450000),
        ("Civil", "Dr. Hardy Cross", 380000),
        ("Biology", "Dr. Charles Darwin", 350000)
    ]
    cursor.executemany(
        "INSERT INTO departments (department_name, head_of_department, budget) VALUES (?, ?, ?)", 
        departments_data
    )
 
    # Seed students referencing department names
    students_data = [
        ("Alice Smith", "alice.smith@university.edu", "Computer Science", 9.2),
        ("Bob Jones", "bob.jones@university.edu", "Computer Science", 8.5),
        ("Charlie Brown", "charlie.brown@university.edu", "Electrical", 7.8),
        ("Diana Prince", "diana.prince@university.edu", "Biology", 9.6),
        ("Evan Wright", "evan.wright@university.edu", "Mechanical", 6.8),
        ("Fiona Gallagher", "fiona.gallagher@university.edu", "Civil", 8.1),
        ("George Clark", "george.clark@university.edu", "Computer Science", 7.4),
        ("Hannah Abbott", "hannah.abbott@university.edu", "Biology", 8.9),
        ("Ian Malcolm", "ian.malcolm@university.edu", "Biology", 9.1),
        ("Julia Roberts", "julia.roberts@university.edu", "Civil", 9.4),
        ("Kevin Bacon", "kevin.bacon@university.edu", "Mechanical", 7.2),
        ("Laura Croft", "laura.croft@university.edu", "Computer Science", 9.8),
        ("Mike Wheeler", "mike.wheeler@university.edu", "Electrical", 6.5),
        ("Nancy Wheeler", "nancy.wheeler@university.edu", "Civil", 8.7),
        ("Oscar Martinez", "oscar.martinez@university.edu", "Computer Science", 7.9),
        ("Pam Beesly", "pam.beesly@university.edu", "Civil", 8.3),
        ("Quinn Fabray", "quinn.fabray@university.edu", "Mechanical", 9.0),
        ("Ryan Howard", "ryan.howard@university.edu", "Electrical", 6.2)
    ]
    cursor.executemany(
        "INSERT INTO students (name, email, department, cgpa) VALUES (?, ?, ?, ?)",
        students_data
    )

    conn.commit()
    conn.close()

def execute_query(sql: str) -> Tuple[List[str], List[Tuple], str]:
    """Execute a query against the SQLite database.
    Returns:
        columns: List of column names
        rows: List of result rows (tuples)
        error: Error message if query fails, empty string otherwise
    """
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.execute(sql)
        
        description = cursor.description
        if description:
            columns = [desc[0] for desc in description]
            rows = cursor.fetchall()
            return columns, rows, ""
        else:
            conn.commit()
            return ["Status"], [("Query executed successfully, no rows returned.",)], ""
    except sqlite3.Error as e:
        return [], [], str(e)
    finally:
        if conn:
            conn.close()

def get_schemas() -> Dict[str, Any]:
    """Returns database schema information (tables, columns, types)."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    schema = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = []
        for col in cursor.fetchall():
            columns.append({
                "cid": col[0],
                "name": col[1],
                "type": col[2],
                "notnull": col[3],
                "dflt_value": col[4],
                "pk": col[5]
            })
        
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        
        schema[table] = {
            "columns": columns,
            "count": count
        }
    
    conn.close()
    return schema
