if Rails.env.development?
  MissionControl::Jobs.http_basic_auth_enabled = false
else
  MissionControl::Jobs.http_basic_auth_enabled = true
  MissionControl::Jobs.http_basic_auth_username =
    ENV.fetch("MISSION_CONTROL_HTTP_BASIC_AUTH_USERNAME")
  MissionControl::Jobs.http_basic_auth_password =
    ENV.fetch("MISSION_CONTROL_HTTP_BASIC_AUTH_PASSWORD")
end
