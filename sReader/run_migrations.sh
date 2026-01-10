#!/bin/bash

# Extract database connection details from DATABASE_URL
DATABASE_URL=${DATABASE_URL}

# Run the SQL file against Supabase
psql "$DATABASE_URL" -f create_tables.sql

echo "Database tables created successfully!"
