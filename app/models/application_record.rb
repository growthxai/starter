class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  def self.newest
    order(created_at: :desc).first
  end

  def self.oldest
    order(created_at: :asc).first
  end
end
