class ApplicationHealthCheckController < ActionController::Base
  rescue_from(Exception) { render_down }

  def show
    render_up
  end

  private

  def render_up
    version_info = {
      version: current_version,
      deployed_at: deployed_at,
      status: "up",
      timestamp: Time.current.iso8601,
    }

    respond_to do |format|
      format.html { render html: html_status(color: "green") }
      format.json { render json: version_info }
    end
  end

  def render_down
    error_info = { status: "down", timestamp: Time.current.iso8601 }

    respond_to do |format|
      format.html { render html: html_status(color: "red"), status: 500 }
      format.json { render json: error_info, status: 500 }
    end
  end

  def html_status(color:)
    version_display = current_version ? "v#{current_version}" : "unknown"
    %(<!DOCTYPE html>
      <html>
        <head>
          <title>Application Health Check</title>
          <style>
            body {
              background-color: #{color};
              color: white;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              flex-direction: column;
            }
            .version {
              font-size: 14px;
              opacity: 0.8;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>#{color == "green" ? "Application is UP" : "Application is DOWN"}</h1>
          <div class="version">#{version_display}</div>
        </body>
      </html>).html_safe
  end

  def current_version
    Rails.cache.read("current_version") || "unknown"
  end

  def deployed_at
    Rails.cache.read("deployed_at") || Time.current.iso8601
  end
end
