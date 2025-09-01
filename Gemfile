source "https://rubygems.org"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.0.2"
gem "rack", ">= 3.1.16"
# Use postgresql as the database for Active Record
gem "pg", "~> 1.6"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"
# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

gem "propshaft"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

gem "inertia_rails"
gem "inertia_rails-contrib", github: "skryukov/inertia_rails-contrib"
gem "vite_rails", "~> 3.0"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[windows jruby]

gem "redis"
gem "connection_pool"

# Background job processing
gem "sidekiq", "~> 8.0"
gem "sidekiq-cron"
gem "turbo-rails"
gem "importmap-rails"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

gem "csv"

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem "image_processing", "~> 1.2"

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

# Auditing and versioning
gem "paper_trail"

# Email delivery
gem "resend"

# Authentication
gem "devise"
gem "omniauth-google-oauth2"
gem "omniauth-rails_csrf_protection"

# JavaScript routes
gem "js-routes"

# Error tracking
gem "sentry-ruby"
gem "sentry-rails"

# Safe database migrations
gem "strong_migrations", "~> 2.5"

# Structured logging
gem "lograge"

# Analytics
gem "ahoy_matey"

group :development, :test do
  gem "bundler-audit"
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "dotenv"
  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  gem "mocha"

  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false

  gem "prettier_print"
  gem "syntax_tree"
  gem "syntax_tree-haml"
  gem "syntax_tree-rbs"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"
end

group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem "capybara"
  gem "selenium-webdriver"
  gem "webmock"
end
