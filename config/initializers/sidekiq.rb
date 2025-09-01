# Configure Sidekiq to use different Redis databases for isolation
# Database 0: Rails cache (all environments)
# Database 1: Sidekiq (all environments)
# Database 3: Action Cable (all environments)

redis_url = ENV.fetch("REDIS_URL", "redis://localhost:6379")
sidekiq_redis_url = "#{redis_url}/1"

# Suppress Redis connection INFO messages when not running Sidekiq server
# This prevents annoying Redis connection messages in console, rake tasks, etc.
# while preserving normal logging for actual Sidekiq worker processes
Sidekiq.logger.level = Logger::WARN unless Sidekiq.server?

begin
  Sidekiq.configure_server { |config| config.redis = { url: sidekiq_redis_url } }
  Sidekiq.configure_client { |config| config.redis = { url: sidekiq_redis_url } }
rescue Redis::CannotConnectError, RedisClient::CannotConnectError
  # Silently skip if Redis is not available (e.g., during asset precompilation)
end
