class HomeController < ApplicationController
  react_layout "workspace"
  with_breadcrumb label: "Home", href: -> { root_path }

  def index
    render inertia: "home/index",
           props: {
             message: "Welcome to your Rails + React + Inertia.js app!",
           }
  end

  def show
    render inertia_modal: "home/show",
           props: {
             title: "Modal Example",
             content: "This is rendered in a modal! The URL changes and you can bookmark it.",
             timestamp: Time.current.to_s,
           },
           base_url: root_path
  end
end
