# AI Assistant

A full-stack AI assistant project with a React frontend and an Express backend. The application supports chat interactions, memory handling, document retrieval, profile management, and PDF-based knowledge search.

## Project Structure

- backend/ — Express server, routing, memory, RAG, and tool modules
- frontend/ — Vite + React client interface

## Features

- Chat-based AI assistant experience
- Memory storage and retrieval
- Conversation summarization
- Profile management
- PDF upload and document search
- Tool-based actions such as calculator, time, and goals lookup

## Prerequisites

- Node.js and npm
- A valid OpenAI API configuration (if the app is configured to use it)

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Run the Application

### Start the backend

```bash
cd backend
npm start
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will usually run on Vite's local development server, and the backend will run through the Express server.

## Notes

- The backend uses several modules for memory, embeddings, RAG, and tool routing.
- The frontend is a React/Vite app for interacting with the assistant.
- Make sure environment variables and API credentials are configured before running the app.
