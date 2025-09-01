class AppError
  def self.track(exception, message: nil)
    if message.present?
      Rails.logger.error(message)
      Sentry.capture_exception(exception, extra: { custom_message: message })
    else
      Rails.logger.error(exception)
      Sentry.capture_exception(exception)
    end
  end
end
