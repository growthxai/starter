# Claude Development Guide

**Primary Guidelines:** This document provides comprehensive development guidelines for Rails + React + TypeScript + Inertia.js + shadcn/ui applications.

## Environment Setup

**Package Manager:** This project uses Yarn for JavaScript package management. Always use `yarn` instead of `npm` for consistency.

**Tool Management:** This project may use tool version managers (mise, asdf, rbenv, etc.). When available, prefix commands to ensure correct tool versions.

```bash
# Check for available tool managers
which mise || which asdf

# Examples with different managers:
mise exec -- bundle exec rails test     # with mise
asdf exec bundle exec rails test        # with asdf
bundle exec rails test                  # direct execution

# Always use yarn for JavaScript packages
yarn install                            # Install dependencies
yarn add [package-name]                 # Add new packages
yarn run [script-name]                  # Run scripts
```

## Architecture Overview

**Stack:** Rails 8.0 + React 19 + TypeScript + Inertia.js + Vite + shadcn/ui + Tailwind CSS

**Key Principles:**

- **Plan first** - Share work plan before coding complex features
- **Rails conventions** - Follow DHH-style Rails patterns
- **No React Router** - Use Inertia.js for all routing (`render inertia:`)
- **Jbuilder for props** - Use jbuilder views for Inertia props, never inline `props:`
- **Pagy pagination** - Use Pagy gem with jbuilder partials for consistent pagination
- **TypeScript strict** - Avoid `any`, prefer interfaces over types
- **shadcn first** - Use shadcn/ui components when available
- **Performance minded** - Database indexing, query optimization, React.memo, jbuilder caching

## Available Code Review Agents

### Rails Routes & Controller Auditor

This specialized agent helps ensure your Rails application follows DHH's RESTful conventions. Use it when you need to:

- **Review controller actions** - Ensure controllers stick to the 7 standard RESTful actions
- **Audit routes** - Check for proper resource-based routing patterns
- **Identify refactoring opportunities** - Find custom actions that should be extracted into resources
- **Transform anti-patterns** - Convert verb-based methods into noun-based resources

**When to use this agent:**

- After adding new functionality to controllers
- When you have custom actions like `add_user`, `remove_user`, `archive`, `publish`
- When setting up new routes and want to ensure RESTful design
- During code reviews to maintain consistency with Rails conventions

**What it checks for:**

- Controllers with more than 7 actions (red flag)
- Custom methods that should be separate resources
- Proper use of nested resources
- Clean, semantic URLs that identify resources, not actions
- Correct HTTP verb usage for operations

**Example transformations:**

- `GroupsController#add_user` → `MembershipsController#create`
- `PostsController#publish` → `PublicationsController#create`
- `CasesController#close` → `ClosuresController#create`
- `AccountsController#upgrade_plan` → `SubscriptionsController#create`

## Rails Backend Guidelines

### Controllers (DHH Style)

Follow RESTful conventions with the standard seven actions:

- `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`

```ruby
class ProjectsController < ApplicationController
  def index
    @pagy, @projects = pagy(Project.includes(:owner))
    render inertia: "projects/index" # Uses app/views/projects/index.json.jbuilder
  end

  def create
    @project = Project.new(project_params)

    if @project.save
      redirect_to @project, notice: "Project created successfully"
    else
      redirect_back fallback_location: projects_path, inertia: { errors: @project.errors }
    end
  end

  private

  def project_params
    params.require(:project).permit(:name, :description)
  end
end
```

### Singular Resource Controllers for Custom Actions

**CRITICAL PATTERN**: When you need custom actions beyond the standard 7, extract them into separate singular resource controllers. This keeps your code RESTful and follows DHH's philosophy.

#### ❌ Bad: Custom actions in main controller

```ruby
class ProjectsController < ApplicationController
  # ... standard 7 actions ...

  # ❌ Custom actions pollute the controller
  def archive
    @project = Project.find(params[:id])
    @project.archive!
    redirect_to projects_path
  end

  def publish
    @project = Project.find(params[:id])
    @project.publish!
    redirect_to project_path(@project)
  end
end
```

#### ✅ Good: Extract to singular resource controllers

```ruby
# app/controllers/projects/archives_controller.rb
class Projects::ArchivesController < ApplicationController
  def create
    @project = Project.find(params[:project_id])
    @project.archive!
    redirect_to projects_path, notice: "Project archived"
  end
end

# app/controllers/projects/publications_controller.rb
class Projects::PublicationsController < ApplicationController
  def create
    @project = Project.find(params[:project_id])
    @project.publish!
    redirect_to project_path(@project), notice: "Project published"
  end
end
```

**Routes for singular resources:**

```ruby
resources :projects do
  scope module: :projects do
    resource :archive, only: [:create] # POST /projects/:project_id/archive
    resource :publication, only: [:create] # POST /projects/:project_id/publication
  end
end
```

**Benefits:**

- Each controller has a single, clear responsibility
- RESTful URLs and HTTP verbs
- Easy to test and maintain
- Follows Rails conventions

**Common Patterns:**

```ruby
# Bulk operations
resource :bulk_deletion, only: [:create]
resource :bulk_approval, only: [:create]

# State transitions
resource :activation, only: %i[create destroy]
resource :approval, only: [:create]
```

### Jbuilder Views for Inertia Props

This project uses **jbuilder views** to structure JSON props for Inertia.js. This approach provides better organization, caching, and separation of concerns compared to inline props.

#### How It Works

When you call `render inertia: "projects/index"`, Rails automatically looks for a jbuilder view at `app/views/projects/index.json.jbuilder` thanks to the `inertia_view_assigns` method in `InertiaConfiguration`.

Place jbuilder files in `app/views/` matching your controller namespace:

```
app/views/
├── projects/
│   ├── index.json.jbuilder
│   ├── show.json.jbuilder
│   └── _project.json.jbuilder
└── shared/
    └── _pagination.json.jbuilder
```

#### Basic Jbuilder View

```ruby
# app/views/projects/index.json.jbuilder
json.projects { json.array! @projects, partial: "projects/project", as: :project }

json.partial! "shared/pagination", pagy: @pagy
```

```ruby
# app/views/projects/_project.json.jbuilder
json.(project, :id, :name, :description, :created_at)
json.owner { json.(project.owner, :id, :name, :email) }
```

#### Caching with json.cache!

Use `json.cache!` to cache expensive computations. Rails automatically invalidates when the model updates:

```ruby
# app/views/projects/_project.json.jbuilder
show_stats = local_assigns[:show_stats]

json.cache! [project, show_stats] do
  json.(project, :id, :name, :description)

  if show_stats
    json.task_count project.tasks.count
    json.completion_rate project.completion_rate
  end
end
```

**Cache key tips:**

- Include model instance for automatic invalidation
- Include local variables that affect output (`[project, show_stats]`)
- Nested `json.cache!` blocks for granular control

#### Shared Partials with Pagy Pagination

The `shared/_pagination.json.jbuilder` partial works with Pagy gem:

```ruby
# app/views/shared/_pagination.json.jbuilder
key = local_assigns[:key] ? "#{local_assigns[:key]}_pagination" : :pagination

json.set! key do
  json.page pagy.page
  json.per_page pagy.limit
  json.total pagy.count
  json.total_pages pagy.last
  json.prev_page pagy.previous
  json.next_page pagy.next
end
```

**Usage in controller:**

```ruby
class ProjectsController < ApplicationController
  include Pagy::Method

  def index
    @pagy, @projects = pagy(Project.all, limit: 20)
    render inertia: "projects/index"
  end
end
```

**Usage in jbuilder:**

```ruby
# app/views/projects/index.json.jbuilder
json.projects { json.array! @projects, partial: "projects/project", as: :project }

# Default key (pagination)
json.partial! "shared/pagination", pagy: @pagy

# Custom key (projects_pagination)
json.partial! "shared/pagination", pagy: @pagy, key: "projects"
```

**Frontend usage:**

```tsx
// app/frontend/pages/projects/index.tsx
interface Props {
  projects: Project[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export default function Index({ projects, pagination }: Props) {
  // Use pagination data for UI
}
```

#### Partials with Conditional Data

Use `local_assigns` to make partials flexible:

```ruby
# app/views/projects/_project.json.jbuilder
show_stats = local_assigns[:show_stats]
show_owner = local_assigns.fetch(:show_owner, true)

json.cache! [project, show_stats, show_owner] do
  json.(project, :id, :name, :description)

  json.owner project.owner, partial: "users/user", as: :user if show_owner

  if show_stats
    json.stats do
      json.task_count project.tasks.count
      json.completion_rate project.completion_rate
    end
  end
end
```

**Call with parameters:**

```ruby
json.projects @projects do |project|
  json.partial! "projects/project", project: project, show_stats: true, show_owner: false
end
```

#### ETags for HTTP Caching

Combine jbuilder caching with HTTP ETags for maximum performance:

```ruby
class ProjectsController < ApplicationController
  def show
    @project = Project.find(params[:id])

    # ETag includes model and request type
    if stale?(strong_etag: [@project, request.inertia?])
      render inertia: "projects/show" # Uses jbuilder view
    end
  end
end
```

**Benefits:**

- Browser caches entire response
- Rails sends 304 Not Modified if unchanged
- Works with Inertia.js partial reloads

#### Jbuilder Best Practices

**Do:**

- ✅ Use jbuilder views instead of inline props for better organization
- ✅ Use partials for reusable JSON structures
- ✅ Cache with `json.cache!` for expensive queries
- ✅ Include cache keys that affect output
- ✅ Use `json.(model, :attr1, :attr2)` for multiple attributes
- ✅ Keep jbuilder views focused on data presentation
- ✅ Mirror controller namespaces in view directories

**Don't:**

- ❌ Put business logic in jbuilder views (belongs in models)
- ❌ N+1 queries (use `includes` in controller)
- ❌ Forget to cache nested associations
- ❌ Mix inline props and jbuilder in same controller

### Models

- Use concerns for shared behavior
- Focus on data relationships and validations
- Use scopes for common queries
- Validate data integrity at model level

```ruby
class Project < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }

  scope :active, -> { where(archived: false) }
  scope :recent, -> { order(created_at: :desc) }
end
```

### Database Best Practices

- Add indexes for foreign keys and frequently queried columns
- Use `includes`, `joins`, `select` for query optimization
- Keep migrations reversible when possible

## React Frontend Guidelines

### Component Structure

```tsx
// app/frontend/pages/projects/index.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@inertiajs/react'

interface Props {
  projects: Project[];
  currentPage: number;
  totalPages: number;
}

export default function Index({ projects, currentPage, totalPages }: Props) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="//rojects/new">New Project</a>
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-muted-foreground">{project.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### React Patterns

- Use functional components exclusively
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- Implement proper TypeScript typing

### State Management

- Use useState for local component state
- Use useReducer for complex state logic
- Use Context API for shared state
- Keep state close to where it's used
- **Avoid prop drilling** - Use Context when passing data through multiple levels

#### Avoiding Prop Drilling with Context

When you find yourself passing props through multiple component layers just to reach a deeply nested child, use Context instead:

```tsx
// ❌ Bad: Prop drilling through multiple levels
function App() {
  const [user, setUser] = useState<User>();
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

function Sidebar({ user, setUser }) {
  return <UserProfile user={user} setUser={setUser} />;
}

// ✅ Good: Using Context for cross-cutting concerns
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState<User>();
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// Clean component hierarchy
function App() {
  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}

function Dashboard() {
  return <Sidebar />;
}

function Sidebar() {
  return <UserProfile />;
}

function UserProfile() {
  const { user, setUser } = useUser();
  // Direct access to user data without prop drilling
}
```

**When to use Context:**

- Data needed by many components at different nesting levels (user, theme, locale)
- Avoiding "prop plumbing" through intermediate components
- Cross-cutting concerns that many components need access to

**When NOT to use Context:**

- Simple parent-child relationships (just use props)
- Frequently changing data that would cause many re-renders
- Component-specific state that doesn't need to be shared

### Performance Optimization

- Implement proper memoization (useMemo, useCallback)
- Use React.memo for expensive components
- Implement lazy loading where appropriate
- Use proper key props in lists

## TypeScript Guidelines

### Type System

```typescript
// Prefer interfaces for object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

// Use type for unions and intersections
type Status = 'pending' | 'active' | 'archived';
type UserWithStatus = User & { status: Status };

// Avoid any, use unknown for truly unknown types
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}
```

### Naming Conventions

- PascalCase for types and interfaces
- camelCase for variables and functions
- UPPER_CASE for constants
- Descriptive names with auxiliary verbs (isLoading, hasError)

## Inertia.js Integration

### Page Structure

Mirror Rails controller structure in React pages:

```
app/frontend/pages/
├── projects/
│   ├── index.tsx    # projects#index
│   ├── show.tsx     # projects#show
│   ├── new.tsx      # projects#new
│   └── edit.tsx     # projects#edit
└── users/
    └── index.tsx    # users#index
```

### Navigation with JS Routes

This project uses `js-routes` gem to generate type-safe route helpers from Rails routes. Routes are automatically generated to `app/javascript/routes.js` and `routes.d.ts`.

```tsx
import { router } from '@inertiajs/react';
import { projects_path, project_path, edit_project_path } from '@/rails/routes';

// Type-safe route helpers
const projectsUrl = projects_path(); // "/projects"
const projectUrl = project_path(projectId); // "/projects/123"
const editProjectUrl = edit_project_path(projectId); // "/projects/123/edit"

// With query parameters
const searchUrl = projects_path({ q: 'rails', page: 2 }); // "/projects?q=rails&page=2"

// Programmatic navigation with js-routes
router.visit(projects_path());
router.post(projects_path(), data);

// Link component with js-routes
import { Link } from '@inertiajs/react';
<Link href={projects_path()}>View Projects</Link>;
```

**Generating Routes:**

```bash
# Generate routes (done automatically in development and CI)
bundle exec rake js:routes

# Routes are generated to:
# - app/javascript/routes.js (JavaScript implementation)
# - app/javascript/routes.d.ts (TypeScript definitions)
```

The `@/rails` alias in Vite config maps to `app/javascript/`, making imports clean and consistent.

### Forms with Inertia

```tsx
import { useForm } from '@inertiajs/react';

function ProjectForm() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/projects');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
      {errors.name && <span>{errors.name}</span>}
      <button disabled={processing}>Submit</button>
    </form>
  );
}
```

## shadcn/ui & Styling Guidelines

### Component Usage

Always check shadcn/ui documentation for latest patterns:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Use composition pattern
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter name" />
    <Button variant="outline">Save</Button>
  </CardContent>
</Card>

// Use asChild for custom elements
<Button asChild>
  <a href="/login">Sign In</a>
</Button>
```

### Tailwind CSS

- Use utility-first approach
- Mobile-first responsive design
- Dark mode support
- Semantic color naming

```tsx
<div className="container mx-auto p-4 md:p-6 lg:p-8">
  <h1 className="text-foreground text-2xl font-bold md:text-3xl">Title</h1>
  <p className="text-muted-foreground mt-2">Description text</p>
</div>
```

## Testing Guidelines

### Rails Testing

```ruby
require "test_helper"

class ProjectTest < ActiveSupport::TestCase
  test "should not save project without name" do
    project = Project.new
    assert_not project.save
    assert_includes project.errors[:name], "can't be blank"
  end
end
```

### System Tests

```ruby
require "application_system_test_case"

class ProjectsTest < ApplicationSystemTestCase
  test "creating a project" do
    visit projects_url
    click_on "New Project"

    fill_in "Name", with: "Test Project"
    click_on "Create Project"

    assert_text "Project created successfully"
  end
end
```

## Security Best Practices

- Use strong parameters in controllers
- Never expose sensitive data in logs
- Implement CSRF protection
- Validate and sanitize user input
- Use encrypted credentials for secrets

## Developer Tools & Utilities

### Layout Resolver

This project uses a **layout resolver** to automatically assign layouts based on page paths, avoiding duplication between client-side and SSR rendering.

**How it works:**

```typescript
// app/frontend/lib/layout-resolver.ts
export default function resolvePageLayout(name: string, page: any): any {
  if (page.default.layout) {
    return page; // Use explicit layout if specified
  }

  page.default.layout = (pageComponent: any) => {
    const pageProps = pageComponent.props || {};

    // Can add conditional logic here:
    // if (name.startsWith('admin/')) return AdminLayout

    return createElement(ApplicationLayout, { ...pageProps }, pageComponent);
  };

  return page;
}
```

**Usage in entrypoint:**

```typescript
// app/frontend/entrypoints/inertia.ts
import resolvePageLayout from '../lib/layout-resolver';

createInertiaApp({
  resolve: (name): any => {
    const pages = import.meta.glob<any>('../pages/**/*.tsx', { eager: true });
    const page = pages[`../pages/${name}.tsx`];
    return resolvePageLayout(name, page);
  },
  // ...
});
```

**Benefits:**

- Automatic layout assignment based on page path
- Single source of truth for layout logic
- Works with both client-side and SSR
- Easy to extend with custom logic

### PgSync - Production Database Sync

This project includes **pgsync** for safely syncing production data to development environments.

**Configuration:**

```yaml
# .pgsync.yml
from: $(echo $DATABASE_URL)?sslmode=require
to: postgres://localhost:5432/starter_development

exclude:
  - active_storage_attachments
  - active_storage_blobs
  - ahoy_events
  - ahoy_visits
  - schema_migrations

# Data anonymization
data_rules:
  email: unique_email
  phone: unique_phone
  '*password*': null
  '*token*': null
  '*secret*': null
```

**Usage:**

```bash
# Set DATABASE_URL to production database
export DATABASE_URL=postgres://user:pass@host:5432/dbname

# Sync all tables (respecting excludes and anonymization)
bin/sync_prod

# Or inline:
DATABASE_URL=postgres://... bin/sync_prod
```

**Safety features:**

- Data anonymization for sensitive fields
- Excluded tables (sessions, logs, analytics)
- Truncates before sync to avoid duplicates
- Sequential jobs to prevent deadlocks

### bin/check - Pre-commit Quality Checks

Run all quality checks before committing:

```bash
bin/check
```

This script runs:

1. `npm run format:check` - Code formatting
2. `bin/rails test` - Test suite
3. `bin/rubocop` - Ruby linting

**Recommended workflow:**

```bash
# Make changes
git add .

# Run checks
bin/check

# If all pass, commit
git commit -m "Your message"
```

### Ahoy + Inertia Integration

This project uses **Ahoy** for analytics with special handling for Inertia.js requests.

**How it works:**

The `Analytics::Providers::Ahoy` concern automatically skips duplicate visit tracking for Inertia requests:

```ruby
# app/controllers/concerns/analytics/providers/ahoy.rb
def skip_ahoy_tracking?
  return false unless inertia_request?

  visit_token = cookies[:ahoy_visit]
  return false unless visit_token

  visit = ::Ahoy::Visit.find_by(visit_token: visit_token)
  return false unless visit

  # Only skip if visit is still within the duration window
  (Time.current - visit.started_at) < ::Ahoy.visit_duration
end
```

**Why this matters:**

- Inertia.js uses AJAX for subsequent page loads
- Without this, each Inertia navigation creates a new visit
- With this, visits are only tracked on initial page load or after expiry
- Provides accurate visitor analytics

**Tracking custom events:**

```ruby
class ProjectsController < ApplicationController
  def create
    @project = Project.new(project_params)

    if @project.save
      track("project_created", project_id: @project.id)
      redirect_to @project
    end
  end
end
```

### Additional Development Gems

**letter_opener** (development):

- Opens emails in browser instead of sending
- Automatic with Rails development mode
- View at `/letter_opener` when emails are sent

**vcr** (test):

- Records HTTP interactions for tests
- Prevents hitting external APIs in tests
- Fast and deterministic test runs

```ruby
# test/test_helper.rb
VCR.configure do |config|
  config.cassette_library_dir = "test/vcr_cassettes"
  config.hook_into :webmock
end

# In tests
VCR.use_cassette("api_call") do
  # HTTP request is recorded/replayed
  response = HTTParty.get("https://api.example.com/data")
end
```

## Pre-Commit Checklist

```bash
# Run tests
bundle exec rails test

# Check Ruby style
bundle exec rubocop

# Format code
yarn prettier --write .

# Type checking
yarn tsc --noEmit

# Build check
yarn build
```

## Common Commands

```bash
# Setup
bundle install
yarn install

# Development
bin/dev                              # Start development server
bundle exec rails console            # Rails console
bundle exec rails generate model     # Generate model
bundle exec rails db:migrate         # Run migrations

# Testing
bundle exec rails test               # Run all tests
bundle exec rails test test/models   # Run specific tests

# Code quality
bundle exec rubocop                  # Ruby linting
yarn prettier --check .              # Check formatting
yarn tsc                             # TypeScript checking
bin/check                            # Run all quality checks

# Database
bin/sync_prod                        # Sync production data (requires DATABASE_URL)
```

## Common Patterns to Follow

### Controllers & Routes

✅ Use Inertia.js for all routing (no React Router)
✅ Follow RESTful conventions with 7 standard actions
✅ Extract custom actions into singular resource controllers
✅ Use jbuilder views for Inertia props (not inline props)

### Data & Performance

✅ Use Pagy for pagination with jbuilder partials
✅ Cache jbuilder views with `json.cache!`
✅ Add database indexes on foreign keys
✅ Use `includes` to prevent N+1 queries
✅ Implement ETags for HTTP caching

### Frontend

✅ Use shadcn/ui components when available
✅ Implement proper TypeScript types (avoid `any`)
✅ Use layout resolver for automatic layout assignment
✅ Context API to avoid prop drilling

### Testing & Quality

✅ Write tests for critical paths
✅ Run bin/check before committing
✅ Use VCR for HTTP interactions in tests
✅ Handle errors gracefully

## Anti-Patterns to Avoid

### Controllers & Routes

❌ Custom actions in main resource controllers (extract to singular resources)
❌ Controllers with more than 7 actions
❌ Inline props in controllers (use jbuilder views)
❌ Returning JSON directly from controllers (use `render inertia:`)

### Data & Performance

❌ Missing database indexes on foreign keys
❌ N+1 queries (use `includes`, `joins`)
❌ Forgetting to cache expensive jbuilder computations
❌ Business logic in jbuilder views (belongs in models)

### Frontend

❌ Using React Router instead of Inertia
❌ Using `any` type in TypeScript
❌ Class components (use functional)
❌ Prop drilling (use Context or composition)
❌ Custom CSS when Tailwind utilities exist

### Security & Data

❌ Exposing sensitive data in responses
❌ Syncing production data without anonymization
❌ Committing secrets to repository
