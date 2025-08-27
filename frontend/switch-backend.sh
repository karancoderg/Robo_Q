#!/bin/bash

# Script to switch between local and production backends

if [ "$1" = "local" ]; then
    echo "Switching to local backend..."
    cp .env.development .env
    echo "✅ Now using local backend (http://localhost:5000/api)"
    echo "This should fix the Google OAuth origin issue."
elif [ "$1" = "production" ]; then
    echo "Switching to production backend..."
    cp .env.production .env
    echo "✅ Now using production backend (https://robo-q-1.onrender.com/api)"
    echo "Note: Google OAuth may have origin issues in development."
else
    echo "Usage: $0 [local|production]"
    echo ""
    echo "Current configuration:"
    echo "VITE_API_URL=$(grep VITE_API_URL .env | cut -d'=' -f2)"
    echo ""
    echo "Available options:"
    echo "  local      - Use local backend (http://localhost:5000/api)"
    echo "  production - Use production backend (https://robo-q-1.onrender.com/api)"
fi
