FROM alpine:3.22

LABEL maintainer="n0xa"
LABEL name="seckc-encom-boardroom-web"
LABEL version="2.2.0"
LABEL release="1"
LABEL summary="SecKC ENCOM Boardroom Web Server"
LABEL description="Public-facing web container with nginx, Node.js, grunt, and LetsEncrypt support for SecKC ENCOM Boardroom"
LABEL authoritative-source-url="https://github.com/SecKC/chnserver"

# Install packages
RUN apk --no-cache add \
    nginx \
    nodejs \
    npm \
    certbot \
    certbot-nginx \
    openssl \
    curl \
    bash \
    coreutils \
    shadow \
    gettext

# Install grunt globally
RUN npm install -g grunt-cli

# Create nginx user and directories
RUN adduser -D -s /bin/sh nginx || true
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /etc/nginx/conf.d
RUN chown -R nginx:nginx /var/log/nginx /var/lib/nginx

# Create application directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.json /app/
RUN npm install

# Copy application files
COPY . /app/

# Create template directory and copy config template
RUN mkdir -p /templates
COPY docker/config.js.template /templates/config.js.template

# Create directories for certificates and nginx
RUN mkdir -p /etc/letsencrypt /var/www/certbot /etc/nginx/ssl

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx-ssl.conf /etc/nginx/nginx-ssl.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]