class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :omniauthable,
         omniauth_providers: [:google_oauth2]

  has_many :visits, class_name: "Ahoy::Visit", dependent: :nullify

  def self.from_google(auth)
    where(email: auth[:email]).first_or_create do |user|
      user.email = auth[:email]
      user.name = auth[:full_name] if user.respond_to?(:name=)
      user.password = SecureRandom.uuid
    end
  end
end
