# Allows controllers to specify which React layout to use via:
#
#   class DashboardController < ApplicationController
#     react_layout "workspace"  # Layout with sidebar
#   end
#
# Available layouts:
# - "workspace" - Authenticated pages with sidebar navigation
# - "fullscreen" - No chrome, used for focused tasks (e.g., onboarding, auth)
# - Default (nil) - Uses ApplicationLayout for public pages

module ReactLayout
  extend ActiveSupport::Concern

  included { class_attribute :_react_layout, default: nil }

  class_methods do
    def react_layout(name)
      self._react_layout = name.to_s
      inertia_share react_layout: -> { self.class._react_layout }
    end
  end
end
