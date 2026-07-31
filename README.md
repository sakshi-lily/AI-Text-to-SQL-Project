# 🤖 AI Text-to-SQL

Transform natural language questions into SQL queries using Artificial Intelligence and execute them on a relational database.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-black?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-blue?logo=mysql)
![OpenAI](https://img.shields.io/badge/OpenAI-API-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Overview

AI Text-to-SQL is a full-stack web application that enables users to interact with databases using plain English instead of writing SQL manually.

Users simply type a question like:

> **"Show all students who scored above 90 in Mathematics."**

The application uses an AI model to:

- Understand the user's intent
- Generate the corresponding SQL query
- Execute the query on the database
- Display the results in an easy-to-read format

This project makes database querying accessible to non-technical users.

---

## ✨ Features

- 🔤 Natural Language to SQL conversion
- 🤖 AI-powered SQL generation
- ⚡ Instant query execution
- 📊 Display query results in table format
- 🗄️ MySQL database integration
- 🔒 Secure backend API
- 🎨 Modern responsive UI
- ⚠️ SQL error handling
- 📱 Mobile-friendly interface

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MySQL

### AI

- OpenAI API

---


## 📂 Project Structure

```
AI-Text-to-SQL-Project
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── database/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/sakshi-lily/AI-Text-to-SQL-Project.git

cd AI-Text-to-SQL-Project
```

---

## Install Dependencies

### Frontend

```bash
cd client

npm install
```

### Backend

```bash
cd ../server

npm install
```

---

## Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

OPENAI_API_KEY=your_openai_api_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

---

## Start Backend

```bash
cd server

npm run dev
```

---


## Start Frontend

```bash
cd client

npm run dev
```

---

## 💡 Example Queries

- Show all employees.
- List students with marks above 80.
- Count total customers.
- Show top 10 highest salaries.
- Find products costing more than ₹1000.
- Display all orders placed this month.

---

## ⚙️ How It Works

1. User enters a natural language question.
2. Frontend sends the request to the backend.
3. Backend forwards the prompt to the OpenAI API.
4. AI generates an SQL query.
5. Backend executes the SQL query on MySQL.
6. Results are returned to the frontend.
7. User sees the generated SQL and the output.

---



