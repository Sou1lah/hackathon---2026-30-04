#! /usr/bin/env bash

set -x

# Retry loop for the prestart process
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Starting prestart checks (Attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
    
    # Let the DB start
    if python app/backend_pre_start.py; then
        # Run migrations
        if alembic upgrade head; then
            # Create initial data in DB
            if python app/initial_data.py; then
                echo "Prestart completed successfully!"
                exit 0
            fi
        fi
    fi
    
    echo "Prestart failed. Retrying in 5 seconds..."
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT+1))
done

echo "Prestart failed after $MAX_RETRIES attempts."
exit 1
