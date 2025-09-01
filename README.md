# Rails 8 + React 19 + Inertia.js + Shadcn/UI Starter Kit

A modern, production-ready full-stack starter kit for building SaaS applications with Rails and React.

## 🚀 Features

- **Rails 8.0** with PostgreSQL
- **React 19** with TypeScript
- **Inertia.js** for seamless SPA experience without the API complexity
- **Shadcn/UI** components with Tailwind CSS v4
- **Vite** for lightning-fast HMR and builds
- **Devise** authentication with optional Google OAuth
- **Sidekiq** + Sidekiq-Cron for background jobs
- **Ahoy** for analytics tracking
- **Paper Trail** for audit logs
- **Sentry** for error tracking
- **Resend** for transactional emails
- **Lograge** for structured logging
- **Strong Migrations** for safe deployments

## 📋 Prerequisites

This project uses [mise](https://mise.jdx.dev/) for managing development environments. mise ensures everyone on your team uses the exact same versions of Ruby, Node.js, and other tools.

### Install mise

```bash
# macOS
brew install mise

# Or use the installer script
curl https://mise.run | sh

# Add to your shell (if not already done)
echo 'eval "$(mise activate bash)"' >> ~/.bashrc  # for bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc    # for zsh
```

### System Dependencies

You'll also need these installed on your system:

- PostgreSQL 14+ (check with `psql --version`)
- Redis 6+ (check with `redis-server --version`)

```bash
# macOS
brew install postgresql@14 redis

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-client redis-server
```

## 🎯 Getting Started - Step by Step

### Step 1: Clone and Rename Your Application

```bash
# Clone the starter kit with your app name
git clone git@github.com:growthxai/starter.git your-app-name
cd your-app-name

# Remove the original git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from Rails starter kit"
```

### Step 2: Rename Your Application

The starter kit comes with a convenient script to rename your application:

```bash
# Use the rename script - replace "YourApp" with your actual app name
bin/rename-app YourApp

# Examples:
# bin/rename-app MyAwesomeApp
# bin/rename-app ProjectManager
# bin/rename-app SaaSPlatform
```

This script will automatically:

- Update the module name in `config/application.rb`
- Update database names in `config/database.yml`
- Update cable channel prefix in `config/cable.yml`
- Update package name in `package.json`

After running the script, you'll need to:

1. Update the page title in `app/views/layouts/application.html.erb`
2. Drop and recreate your database (covered in Step 5)

### Step 3: Set Up Development Environment

```bash
# Install all required tool versions (Ruby, Node.js, Yarn)
mise install

# Trust the mise configuration for this project
mise trust

# Verify tools are installed
mise list

# Install Ruby dependencies
bundle install

# Install JavaScript dependencies
yarn install
```

**Note:** For local environment overrides, create `mise.toml.local` (gitignored):

```toml
# mise.toml.local - Local overrides (not committed)
[env]
DATABASE_URL = "postgres://localhost/my_custom_db"
```

### Step 4: Set Up the Database

```bash
# Create and migrate the database
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed

# You should see: "Seed data created successfully!"
```

### Step 5: Start the Development Server

```bash
# Start Rails, Vite, and Sidekiq
./bin/dev

# Your app is now running at http://localhost:3000
```

Visit http://localhost:3000 and you should see the welcome page! 🎉

## 🔑 Managing Secrets with Rails Credentials

Rails provides encrypted credentials for managing sensitive data like API keys and passwords. Never commit secrets to git!

### Understanding Rails Credentials

Rails uses encrypted YAML files to store secrets:

- `config/credentials/development.yml.enc` - Development environment secrets
- `config/credentials/production.yml.enc` - Production environment secrets
- `config/credentials/test.yml.enc` - Test environment secrets

Each environment has its own encryption key:

- `config/credentials/development.key` - Never commit this!
- `config/credentials/production.key` - Never commit this!

### Adding Secrets

```bash
# Edit development credentials
EDITOR="code --wait" rails credentials:edit --environment development

# Or use nano/vim
EDITOR="nano" rails credentials:edit --environment development
```

This opens a YAML file where you add your secrets:

```yaml
# Example credentials file
stripe:
  publishable_key: pk_test_51ABC...
  secret_key: sk_test_51ABC...

aws:
  access_key_id: AKIA...
  secret_access_key: abc123...

google:
  client_id: 123456789.apps.googleusercontent.com
  client_secret: GOCSPX-abc123...

resend:
  api_key: re_abc123...

# You can organize however makes sense
third_party:
  service_a:
    api_key: key_abc123
  service_b:
    token: token_xyz789
```

### Accessing Credentials in Code

```ruby
# In Rails controllers, models, etc.
Rails.application.credentials.stripe[:secret_key]
Rails.application.credentials.aws[:access_key_id]
Rails.application.credentials.dig(:third_party, :service_a, :api_key)

# In environment variables (for gems that expect ENV vars)
# Add to config/initializers/credentials.rb:
ENV["STRIPE_SECRET_KEY"] = Rails.application.credentials.stripe[:secret_key]
```

### Team Collaboration

To share credentials with your team:

1. Share the key file securely (1Password)
2. **Team member setup**:

   ```bash
   # Create the key file
   mkdir -p config/credentials
   echo "your-key-here" > config/credentials/development.key

   # Verify it works
   rails credentials:show --environment development
   ```

## 🔐 Setting Up Google OAuth (Optional)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" for your project

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Add authorized redirect URIs:
   - `http://localhost:3000/users/auth/google_oauth2/callback` (development)
   - `https://yourdomain.com/users/auth/google_oauth2/callback` (production)
6. Click "Create"

### Step 3: Configure Your Application

```bash
# Add to your .env file
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Test OAuth Login

1. Restart your Rails server: `./bin/dev`
2. Visit http://localhost:3000
3. You should now see a "Sign in with Google" option on the login page

## 📧 Setting Up Email with Resend

1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env` file:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```
4. Update `app/mailers/application_mailer.rb` with your "from" email
5. Test email sending in Rails console:
   ```ruby
   UserMailer.welcome_email(User.first).deliver_now
   ```

## 🎨 Working with Shadcn/UI Components

The starter kit comes with Shadcn/UI pre-configured. To add new components:

```bash
# See all available components
npx shadcn@latest add

# Add a specific component (e.g., card)
npx shadcn@latest add card

# Add multiple components
npx shadcn@latest add card badge alert
```

Components are added to `app/frontend/components/ui/` and can be imported anywhere:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

## 🏗️ Project Structure

```
your-app/
├── app/
│   ├── controllers/        # Rails controllers
│   ├── models/             # ActiveRecord models
│   ├── views/              # ERB templates (minimal with Inertia)
│   ├── frontend/
│   │   ├── pages/          # Inertia page components
│   │   ├── components/     # Reusable React components
│   │   │   └── ui/        # Shadcn/UI components
│   │   ├── layouts/        # React layout components
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
│   └── jobs/              # Background jobs
├── config/
│   ├── routes.rb          # Rails routes
│   ├── database.yml       # Database configuration
│   └── initializers/      # Rails initializers
├── db/
│   ├── migrate/           # Database migrations
│   └── seeds.rb          # Seed data
└── test/                 # Test files
```

## 🛠️ Common Customizations

### Adding a New Page

1. Create a Rails controller action:

```ruby
# app/controllers/dashboard_controller.rb
class DashboardController < ApplicationController
  def show
    render inertia: "dashboard/show", props: { stats: { users: User.count } }
  end
end
```

2. Create the React component:

```tsx
// app/frontend/pages/dashboard/show.tsx
interface Props {
  stats: { users: number };
}

export default function Show({ stats }: Props) {
  return <div>Total users: {stats.users}</div>;
}
```

3. Add the route:

```ruby
# config/routes.rb
resource :dashboard
```
