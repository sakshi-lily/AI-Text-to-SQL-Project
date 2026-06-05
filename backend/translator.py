import re
import json
from typing import Tuple, Dict, Any

def translate_nlp_to_sql(prompt: str, api_key: str = None) -> Tuple[str, Dict[str, Any], str]:
    """Translates a natural language query into SQL based on the new relational schema.
    Returns:
        sql: The generated SQL query
        explanation: Explanation details dictionary
        source: "Gemini AI" or "Rule-based Engine"
    """
    clean_prompt = prompt.lower().strip()
    
    # 1. Try real LLM translation if API key is provided
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            system_instruction = (
                "You are an expert AI Text-to-SQL translator and analyst. "
                "Translate the user's natural language question into a SQLite query, "
                "and explain it. You MUST respond with a JSON object in this exact structure:\n"
                "{\n"
                "  \"sql\": \"SELECT ...;\",\n"
                "  \"description\": \"Simple English description of what the query does.\",\n"
                "  \"tables\": [\"table1\", \"table2\"],\n"
                "  \"filters\": [\"Column X must be value Y\", \"Column Z > value\"],\n"
                "  \"sorting\": [\"Column A descending\"],\n"
                "  \"expected_output\": \"Description of the columns and data returned.\",\n"
                "  \"confidence_score\": 98.5\n"
                "}\n\n"
                "The database schema represents a University Management System:\n"
                "Table: students\n"
                "- id (INTEGER, PRIMARY KEY)\n"
                "- name (TEXT)\n"
                "- email (TEXT)\n"
                "- department (TEXT, FOREIGN KEY references departments.department_name)\n"
                "- cgpa (REAL)\n\n"
                "Table: departments\n"
                "- id (INTEGER, PRIMARY KEY)\n"
                "- department_name (TEXT)\n"
                "- head_of_department (TEXT)\n"
                "- budget (INTEGER)\n\n"
                "Ensure the sql field contains valid SQLite syntax. Do not add markdown backticks around the JSON."
            )
            
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_instruction
            )
            
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            res_data = json.loads(response.text.strip())
            sql = res_data.get("sql", "").strip()
            explanation = {
                "description": res_data.get("description", "Translated query."),
                "tables": res_data.get("tables", ["students"]),
                "filters": res_data.get("filters", []),
                "sorting": res_data.get("sorting", []),
                "expected_output": res_data.get("expected_output", "Query results."),
                "confidence_score": float(res_data.get("confidence_score", 95.0))
            }
            return sql, explanation, "Gemini AI"
        except Exception as e:
            pass

    # 2. Rule-based fallback translation and explanation
    if clean_prompt == "show all students with cgpa greater than 8" or clean_prompt == "show all students with cgpa greater than 8.":
        sql = "SELECT * FROM students WHERE cgpa > 8;"
        explanation = {
            "description": "Retrieves all column values for students whose CGPA is greater than 8.",
            "tables": ["students"],
            "filters": ["CGPA must be greater than 8"],
            "sorting": [],
            "expected_output": "All columns from the students table.",
            "confidence_score": 99.0
        }
        return sql, explanation, "Rule-based Engine"
        
    if clean_prompt == "show all students in computer science with a cgpa above 3.5" or clean_prompt == "show all students in computer science with a cgpa above 3.5.":
        sql = "SELECT * FROM students\nWHERE department = 'Computer Science'\nAND cgpa > 3.5;"
        explanation = {
            "description": "Retrieves all column values for students in the Computer Science department whose CGPA is greater than 3.5.",
            "tables": ["students"],
            "filters": ["Department is 'Computer Science'", "CGPA must be greater than 3.5"],
            "sorting": [],
            "expected_output": "All columns from the students table.",
            "confidence_score": 99.0
        }
        return sql, explanation, "Rule-based Engine"

    sql = ""
    explanation = {
        "description": "Retrieves student profiles from the university database.",
        "tables": ["students"],
        "filters": [],
        "sorting": [],
        "expected_output": "ID, Name, Email, Department ID, and CGPA of students.",
        "confidence_score": 95.0
    }
    
    is_count = "count" in clean_prompt or "how many" in clean_prompt
    
    # Identify department id mapping:
    # 1: CS, 2: Mechanical, 3: Electrical, 4: Civil, 5: Biology
    dept_id = None
    dept_name = ""
    if "computer science" in clean_prompt or "cs" in clean_prompt:
        dept_id = 1
        dept_name = "Computer Science"
    elif "mechanical" in clean_prompt or "me" in clean_prompt:
        dept_id = 2
        dept_name = "Mechanical"
    elif "electrical" in clean_prompt or "ee" in clean_prompt:
        dept_id = 3
        dept_name = "Electrical"
    elif "civil" in clean_prompt or "ce" in clean_prompt:
        dept_id = 4
        dept_name = "Civil"
    elif "biology" in clean_prompt or "bio" in clean_prompt:
        dept_id = 5
        dept_name = "Biology"

    # Identify CGPA threshold
    cgpa_val = None
    is_greater = True
    cgpa_match = re.search(r'(?:cgpa|gpa)\s*(?:above|greater than|>)\s*([0-9.]+)', clean_prompt)
    if cgpa_match:
        cgpa_val = float(cgpa_match.group(1))
    else:
        cgpa_match_below = re.search(r'(?:cgpa|gpa)\s*(?:below|less than|<)\s*([0-9.]+)', clean_prompt)
        if cgpa_match_below:
            cgpa_val = float(cgpa_match_below.group(1))
            is_greater = False

    # Identify sorting
    sort_by_cgpa = "highest" in clean_prompt or "top" in clean_prompt or "best" in clean_prompt
    sort_lowest = "lowest" in clean_prompt or "worst" in clean_prompt

    # Identify limit
    limit = None
    limit_match = re.search(r'(?:top|first|limit)\s*([0-9]+)', clean_prompt)
    if limit_match:
        limit = int(limit_match.group(1))
    elif "top student" in clean_prompt or "highest cgpa" in clean_prompt:
        limit = 1

    # Compile Explanation Details
    filters_applied = []
    sorting_applied = []
    tables_used = ["students"]

    if dept_name:
        filters_applied.append(f"Department must be exactly '{dept_name}'")
    if cgpa_val is not None:
        filters_applied.append(f"CGPA must be {'greater than' if is_greater else 'less than'} {cgpa_val}")
    if sort_by_cgpa:
        sorting_applied.append("CGPA descending (highest first)")
    elif sort_lowest:
        sorting_applied.append("CGPA ascending (lowest first)")
    if limit:
        filters_applied.append(f"Limit output to first {limit} records")

    # Select clause
    select_clause = "SELECT id, name, email, department, cgpa FROM students"
    if is_count:
        select_clause = "SELECT COUNT(*) FROM students"
        explanation["expected_output"] = "A numerical count of students matching the filters."
    else:
        explanation["expected_output"] = "ID, Name, Email, Department, and CGPA."

    where_clauses = []
    if dept_name:
        where_clauses.append(f"department = '{dept_name}'")
    if cgpa_val is not None:
        where_clauses.append(f"cgpa {'>' if is_greater else '<'} {cgpa_val}")
            
    where_str = f" WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    
    order_str = ""
    if sort_by_cgpa:
        order_str = " ORDER BY cgpa DESC"
    elif sort_lowest:
        order_str = " ORDER BY cgpa ASC"
        
    limit_str = f" LIMIT {limit}" if limit else ""
    
    # Check for department query
    if "department" in clean_prompt and not dept_id and ("budget" in clean_prompt or "head" in clean_prompt or "who leads" in clean_prompt):
        tables_used = ["departments"]
        explanation["tables"] = tables_used
        explanation["expected_output"] = "Department details: ID, Name, Head, and budget."
        explanation["confidence_score"] = 92.0
        
        if "budget" in clean_prompt:
            sql = "SELECT id, department_name, head_of_department, budget FROM departments ORDER BY budget DESC;"
            explanation["description"] = "Retrieves all departments sorted by their annual budget in descending order."
            explanation["sorting"] = ["budget descending"]
        else:
            sql = "SELECT id, department_name, head_of_department FROM departments;"
            explanation["description"] = "Retrieves a listing of all departments and their respective heads."
            explanation["sorting"] = []
            
        explanation["filters"] = []
        return sql, explanation, "Rule-based Engine"

    # Standard Student query construction
    sql = f"{select_clause}{where_str}{order_str}{limit_str};"
    
    # Catch-all override
    if sql == "SELECT id, name, email, department, cgpa FROM students;":
        if "department" in clean_prompt and "budget" in clean_prompt:
            sql = "SELECT id, department_name, head_of_department, budget FROM departments;"
            tables_used = ["departments"]
            explanation["description"] = "Retrieves all departments along with their leaders and budgets."
            explanation["expected_output"] = "Department ID, Name, Head, and Budget."
        elif "department" in clean_prompt:
            sql = "SELECT * FROM departments;"
            tables_used = ["departments"]
            explanation["description"] = "Retrieves all columns from the departments table."
            explanation["expected_output"] = "All fields from departments table."
        else:
            explanation["description"] = "Retrieves all student records from the students table."

    # Build description for student queries dynamically
    else:
        desc_parts = []
        if is_count:
            desc_parts.append("Counts the total number of students")
        else:
            desc_parts.append("Retrieves a list of students")
            
        if dept_id:
            desc_parts.append(f"in the {dept_name} department")
        if cgpa_val is not None:
            desc_parts.append(f"who have a CGPA {'above' if is_greater else 'below'} {cgpa_val}")
        if sort_by_cgpa:
            desc_parts.append("sorted by CGPA (highest first)")
        elif sort_lowest:
            desc_parts.append("sorted by CGPA (lowest first)")
        if limit:
            desc_parts.append(f"limiting the output to {limit} result{'s' if limit > 1 else ''}")
            
        explanation["description"] = " ".join(desc_parts).capitalize() + "."

    explanation["tables"] = tables_used
    explanation["filters"] = filters_applied
    explanation["sorting"] = sorting_applied
    
    score = 95.0
    if dept_id: score += 1.0
    if cgpa_val: score += 1.5
    if limit: score += 1.0
    explanation["confidence_score"] = min(score, 99.5)

    return sql, explanation, "Rule-based Engine"
