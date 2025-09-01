require "sidekiq/web"

Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }

  root "home#index"
  get "home/show", to: "home#show", as: :home_show

  # Add your application routes here

  # Health check
  get "up" => "rails/health#show", :as => :rails_health_check

  # Sidekiq Web UI (admin only)
  # authenticate :user do
  mount Sidekiq::Web => "/sidekiq"
  # end
end
