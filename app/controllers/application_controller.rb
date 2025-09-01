class ApplicationController < ActionController::Base
  include InertiaConfiguration
  include PageTitleConcern
  include Analytics::Base
  include Analytics::Providers::Ahoy

  protect_from_forgery with: :exception
  before_action :set_paper_trail_whodunnit

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  protected

  def after_sign_out_path_for(scope)
    root_path
  end
end
