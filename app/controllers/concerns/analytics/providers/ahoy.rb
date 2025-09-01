# app/controllers/concerns/analytics/providers/ahoy.rb
module Analytics
  module Providers
    module Ahoy
      extend ActiveSupport::Concern

      included do
        # Skip Ahoy visit tracking for Inertia requests ONLY if we have a valid visit
        # This prevents duplicate visits while still allowing new visits when needed
        skip_before_action :track_ahoy_visit, if: :skip_ahoy_tracking?
      end

      private

      # Skip Ahoy tracking only for Inertia requests with a valid (non-expired) visit
      def skip_ahoy_tracking?
        return false unless inertia_request?

        # Get the visit token from cookie
        visit_token = cookies[:ahoy_visit]
        return false unless visit_token

        # Check if visit exists and is still valid
        visit = ::Ahoy::Visit.find_by(visit_token: visit_token)
        return false unless visit

        # Only skip if visit is still within the duration window
        (Time.current - visit.started_at) < ::Ahoy.visit_duration
      end

      protected

      # Override the base tracking method to use Ahoy
      def track_with_provider(event_name, properties)
        ahoy.track(event_name, properties) if respond_to?(:ahoy)
      end
    end
  end
end
