Rails.application.routes.draw do
  root "home#index"
  get "home/show", to: "home#show", as: :home_show

  # Add your application routes here

  # Health check
  get "up" => "rails/health#show", :as => :rails_health_check

  # Job dashboard
  mount MissionControl::Jobs::Engine, at: "/jobs"
end
