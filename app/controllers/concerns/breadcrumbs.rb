# This will be automatically shared with Inertia props
# Each breadcrumb should be a hash with :label and optional :href keys
# Example: set_breadcrumbs([{ label: "Home", href: "/" }, { label: "Products" }])

module Breadcrumbs
  extend ActiveSupport::Concern

  included { helper_method :breadcrumbs }

  class_methods do
    def with_breadcrumb(label:, href: nil)
      before_action -> do
                      @breadcrumbs ||= []

                      @breadcrumbs << {
                        label: label.is_a?(Proc) ? instance_exec(&label) : label,
                        href: href.is_a?(Proc) ? instance_exec(&href) : href,
                      }
                    end
    end
  end

  protected

  def with_breadcrumb(label:, href: nil)
    @breadcrumbs ||= []

    @breadcrumbs << { label:, href: }
  end

  def set_breadcrumbs(crumbs = [])
    @breadcrumbs = crumbs
  end

  def breadcrumbs
    @breadcrumbs || []
  end
end
