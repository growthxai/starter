class Ahoy::Store < Ahoy::DatabaseStore
  # Customize visit tracking if needed
  def track_visit(data)
    # Add custom visit data if needed
    super(data)
  end

  def track_event(data)
    # Add custom event data if needed
    super(data)
  end
end

# Enable API for frontend tracking
Ahoy.api = true

# Enable geocoding
# Ahoy.geocode = true

# Only create visits when needed (when events require them)
# This works well with our skip_before_action for Inertia requests
Ahoy.server_side_visits = :when_needed

# IMPORTANT: Ensure cookies work properly in development
# Without this, every request creates a new visit
Ahoy.cookie_options = {
  same_site: :lax,
  httponly: false, # Allow JavaScript to read the cookie
}

# Optional: Adjust visit duration to match typical user sessions
# Ahoy.visit_duration = 30.minutes

# Optional: Configure for GDPR compliance
# Ahoy.mask_ips = true
# Ahoy.cookies = :none
