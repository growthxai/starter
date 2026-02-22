module Breadcrumbable
  extend ActiveSupport::Concern

  included { inertia_share breadcrumbs: -> { breadcrumbs } }

  private

  def breadcrumb(text, href = nil)
    @breadcrumbs ||= []
    @breadcrumbs << { text: text, href: href }
    nil
  end

  def breadcrumbs
    @breadcrumbs || []
  end
end
