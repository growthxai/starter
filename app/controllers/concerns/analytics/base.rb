# app/controllers/concerns/analytics/base.rb
module Analytics
  module Base
    extend ActiveSupport::Concern

    private

    # Generic tracking method that can be implemented by different providers
    def track(event_name, properties = {})
      # Add path to properties if we have a request
      properties = { path: request.path }.merge(properties) if respond_to?(:request) && request

      # Delegate to the provider's tracking implementation
      # By default, use Ahoy if available, but this can be overridden
      track_with_provider(event_name, properties)
    end

    # Helper to track page views for specific actions
    def track_page_view(page_name = nil)
      properties = { page: page_name || "#{controller_name}##{action_name}", path: request.path }

      # Include the page title as display property if available
      if @page_title.present?
        properties[:display] = @page_title
        # Also set display_path to the current path for easy navigation
        properties[:display_path] = request.path
      end

      track("page_viewed", properties.merge(extract_route_params))
    end

    # Extract route parameters automatically from Rails routing
    def extract_route_params
      # Rails knows all the route parameters from the URL pattern
      # request.path_parameters contains only the parameters extracted from the route
      # Be defensive about string vs symbol keys
      request.path_parameters.except(
        :controller,
        :action,
        :format,
        "controller",
        "action",
        "format",
      )
    end

    protected

    # This method should be overridden by the specific provider
    # Default implementation uses Ahoy if available
    def track_with_provider(event_name, properties)
      raise "NotImplementedError", "Subclass must implement track_with_provider"
    end
  end
end
