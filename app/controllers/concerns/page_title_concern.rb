# app/controllers/concerns/page_title_concern.rb
module PageTitleConcern
  extend ActiveSupport::Concern

  included do
    # Make page_title available as a helper method in views if needed
    helper_method :page_title if respond_to?(:helper_method)
  end

  protected

  # Set the page title for the current action
  # This will be automatically shared with Inertia props
  # and used in analytics tracking
  def set_page_title(title)
    @page_title = title
  end

  # Getter for the page title
  def page_title
    @page_title
  end
end
