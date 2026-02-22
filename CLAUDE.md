# Claude Development Guide

**Philosophy:** Vanilla Rails backend + Simple plain React frontend, connected by Inertia.js.

## Core Principles

- **Rich domain models** over service objects
- **CRUD controllers** over custom actions (7 standard actions only)
- **Concerns** for horizontal code sharing
- **Records as state** over boolean columns
- **Jbuilder for ALL props** — use jbuilder views for Inertia props, never inline `props:`
- **No React Router** — Inertia.js handles all routing
- **Shadcn as Design System** — code in `app/frontend/components/ui` should not be changed
- **Build it yourself** before reaching for gems
- **Plan first** — share work plan before coding complex features
- **TypeScript strict** — avoid `any`, prefer interfaces over types
- **Performance minded** — database indexing, query optimization, jbuilder caching

**Stack:** Rails 8.0 + React 19 + TypeScript + Inertia.js + Vite + shadcn/ui + Tailwind CSS

---

## Rails Backend

### Models & Concerns

Heavy use of concerns for horizontal behavior:

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  include Archivable, Publishable, Searchable

  belongs_to :account
  has_many :tasks, dependent: :destroy

  validates :name, presence: true
end
```

**Concern structure (self-contained):**

```ruby
# app/models/project/archivable.rb
module Project::Archivable
  extend ActiveSupport::Concern

  included do
    has_one :archive, dependent: :destroy

    scope :archived, -> { joins(:archive) }
    scope :active, -> { where.missing(:archive) }
  end

  def archived?
    archive.present?
  end

  def active?
    !archived?
  end

  def archive!(user: Current.user)
    transaction { create_archive!(user: user) } unless archived?
  end

  def unarchive!
    archive&.destroy if archived?
  end
end
```

**Use enum `prefix:` / `suffix:` instead of manual predicates:**

```ruby
# GOOD: prefix generates scraping_pending?, scraping_completed?, etc.
enum :status,
     %w[pending processing completed failed].index_by(&:itself),
     prefix: true,
     validate: true

project.status_completed? # auto-generated
project.status_pending! # auto-generated
```

**Plain module when no `included` block:**

If a concern only adds methods (no associations, callbacks, scopes, or class-level config), use a plain module:

```ruby
# GOOD: No included block needed — plain module
module Project::SeoMetadata
  def meta_title
    meta_tag_value("title") || title
  end
end

# BAD: ActiveSupport::Concern with no included block
module Project::SeoMetadata
  extend ActiveSupport::Concern

  def meta_title
    meta_tag_value("title") || title
  end
end
```

**Keep associations minimal — let Rails infer:**

Rails resolves `class_name` and `foreign_key` automatically from the model's namespace and association name. Only specify them when the defaults are wrong.

```ruby
# GOOD: Rails infers Project::Task from has_many :tasks inside Project
class Project < ApplicationRecord
  has_many :tasks, dependent: :destroy
  belongs_to :account
end

# BAD: Redundant options that Rails already infers
class Project < ApplicationRecord
  has_many :tasks, class_name: "Project::Task", foreign_key: :project_id, dependent: :destroy
  belongs_to :account, class_name: "Account", foreign_key: :account_id
end

# GOOD: Specify only when the default is wrong
belongs_to :creator, class_name: "User" # FK isn't user_id
```

**State as records (not booleans):**

Instead of `archived: boolean`, create a separate record:

```ruby
# BAD: Boolean column
class Project < ApplicationRecord
  scope :archived, -> { where(archived: true) }
end

# GOOD: Separate record
class Archive < ApplicationRecord
  belongs_to :project, touch: true
  belongs_to :user, optional: true
  # created_at gives you when, user gives you who
end

class Project < ApplicationRecord
  has_one :archive, dependent: :destroy

  scope :archived, -> { joins(:archive) }
  scope :active, -> { where.missing(:archive) }
end
```

**Naming conventions:**

Verb methods for actions: `project.archive!`, `project.publish`, `task.complete`

Predicate methods for state: `project.archived?`, `project.active?`, `task.completed?`

Bang methods (`!`) only when a non-bang counterpart exists:

```ruby
# GOOD: Bang has a non-bang counterpart
project.archive # returns false on failure
project.archive! # raises on failure

# BAD: Bang with no counterpart
def processing_completed!
  update!(status: "completed")
end

# GOOD: No bang needed — it's the only version
def complete_processing
  update!(status: "completed")
end
```

Concern naming (adjectives): `Archivable`, `Publishable`, `Searchable`, `Assignable`

Controller naming (nouns): `Projects::ArchivesController`, `Posts::PublicationsController`

**Prefer `if/else` over guard clauses for branching logic:**

```ruby
# GOOD: if/else for branching logic
def reading_time
  count = word_count || 0

  if count < 200
    "Less than 1 min"
  else
    minutes = (count / 200.0).ceil
    "#{minutes} min read"
  end
end

# BAD: Guard clause used as branching
def reading_time
  return "Less than 1 min" if (word_count || 0) < 200

  minutes = ((word_count || 0) / 200.0).ceil
  "#{minutes} min read"
end
```

### Controllers (DHH Style)

Follow RESTful conventions with the standard seven actions only:

- `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`

**Thin controllers, rich models:**

```ruby
# GOOD: Controller just orchestrates
class Projects::ArchivesController < ApplicationController
  def create
    @project = Project.find(params[:project_id])
    @project.archive! # All logic in model
    redirect_to projects_path, notice: "Project archived"
  end

  def destroy
    @project = Project.find(params[:project_id])
    @project.unarchive! # All logic in model
    redirect_to project_path(@project), notice: "Project restored"
  end
end
```

**RESTful resource controllers:**

Extract custom actions into their own resource controllers. The goal is avoiding bloated controllers with custom actions.

```ruby
# BAD: Custom actions in main controller
class ProjectsController < ApplicationController
  def archive # Not one of the 7 standard actions
    @project.archive!
  end
end

# GOOD: Extract to separate resource controller
class Projects::ArchivesController < ApplicationController
  def create
    @project = Project.find(params[:project_id])
    @project.archive!
    redirect_to projects_path, notice: "Project archived"
  end
end
```

**Choosing singular vs plural:**

| Use `resource` (singular) | Use `resources` (plural)  |
| ------------------------- | ------------------------- |
| One instance per parent   | Many instances per parent |
| No `:id` in URL           | `:id` in URL              |
| `archive`, `publication`  | `memberships`, `comments` |

**Controller concerns for scoping:**

```ruby
# app/controllers/concerns/project_scoped.rb
module ProjectScoped
  extend ActiveSupport::Concern

  included { before_action :set_project }

  private

  def set_project
    @project = Project.find(params[:project_id])
  end
end
```

**Private method formatting:**

- No blank line after `private`
- Indent all methods below `private` by 2 spaces

```ruby
# GOOD
class MyController < ApplicationController
  def index
    # ...
  end

  private

  def set_resource
    @resource = Resource.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name)
  end
end
```

### Jbuilder for Inertia Props

**IMPORTANT:** Use jbuilder views for ALL Inertia props. Avoid inline `props:` hash in controllers.

With `default_render = true` and `component_path_resolver`, controllers don't need explicit `render inertia:` calls when using jbuilder views:

```ruby
# Controller — no render call needed (default_render handles it)
class ProjectsController < ApplicationController
  def index
    @pagy, @projects = pagy(Project.includes(:owner))
  end
end
```

Place jbuilder files in `app/views/` matching controller namespace:

```
app/views/
├── projects/
│   ├── index.json.jbuilder
│   ├── show.json.jbuilder
│   └── _project.json.jbuilder
└── shared/
    └── _pagination.json.jbuilder
```

**Basic view:**

```ruby
# app/views/projects/index.json.jbuilder
json.projects @projects, partial: "project", as: :project
json.partial! "shared/pagination", pagy: @pagy
```

**Caching with json.cache!:**

```ruby
# app/views/projects/_project.json.jbuilder
json.cache! [project, local_assigns[:show_stats]] do
  json.(project, :id, :name, :slug, :description)
  json.stats project.stats_data if local_assigns[:show_stats]
end
```

**Jbuilder best practices:**

- Use jbuilder for ALL controllers
- Use partials for reusable JSON structures
- Cache with `json.cache!` for expensive queries
- Use `json.(model, :attr1, :attr2)` for multiple attributes
- Use short partial paths — `"project"` not `"projects/project"` when in the same directory
- Never use inline `props:` hash in controllers
- Don't put business logic in jbuilder views
- Don't N+1 queries (use `includes` in controller)
- Don't double-nest arrays: `json.projects @projects, partial:` not `json.projects { json.array! @projects, partial: }`

### Routes

```ruby
Rails.application.routes.draw do
  root "home#index"

  resources :projects do
    scope module: :projects do
      # Singular: one per project
      resource :archive, only: %i[create destroy]
      resource :publication, only: [:create]

      # Plural: many per project
      resources :tasks, only: %i[index create destroy]
    end
  end
end
```

**Key patterns:**

- `scope module:` to nest controllers without nesting URLs
- `param: :slug` for SEO-friendly URLs
- Singular `resource` for one-per-parent, plural `resources` for many-per-parent

### Database Patterns

- Add indexes for foreign keys and frequently queried columns
- Use `includes`, `joins`, `select` for query optimization
- Use `touch: true` for cache invalidation

**Prefer ActiveRecord query interface over raw SQL:**

```ruby
# GOOD: Range syntax
where(started_at: 30.minutes.ago..)
where(score: ..100)
where(created_at: 1.week.ago..1.day.ago)

# BAD: Raw SQL for simple comparisons
where("started_at > ?", 30.minutes.ago)
```

Raw SQL is fine for genuinely complex queries (subqueries, database-specific functions).

### Background Jobs (SolidQueue)

**Shallow jobs, rich models:**

```ruby
# app/jobs/process_project_job.rb
class ProcessProjectJob < ApplicationJob
  def perform(project)
    project.process # Model does the work
  end
end
```

**`_later` and `_now` convention:**

```ruby
module Project::Processable
  def process_later
    ProcessProjectJob.perform_later(self)
  end

  def process_now
    # actual processing logic
  end
end
```

### Validations & Error Handling

**Minimal validations:**

```ruby
class Project < ApplicationRecord
  validates :name, presence: true # Only what's needed
end
```

**Let it crash (bang methods):**

```ruby
def create
  @comment = @project.comments.create!(comment_params) # Raises on failure
end
```

---

## React & Frontend

### File Naming (CRITICAL)

**All frontend files use kebab-case (including folders):**

```
app/frontend/pages/projects/components/project-card.tsx     # GOOD
app/frontend/pages/projects/components/ProjectCard.tsx       # BAD
```

When renaming files, use `git mv` to preserve history (especially on case-insensitive filesystems).

### Resource-Based Architecture

Frontend mirrors Rails resources, NOT abstract features:

```
app/frontend/pages/
├── projects/                 # Resource: Projects
│   ├── index.tsx            # ProjectsController#index
│   ├── show.tsx             # ProjectsController#show
│   ├── new.tsx              # ProjectsController#new
│   ├── edit.tsx             # ProjectsController#edit
│   └── components/          # Components ONLY for this resource
│       ├── card.tsx
│       └── form.tsx
├── tasks/                   # Resource: Tasks
└── memberships/             # Resource: Memberships
```

**Key principles:**

- Each resource folder is self-contained
- Components in resource folders are NOT shared
- Extract to `/app/frontend/components` only when used by 2+ resources

### Component Extraction Rules

1. **Start in the resource** - Build components in the resource folder first
2. **Extract when needed** - Only when 2+ resources need the same component
3. **Make it generic** - Remove resource-specific logic when extracting
4. **Place in shared folder** - Move to `/components/base/`

### Shadcn Component Usage

IMPORTANT: **DO NOT modify `/components/ui/` files** - these are Shadcn defaults.

```tsx
// Use composition
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline">Save</Button>
  </CardContent>
</Card>

// Use asChild for custom elements
<Button asChild>
  <Link href={projects_path()}>View Projects</Link>
</Button>
```

If you need custom behavior, create a wrapper in `/components/base/`.

### State Management

**Avoid Context API** - rely on backend state via Inertia.js shared props:

```tsx
// GOOD: Shared props via Inertia
const { currentPath } = usePage<SharedProps>().props;
```

### Inertia.js Forms

**Use `<Form>` for most forms** (preferred):

```tsx
import { Form } from '@inertiajs/react';
import { projects_path } from '@/rails/routes';

<Form method="post" action={projects_path()}>
  {({ errors, processing }) => (
    <>
      <input type="text" name="name" />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit" disabled={processing}>
        Create
      </button>
    </>
  )}
</Form>;
```

**Use `useForm` only for programmatic control** (dynamic validation, multi-step forms):

```tsx
const { data, setData, post, processing, errors } = useForm({ email: '' });
```

**Navigation with js-routes:**

```tsx
import { router } from '@inertiajs/react';
import { projects_path, project_path } from '@/rails/routes';

router.visit(projects_path());
projects_path({ q: 'rails', page: 2 }); // "/projects?q=rails&page=2"
```

### When NOT to Use useEffect

Per [React docs](https://react.dev/learn/you-might-not-need-an-effect):

| Anti-pattern                   | Better approach                      |
| ------------------------------ | ------------------------------------ |
| Computing derived data         | Calculate during render or `useMemo` |
| Event-triggered logic          | Keep in event handlers               |
| Fetching on user action        | Trigger in handler, not Effect       |
| Resetting state on prop change | Use `key` prop to remount            |
| Chained Effects                | Calculate everything in one place    |

```tsx
// BAD: Effect syncs state
const [items, setItems] = useState([]);
const [filtered, setFiltered] = useState([]);
useEffect(() => {
  setFiltered(items.filter((i) => i.active));
}, [items]);

// GOOD: Compute during render
const filtered = useMemo(() => items.filter((i) => i.active), [items]);
```

**Valid useEffect uses:**

- Fetching data on mount (with cleanup)
- Setting up subscriptions/event listeners (with cleanup)
- Syncing with external systems (DOM, third-party libs)

### Styling & Text Colors

**Prefer semantic colors:**

```tsx
text - foreground; // Primary text
text - muted - foreground; // Secondary text
text - destructive; // Error states
text - primary; // Brand color highlights
```

**For sentiment/status** (when semantically appropriate):

```tsx
text - green - 600; // Positive sentiment, success
text - red - 600; // Negative sentiment, errors
text - yellow - 600; // Warning states
```

**Avoid** hard-coded grays — prefer semantic colors (`text-muted-foreground` over `text-gray-400`).

### Error Handling

Use `trackError()` instead of `console.error()`:

```typescript
import { trackError } from '@/lib/error-tracking';

// GOOD: Tracks to Sentry with auto-detected context
trackError('Failed to load data', error);

// BAD: Only logs to console
console.error('Failed to load data', error);
```

---

## TypeScript Guidelines

```typescript
// Prefer interfaces for object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

// Use type for unions and intersections
type Status = 'pending' | 'active' | 'archived';

// Avoid any, use unknown for truly unknown types
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}
```

**Naming conventions:**

- PascalCase for types and interfaces
- camelCase for variables and functions
- UPPER_CASE for constants
- Descriptive names with auxiliary verbs (isLoading, hasError)

---

## Testing

**Minitest, not RSpec.**

**Don't test the framework:**

```ruby
# BAD: Testing that Rails associations work
test "belongs to account" do
  assert_equal accounts(:one), projects(:one).account
end

# GOOD: Test business logic
test "calculates completion rate from tasks" do
  assert_in_delta 75.0, projects(:one).completion_rate, 0.01
end
```

**What to test:** Business logic, scopes with complex logic, custom validations, model methods that transform/aggregate data, edge cases.

**What NOT to test:** Framework features (associations, validations, delegated_type), database indexes, that `belongs_to` works.

**Controller test standards:**

```ruby
require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test "index renders projects" do
    get projects_path

    assert_response :success
  end

  test "create with valid params adds project" do
    assert_difference -> { Project.count } do
      post projects_path, params: { project: { name: "New Project" } }, as: :json
    end

    assert_redirected_to project_path(Project.last)
  end

  test "create with invalid params does not add project" do
    assert_no_difference -> { Project.count } do
      post projects_path, params: { project: { name: "" } }, as: :json
    end
  end
end
```

**Standards:**

- Controller tests are integration tests (`ActionDispatch::IntegrationTest`)
- GET actions assert success and don't inspect JSON shape
- POST/PATCH tests use `as: :json` to match Inertia param format
- Write/update actions have both valid and invalid param tests
- Use `assert_difference` / `assert_no_difference` for create/destroy

**Fixtures over factories:**

```yaml
# test/fixtures/projects.yml
one:
  name: 'First Project'
  account: one
  status: active
```

Reference fixtures inline — don't create instance variables just to reference them.

---

## Available Code Review Agents

### Rails Routes & Controller Auditor

Use when you need to review controllers and routes for DHH's RESTful conventions:

- Controllers with more than 7 actions (red flag)
- Custom methods that should be separate resources
- Proper use of nested resources

**Example transformations:**

- `GroupsController#add_user` → `MembershipsController#create`
- `PostsController#publish` → `PublicationsController#create`
- `CasesController#close` → `ClosuresController#create`

---

## Environment & Workflow

**IMPORTANT: Never commit or push changes unless explicitly asked by the user.**

**Package Manager:** Use `yarn` (not npm) for JavaScript packages.

```bash
# Development
bin/dev                              # Start development server
bundle exec rails console            # Rails console
bundle exec rails db:migrate         # Run migrations

# Testing & Quality
bundle exec rails test               # Run all tests
bundle exec rubocop                  # Ruby linting
yarn prettier --check .              # Check formatting
bin/check                            # Run all quality checks

# Database
bin/sync_prod                        # Sync production data (requires DATABASE_URL)
```

### bin/check - Pre-commit Quality Checks

```bash
bin/check
```

Runs: formatting check, test suite, rubocop. Always run before committing.

---

## Quick Reference

| Prefer                                  | Over                                             |
| --------------------------------------- | ------------------------------------------------ |
| Jbuilder views for all Inertia props    | Inline `props:` hash in controllers              |
| Model concerns for business logic       | Service objects, interactors, commands           |
| 7 standard controller actions           | Custom controller actions (extract to resources) |
| `kebab-case.tsx` for frontend files     | `PascalCase.tsx` filenames                       |
| Inertia.js for routing                  | React Router                                     |
| Shadcn components (don't modify `/ui/`) | Custom components when shadcn exists             |
| `if/else` for branching                 | Guard clauses for branching logic                |
| Range syntax `.where(col: val..)`       | Raw SQL for simple comparisons                   |
| Let Rails infer associations            | Redundant `class_name:`, `foreign_key:`          |
| Enum `prefix:`/`suffix:` for predicates | Manual predicate methods                         |
| Fixtures in tests                       | Factory patterns                                 |
| `trackError()` for errors               | `console.error()`                                |
| `yarn` for packages                     | `npm`                                            |
| Plain module when no `included` block   | `ActiveSupport::Concern` without `included`      |
| `<Form>` component for forms            | `useForm` for simple forms                       |
