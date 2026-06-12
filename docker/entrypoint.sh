#!/bin/bash
set -e

# Default values
HOST_NAME=${HOST_NAME:-localhost}
API_SERVER_PORT=${API_SERVER_PORT:-5000}
API_SERVER_PATH=${API_SERVER_PATH:-/seckcapi/}
DASH_SERVER_PATH=${DASH_SERVER_PATH:-/dash/}
CHN_SERVER_PORT=${CHN_SERVER_PORT:-5001}
DELIVERY_METHOD=${DELIVERY_METHOD:-polling}
POLLING_INTERVAL=${POLLING_INTERVAL:-2000}
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL:-}
LETSENCRYPT_STAGING=${LETSENCRYPT_STAGING:-false}

echo "Starting SecKC ENCOM Boardroom Web Server..."
echo "Host: $HOST_NAME"
echo "API Server Port: $API_SERVER_PORT"
echo "CHN Server Port: $CHN_SERVER_PORT"

# Function to template config files
template_config() {
    local template_file="$1"
    local output_file="$2"
    
    # Use envsubst to substitute environment variables
    envsubst < "$template_file" > "$output_file"
    echo "Templated $template_file -> $output_file"
}

# Template the config.js file
echo "Templating config.js..."
export API_SERVER_PROTOCOL="https"
export DASH_SERVER_PROTOCOL="https"
export CHN_SERVER_PROTOCOL="https"

template_config "/templates/config.js.template" "/app/src/config.js"

# Build the project with grunt
echo "Building project with grunt..."
cd /app
npm install --production=false
grunt release

# Verify production directory exists
if [ ! -d "/app/production" ]; then
    echo "ERROR: Production build failed - /app/production directory not found"
    exit 1
fi

echo "Build completed successfully"

# Template nginx configuration
echo "Templating nginx configuration..."
export HOST_NAME
export API_SERVER_PORT
export CHN_SERVER_PORT

# Function to check if we need SSL certificates
needs_ssl_cert() {
    [ "$HOST_NAME" != "localhost" ] && [ -n "$LETSENCRYPT_EMAIL" ]
}

# Function to check if SSL certificate exists
ssl_cert_exists() {
    [ -f "/etc/letsencrypt/live/$HOST_NAME/fullchain.pem" ]
}

# Function to request SSL certificate
request_ssl_cert() {
    echo "Requesting SSL certificate for $HOST_NAME..."
    
    local staging_flag=""
    if [ "$LETSENCRYPT_STAGING" = "true" ]; then
        staging_flag="--staging"
        echo "Using Let's Encrypt staging environment"
    fi
    
    # Start nginx with HTTP-only config for certificate challenge
    template_config "/etc/nginx/nginx.conf" "/etc/nginx/nginx.conf.active"
    nginx -t -c /etc/nginx/nginx.conf.active
    nginx -c /etc/nginx/nginx.conf.active
    
    # Request certificate
    certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$LETSENCRYPT_EMAIL" \
        --agree-tos \
        --no-eff-email \
        $staging_flag \
        -d "$HOST_NAME"
    
    # Stop nginx
    nginx -s quit || true
    sleep 2
}

# Function to renew SSL certificate
renew_ssl_cert() {
    echo "Renewing SSL certificates..."
    certbot renew --quiet
}

# SSL certificate management
if needs_ssl_cert; then
    if ! ssl_cert_exists; then
        request_ssl_cert
    else
        echo "SSL certificate already exists for $HOST_NAME"
    fi
    
    # Use SSL configuration
    template_config "/etc/nginx/nginx-ssl.conf" "/etc/nginx/nginx.conf.active"
    
    # Set up certificate renewal cron job
    echo "0 0,12 * * * root /usr/bin/certbot renew --quiet && /usr/sbin/nginx -s reload" > /etc/crontabs/root
    crond -b
    echo "Certificate auto-renewal configured"
else
    echo "Using HTTP-only configuration (localhost or no email provided)"
    template_config "/etc/nginx/nginx.conf" "/etc/nginx/nginx.conf.active"
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t -c /etc/nginx/nginx.conf.active

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;" -c /etc/nginx/nginx.conf.active