# Rails 8 + React 19 + Inertia.js + Shadcn/UI Starter Kit

A modern, production-ready full-stack starter kit for building SaaS applications with Rails and React.

## 🚀 Features

- **Rails 8.0** with PostgreSQL
- **React 19** with TypeScript
- **Inertia.js** for seamless SPA experience without the API complexity
- **Shadcn/UI** components with Tailwind CSS v4
- **Vite** for lightning-fast HMR and builds
- **SolidQueue** for background jobs
- **SolidCache** for caching
- **SolidCable** for Action Cable
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

```bash
# macOS
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-client
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
# Create database, load schemas, and seed
bundle exec rails db:setup

# You should see: "Seed data created successfully!"
```

### Step 5: Start the Development Server

```bash
# Start Rails, Vite, and SolidQueue
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
│   ├── controllers/
│   │   └── concerns/
│   │       ├── breadcrumbable.rb     # Breadcrumb DSL
│   │       ├── react_layout.rb       # Layout selection
│   │       └── inertia_configuration.rb
│   ├── models/
│   ├── views/
│   │   └── shared/
│   │       └── _pagination.json.jbuilder  # Pagy pagination partial
│   ├── frontend/
│   │   ├── pages/                    # Inertia page components
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn/UI components
│   │   │   ├── pagination.tsx        # Pagination wrapper
│   │   │   └── workspace-sidebar.tsx
│   │   ├── layouts/
│   │   │   ├── application.tsx       # Default layout
│   │   │   ├── workspace.tsx         # Sidebar + header
│   │   │   └── fullscreen.tsx        # Minimal layout
│   │   ├── types/
│   │   │   └── pagination.ts         # PaginationData interface
│   │   ├── lib/
│   │   │   └── layout-resolver.ts    # Dynamic layout resolution
│   │   └── hooks/
│   └── jobs/
├── config/
│   ├── routes.rb
│   ├── database.yml
│   └── initializers/
├── db/
│   ├── migrate/
│   └── seeds.rb
└── test/
```

## 🛠️ Common Customizations

### Adding a New Page with Workspace Layout

The starter includes three layouts:

- **ApplicationLayout** - Default, minimal layout for public pages
- **WorkspaceLayout** - Sidebar + header with breadcrumbs for authenticated pages
- **FullscreenLayout** - No chrome, for focused tasks (onboarding, auth)

1. Create a Rails controller with layout and breadcrumbs:

```ruby
# app/controllers/dashboard_controller.rb
class DashboardController < ApplicationController
  react_layout "workspace"

  def show
    breadcrumb "Dashboard"
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

### Using Breadcrumbs

Breadcrumbs are server-driven and automatically displayed in the WorkspaceLayout header. Call `breadcrumb(text, href)` in your controller actions — the last item (no `href`) renders as plain text, others as links:

```ruby
class ProjectsController < ApplicationController
  react_layout "workspace"

  def show
    @project = Project.find(params[:id])

    breadcrumb "Projects", projects_path
    breadcrumb @project.name
  end
end
```

For nested resources, use `before_action` to build a shared prefix:

```ruby
class Projects::TasksController < ApplicationController
  react_layout "workspace"
  before_action :set_project
  before_action :set_base_breadcrumbs

  def index
    breadcrumb "Tasks"
  end

  def show
    @task = @project.tasks.find(params[:id])

    breadcrumb "Tasks", project_tasks_path(@project)
    breadcrumb @task.title
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_base_breadcrumbs
    breadcrumb "Projects", projects_path
    breadcrumb @project.name, project_path(@project)
  end
end
```

### Using Pagination

The starter includes a pagination component that works with Pagy and js-routes:

1. In your controller:

```ruby
def index
  @pagy, @projects = pagy(Project.all)
  render inertia: "projects/index"
end
```

2. In your jbuilder view (`app/views/projects/index.json.jbuilder`):

```ruby
json.projects @projects, partial: "projects/project", as: :project
json.partial! "shared/pagination", pagy: @pagy
```

3. In your React component:

```tsx
import Pagination from '@/components/pagination';
import { projects_path } from '@/rails/routes';
import type { PaginationData } from '@/types/pagination';

interface Props {
  projects: Project[];
  pagination: PaginationData;
}

export default function Index({ projects, pagination }: Props) {
  return (
    <div>
      {/* Your project list */}
      <Pagination pagination={pagination} pathBuilder={projects_path} />
    </div>
  );
}
```

## 🤝 Contributing to the Starter Kit

If you're improving the starter kit itself (not building an app from it), you don't need to clone or rename anything. Just work directly in the repo.

### Quick Setup

```bash
# Install tool versions
mise install && mise trust

# Install dependencies
bundle install && yarn install

# Set up the database
bundle exec rails db:setup

# Start the dev server
bin/dev
```

The app runs at http://localhost:3000.

### Before Committing

Always run the quality checks:

```bash
bin/check
```

This runs Prettier formatting, the test suite, and Rubocop. All three must pass.

### Guidelines

- Follow the conventions in `CLAUDE.md` — it's the source of truth for patterns and architecture decisions
- Use jbuilder views for Inertia props, not inline `props:` in controllers
- Keep controllers to the 7 standard RESTful actions
- Use `kebab-case` for all frontend filenames
- Run `bin/check` before every commit
