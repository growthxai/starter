# app/controllers/concerns/inertia_configuration.rb
module InertiaConfiguration
  extend ActiveSupport::Concern

  included do
    # Configure Inertia prop transformer to convert keys to camelCase
    # We need to parse to JSON and parse back to force ActiveRecord::Base instances to be serialized
    # otherwise `deep_transform_keys` won't work on their attributes
    inertia_config prop_transformer: ->(props:) do
                     serialized_props = JSON.parse(props.to_json, symbolize_names: true)
                     serialized_props.deep_transform_keys { it.to_s.camelize(:lower) }
                   end,
                   component_path_resolver: ->(path:, action:) do
                     "#{path.dasherize}/#{action.dasherize}"
                   end

    # Share data with all Inertia responses
    inertia_share flash: -> { flash.to_hash },
                  railsEnv: -> { Rails.env },
                  pageTitle: -> { @page_title },
                  currentPath: -> { request.path },
                  sidebarOpen: -> { cookies[:sidebar_state] != "false" },
                  frontendHealthCheck: -> { ENV.fetch("FRONTEND_HEALTHCHECK", "true") == "true" }
  end

  private

  # Transform params to underscore for Inertia requests only
  # We need to do this here because any middleware is early in the stack and here we can transform
  # before the ActionController::ParamsWrapper perform its magic.
  # See https://api.rubyonrails.org/classes/ActionController/ParamsWrapper.html
  #
  # IMPORTANT: Only transforms Inertia.js requests (frontend)
  def process_action(*)
    # Only transform params for Inertia requests from frontend
    # Don't transform external webhooks or API calls
    if inertia_request?
      request.request_parameters.deep_transform_keys! { |key| key.to_s.underscore }
      request.query_parameters.deep_transform_keys! { |key| key.to_s.underscore }

      if request.headers["X-Inertia-Partial-Data"].present?
        partial_data = request.headers["X-Inertia-Partial-Data"].split(",").map(&:strip)
        transformed_partial_data = partial_data.map { |key| key.to_s.underscore }
        request.headers["X-Inertia-Partial-Data"] = transformed_partial_data.join(",")
      end
    end

    super
  end

  # Get props from jbuilder template if it exists
  def inertia_view_assigns
    if lookup_context.exists? action_name, controller_path, false, [], formats: [:json]
      JSON.parse render_to_string(formats: [:json])
    else
      {}
    end
  end

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
