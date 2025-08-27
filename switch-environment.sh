#!/bin/bash

# Environment switching script for Robo Q

if [ "$1" = "local" ]; then
    echo "Switching to LOCAL environment..."
    
    # Update frontend .env
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=109035473338-08i0l4q0nncr71vf4vvl6tmpfibp8di6.apps.googleusercontent.com
EOF
    
    echo "✅ Frontend configured for local development"
    
elif [ "$1" = "production" ]; then
    echo "Switching to PRODUCTION environment..."
    
    # Update frontend .env
    cat > frontend/.env << EOF
VITE_API_URL=https://robo-q-1.onrender.com/api
VITE_GOOGLE_CLIENT_ID=109035473338-08i0l4q0nncr71vf4vvl6tmpfibp8di6.apps.googleusercontent.com
EOF
    
    # Update backend .env for production CORS
    sed -i 's/FRONTEND_URL=.*/FRONTEND_URL=http:\/\/localhost:3000,https:\/\/your-frontend-domain.com/' backend/.env
    
    echo "✅ Frontend configured for production"
    echo "⚠️  Make sure to update your-frontend-domain.com with actual domain"
    
else
    echo "Usage: $0 [local|production]"
    echo "  local      - Use local backend server (localhost:5000)"
    echo "  production - Use production backend server (robo-q-1.onrender.com)"
fi
