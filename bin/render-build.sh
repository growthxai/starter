#!/usr/bin/env bash

# exit on error
set -o errexit

while [ $# -gt 0 ] ; do
  case $1 in
    -s | --skip-migrations) SKIP_MIGRATE=true ;;
  esac
  shift
done

bundle install
bundle exec rails assets:precompile RAILS_ENV=production
# bundle exec vite build
bundle exec rails assets:clean
[[ $SKIP_MIGRATE == true ]] || bundle exec rails db:migrate
