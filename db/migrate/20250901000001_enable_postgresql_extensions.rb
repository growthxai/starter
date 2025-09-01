class EnablePostgresqlExtensions < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pgcrypto"
    enable_extension "pg_trgm"
    enable_extension "pg_stat_statements"
  end
end
