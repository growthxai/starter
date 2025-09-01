ActiveSupport.on_load(:active_record) do
  require "paper_trail"
  PaperTrail::Version.class_eval { belongs_to :user, foreign_key: :whodunnit, optional: true }
end
