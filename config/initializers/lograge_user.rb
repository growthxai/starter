Rails.application.config.to_prepare do
  ActionController::Base.class_eval do
    def append_info_to_payload(payload)
      super
      payload[:user_id] = current_user&.slug
    end
  end
end
