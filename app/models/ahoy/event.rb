class Ahoy::Event < ApplicationRecord
  include Ahoy::QueryMethods

  self.table_name = "ahoy_events"

  belongs_to :visit
  belongs_to :user, optional: true
end

# == Schema Information
#
# Table name: ahoy_events
#
#  id         :uuid             not null, primary key
#  name       :string
#  properties :jsonb
#  time       :datetime
#  user_id    :uuid
#  visit_id   :uuid
#
# Indexes
#
#  index_ahoy_events_on_account_id     (((properties ->> 'account_id'::text)))
#  index_ahoy_events_on_name_and_time  (name,time)
#  index_ahoy_events_on_project_id     (((properties ->> 'project_id'::text)))
#  index_ahoy_events_on_properties     (properties) USING gin
#  index_ahoy_events_on_time_and_name  (time,name)
#  index_ahoy_events_on_user_id        (user_id)
#  index_ahoy_events_on_visit_id       (visit_id)
#  index_ahoy_events_on_workspace_id   (((properties ->> 'workspace_id'::text)))
#
