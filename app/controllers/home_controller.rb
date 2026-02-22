class HomeController < ApplicationController
  react_layout "workspace"

  def index
    breadcrumb "Home"
  end

  def show
  end
end
