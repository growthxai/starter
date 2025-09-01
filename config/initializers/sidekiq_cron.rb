# Load Sidekiq-Cron jobs from schedule.yml
# Skip during asset precompilation or when Redis is unavailable
return if Rails.env.test?

begin
  Sidekiq::Cron::Job.load_from_hash(YAML.load_file(Rails.root.join("config", "schedule.yml")))
rescue Redis::CannotConnectError, RedisClient::CannotConnectError
  # Silently skip if Redis is not available (e.g., during asset precompilation)
rescue Errno::ENOENT, RuntimeError
  # Schedule file doesn't exist or empty
end
