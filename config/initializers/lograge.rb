Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new
  config.colorize_logging = Rails.env.development?
  config.lograge.custom_options =
    lambda do |event|
      options = event.payload.slice(:request_id, :visit_token, :user_id, :remote_ip, :user_agent)
      options[:ddsource] = "ruby"
      options[:level] = event.payload[:level] || "info"
      options[:slow] = event.duration if event.duration > 1000.00
      if event.payload[:params].present?
        options[:params] = event.payload[:params].except(
          *Rails.application.config.filter_parameters,
          "controller",
          "action",
        )
      end
      options
    end
end
