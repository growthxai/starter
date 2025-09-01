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
- **TypeScript strict** - Avoid `any`, prefer interfaces over types
- **shadcn first** - Use shadcn/ui components when available
- **Performance minded** - Database indexing, query optimization, React.memo

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
    render inertia: "projects/index",
           props: {
             projects: Project.includes(:owner).page(params[:page]),
           }
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
```

## Common Patterns to Follow

✅ Use Inertia.js for all routing
✅ Follow RESTful conventions
✅ Use shadcn/ui components
✅ Implement proper TypeScript types
✅ Add database indexes
✅ Handle errors gracefully
✅ Write tests for critical paths

## Anti-Patterns to Avoid

❌ Using React Router instead of Inertia
❌ Returning JSON from controllers (use `render inertia:`)
❌ Using `any` type in TypeScript
❌ Custom CSS when Tailwind utilities exist
❌ Missing database indexes on foreign keys
❌ Exposing sensitive data in responses
❌ Class components (use functional)
❌ Prop drilling (use Context or composition)
