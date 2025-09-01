class HomeController < ApplicationController
  def index
    render inertia: "home/index",
           props: {
             message: "Welcome to your Rails + React + Inertia.js app!",
           }
  end
end
