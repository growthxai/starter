#!/bin/bash

# Determine what to run based on the service type
if [ "$RENDER_SERVICE_TYPE" = "worker" ]; then
    echo "Starting SolidQueue workers..."
    exec bin/jobs
else
    echo "Starting Rails web server..."
    exec ./bin/thrust ./bin/rails server
fi
