#!/bin/bash

# ===========================================
# ENVIRONMENT VARIABLES VALIDATION SCRIPT
# Linux/Unix Version
# ===========================================

set -e

echo "==========================================="
echo " ENVIRONMENT VARIABLES VALIDATION SCRIPT"
echo "==========================================="
echo

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found in current directory"
    echo "Please copy .env.template to .env and fill in the values"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

echo "Checking required environment variables..."
echo

MISSING_VARS=""

# Database Configuration
[ -z "$MONGODB_URI" ] && MISSING_VARS="$MISSING_VARS MONGODB_URI"
[ -z "$POSTGRES_HOST" ] && MISSING_VARS="$MISSING_VARS POSTGRES_HOST"
[ -z "$POSTGRES_DB" ] && MISSING_VARS="$MISSING_VARS POSTGRES_DB"
[ -z "$POSTGRES_USER" ] && MISSING_VARS="$MISSING_VARS POSTGRES_USER"
[ -z "$POSTGRES_PASSWORD" ] && MISSING_VARS="$MISSING_VARS POSTGRES_PASSWORD"

# Security Configuration
[ -z "$JWT_SECRET" ] && MISSING_VARS="$MISSING_VARS JWT_SECRET"

# Cloudinary Configuration
[ -z "$CLOUDINARY_CLOUD_NAME" ] && MISSING_VARS="$MISSING_VARS CLOUDINARY_CLOUD_NAME"
[ -z "$CLOUDINARY_API_KEY" ] && MISSING_VARS="$MISSING_VARS CLOUDINARY_API_KEY"
[ -z "$CLOUDINARY_API_SECRET" ] && MISSING_VARS="$MISSING_VARS CLOUDINARY_API_SECRET"

# Service Discovery
[ -z "$EUREKA_SERVER_URL" ] && MISSING_VARS="$MISSING_VARS EUREKA_SERVER_URL"

# Check for missing variables
if [ -n "$MISSING_VARS" ]; then
    echo "❌ MISSING REQUIRED VARIABLES:"
    echo "$MISSING_VARS"
    echo
    echo "Please set these variables in your .env file or environment"
    echo
    exit 1
fi

echo "✅ All required variables are set!"
echo

# Optional validations
echo "Checking optional configurations..."
echo

# JWT Secret length check
if [ -n "$JWT_SECRET" ]; then
    JWT_LEN=${#JWT_SECRET}
    if [ $JWT_LEN -lt 64 ]; then
        echo "⚠️  WARNING: JWT_SECRET should be at least 64 characters (256-bit)"
        echo "Current length: $JWT_LEN"
    else
        echo "✅ JWT_SECRET length is adequate"
    fi
fi

# MongoDB connectivity check
if command -v mongosh &> /dev/null; then
    echo "Testing MongoDB connection..."
    if mongosh --eval "db.stats()" --quiet $MONGODB_URI > /dev/null 2>&1; then
        echo "✅ MongoDB connection successful"
    else
        echo "⚠️  MongoDB connection failed - check MONGODB_URI"
    fi
elif command -v mongo &> /dev/null; then
    echo "Testing MongoDB connection..."
    if mongo --eval "db.stats()" --quiet $MONGODB_URI > /dev/null 2>&1; then
        echo "✅ MongoDB connection successful"
    else
        echo "⚠️  MongoDB connection failed - check MONGODB_URI"
    fi
else
    echo "ℹ️  MongoDB client not found - skipping connection test"
fi

# PostgreSQL connectivity check
if command -v psql &> /dev/null; then
    echo "Testing PostgreSQL connection..."
    if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ PostgreSQL connection successful"
    else
        echo "⚠️  PostgreSQL connection failed - check POSTGRES_* variables"
    fi
else
    echo "ℹ️  PostgreSQL client not found - skipping connection test"
fi

# Cloudinary check
if [ "$CLOUDINARY_CLOUD_NAME" = "your_cloudinary_cloud_name" ]; then
    echo "⚠️  WARNING: CLOUDINARY_CLOUD_NAME is still default value"
else
    echo "✅ CLOUDINARY_CLOUD_NAME is configured"
fi

echo
echo "==========================================="
echo " VALIDATION COMPLETE"
echo "==========================================="
echo
echo "If all checks passed, your environment is ready!"
echo "You can now start the services."
echo