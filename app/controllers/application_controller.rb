class ApplicationController < ActionController::Base
  include Pagy::Backend
  include InertiaConfiguration
  include PageTitleConcern
  include Breadcrumbable
  include ReactLayout
  include Analytics::Base
  include Analytics::Providers::Ahoy

  protect_from_forgery with: :exception

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
end
