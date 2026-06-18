import os
import sys
from fastapi import FastAPI, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db, execute_query, get_schemas
from translator import translate_nlp_to_sql

app = FastAPI(title="AI Text-to-SQL API")

# Enable CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Models
class DBConnectionRequest(BaseModel):
    host: str
    port: str
    database: str
    username: str
    password: str

class TranslationRequest(BaseModel):
    question: Optional[str] = None
    prompt: Optional[str] = None
    apiKey: Optional[str] = None

class QueryExecutionRequest(BaseModel):
    sql: str

# Current mock database connection state
current_connection = {
    "connected": True,
    "host": "local-sqlite",
    "port": "3306",
    "database": "university_registrar",
    "username": "sqlite_user",
}

# In-memory query logs and statistics state
history_list = [
    "Show all students in Computer Science with a CGPA above 8.0",
    "Get the top 3 students by CGPA",
    "Show the budget and head of each department",
    "How many students are enrolled in Biology?",
    "List students in Mechanical Engineering sorted by CGPA from lowest to highest"
]

stats_data = {
    "totalQueries": 12,
    "successfulQueries": 11,
    "failedQueries": 1,
    "avgQueryTimeMs": 14.5,
    "mostAccessedTable": "students",
    "aiAccuracy": 91.6,
    "recordsFetched": 96
}

@app.post("/api/db/test")
def test_connection(req: DBConnectionRequest):
    """Simulates testing a connection to a MySQL/PostgreSQL database."""
    # Add simple realistic validation
    if not req.host or not req.database or not req.username:
        raise HTTPException(status_code=400, detail="Missing required connection parameters.")
    
    # Simulate database connect delay and validate
    if req.port not in ["5432", "3306", "1433", "1521", "80"]:
        return {
            "success": False,
            "message": f"Connection failed: Connection timed out on port {req.port}. Check firewall settings."
        }
    
    if req.username.lower() in ["root", "admin", "postgres", "sqlite_user", "student_user"]:
        return {
            "success": True,
            "message": f"Successfully connected to database '{req.database}' at {req.host}:{req.port}. Version: PostgreSQL 15.2-DBMS."
        }
    else:
        return {
            "success": False,
            "message": "Connection failed: Access denied. Invalid username or password."
        }

@app.post("/api/db/connect")
def connect_database(req: DBConnectionRequest):
    """Simulates establishing an active database session."""
    test_res = test_connection(req)
    if test_res["success"]:
        current_connection["connected"] = True
        current_connection["host"] = req.host
        current_connection["port"] = req.port
        current_connection["database"] = req.database
        current_connection["username"] = req.username
        
        # Get active tables count
        schemas = get_schemas()
        return {
            "success": True,
            "message": "Database session established.",
            "database": req.database,
            "tables_count": len(schemas)
        }
    else:
        raise HTTPException(status_code=400, detail=test_res["message"])

@app.get("/api/db/status")
def get_connection_status():
    """Returns the current connection status and parameters."""
    return current_connection

@app.post("/api/db/disconnect")
def disconnect_database():
    """Disconnects the current active connection (resets to local state)."""
    current_connection["connected"] = False
    current_connection["host"] = ""
    current_connection["port"] = ""
    current_connection["database"] = ""
    current_connection["username"] = ""
    return {"success": True, "message": "Disconnected from database."}

@app.post("/api/generate-sql")
def translate_prompt(req: TranslationRequest):
    """Translates a natural language question into SQL."""
    prompt_text = req.question or req.prompt
    if not prompt_text:
        raise HTTPException(status_code=400, detail="Question or prompt is required.")
    
    sql, explanation, source = translate_nlp_to_sql(prompt_text, req.apiKey)
    
    # Save newly generated query statement to dynamic history list
    if prompt_text not in history_list:
        history_list.insert(0, prompt_text)
        if len(history_list) > 20:
            history_list.pop()
            
    return {
        "sql": sql,
        "explanation": explanation,
        "source": source
    }

@app.post("/api/execute-query")
def execute_sql(req: QueryExecutionRequest):
    """Executes a SQL query on the active database."""
    if not current_connection["connected"]:
        raise HTTPException(status_code=400, detail="No active database connection. Please connect first.")
        
    if not req.sql:
        raise HTTPException(status_code=400, detail="SQL query is required.")
        
    import time
    start_time = time.time()
    columns, rows, error = execute_query(req.sql)
    duration_ms = (time.time() - start_time) * 1000.0
    
    # Update dynamic statistics
    stats_data["totalQueries"] += 1
    if error:
        stats_data["failedQueries"] += 1
    else:
        stats_data["successfulQueries"] += 1
        stats_data["recordsFetched"] += len(rows)
        # Average Latency recalculation
        total_queries = stats_data["successfulQueries"] + stats_data["failedQueries"]
        stats_data["avgQueryTimeMs"] = round((stats_data["avgQueryTimeMs"] * (total_queries - 1) + duration_ms) / total_queries, 2)
        
    # Recalculate translation accuracy
    total_runs = stats_data["successfulQueries"] + stats_data["failedQueries"]
    if total_runs > 0:
        stats_data["aiAccuracy"] = round((stats_data["successfulQueries"] / total_runs) * 100, 1)
        
    # Convert list of tuples to list of dicts for frontend convenience
    formatted_rows = []
    if not error:
        for r in rows:
            formatted_rows.append(dict(zip(columns, r)))
            
    return {
        "columns": columns,
        "rows": formatted_rows,
        "error": error
    }

@app.get("/api/schema")
def get_db_schemas():
    """Gets schemas for all tables in the active database."""
    if not current_connection["connected"]:
        raise HTTPException(status_code=400, detail="No active database connection.")
    return get_schemas()

@app.get("/api/history")
def get_query_history():
    """Gets recent queries history logs."""
    return history_list

@app.get("/api/analytics")
def get_analytics():
    """Gets current database query metrics."""
    return stats_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
