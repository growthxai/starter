key = local_assigns[:key] ? "#{local_assigns[:key]}_pagination" : :pagination

json.set! key do
  json.page pagy.page
  json.per_page pagy.limit
  json.total pagy.count
  json.total_pages pagy.last
  json.prev_page pagy.previous
  json.next_page pagy.next
end
