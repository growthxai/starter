require "resend"
Resend.configure { |config| config.api_key = ENV.fetch("RESEND_API_KEY", "re_123456789") }
