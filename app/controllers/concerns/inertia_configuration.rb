# app/controllers/concerns/inertia_configuration.rb
module InertiaConfiguration
  extend ActiveSupport::Concern

  included do
    # Configure Inertia prop transformer to convert keys to camelCase
    inertia_config(
      prop_transformer:
        lambda { |props:| props.deep_transform_keys { |key| key.to_s.camelize(:lower) } },
    )

    # Share data with all Inertia responses
    inertia_share currentUser: -> { current_user },
                  railsEnv: -> { Rails.env },
                  frontendHealthCheck: -> { ENV.fetch("FRONTEND_HEALTHCHECK", "true") == "true" },
                  page_title: -> { @page_title },
                  flash: -> { flash.to_hash }
  end

  private

  # Check if this is an Inertia request (not the initial page load)
  def inertia_request?
    request.headers["X-Inertia"].present?
  end

  # Skip CSRF verification for Inertia requests (they're protected by same-origin policy + auth)
  # For some reason the default CSRF setup was not working with Inertia.js + Inertia Modals, my guess
  # is that the modal rotates the token, so the one in the page is not valid anymore.
  def verified_request?
    super || request.headers["X-Inertia"] == "true"
  end
end
