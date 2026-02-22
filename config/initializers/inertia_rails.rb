InertiaRails.configure do |config|
  config.ssr_enabled = ViteRuby.config.ssr_build_enabled
  config.version = ViteRuby.digest
  config.deep_merge_shared_data = true
  config.always_include_errors_hash = true
  config.default_render = true
end

InertiaRailsContrib.configure { |config| config.enable_inertia_ui_modal = true }
