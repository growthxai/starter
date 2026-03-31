---
description: Rails backend conventions — models, concerns, controllers, jbuilder, routes, database, jobs
paths:
  - '**/*.rb'
  - 'app/views/**/*.jbuilder'
---

# Rails Patterns Reference

Detailed code examples and patterns for Rails backend development. Read this before writing any Rails code.

---

## Models & Concerns

### Concern Structure (self-contained)

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  include Archivable, Publishable, Searchable

  belongs_to :account
  has_many :tasks, dependent: :destroy

  validates :name, presence: true
end
```

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

  def archive(user: Current.user)
    transaction { create_archive!(user: user) } unless archived?
  end

  def unarchive(user: Current.user)
    archive&.destroy if archived?
  end
end
```

### Enum with prefix/suffix

```ruby
# ✅ GOOD: prefix generates status_pending?, status_completed?, etc.
enum :status,
     %w[pending processing completed failed].index_by(&:itself),
     prefix: true,
     validate: true

project.status_completed? # auto-generated
project.status_pending! # auto-generated

# ❌ BAD: Manual predicates that duplicate what prefix provides
enum :status, %w[pending processing completed failed].index_by(&:itself)

def status_completed?
  status == "completed"
end
```

### Plain module when no `included` block

```ruby
# ✅ GOOD: No included block needed — plain module
module Project::SeoMetadata
  def meta_title
    meta_tag_value("title") || title
  end
end

# ❌ BAD: ActiveSupport::Concern with no included block
module Project::SeoMetadata
  extend ActiveSupport::Concern

  def meta_title
    meta_tag_value("title") || title
  end
end
```

### Keep associations minimal — let Rails infer

```ruby
# ✅ GOOD: Rails infers Project::Task from has_many :tasks inside Project
class Project < ApplicationRecord
  has_many :tasks, dependent: :destroy
  belongs_to :account
end

# ❌ BAD: Redundant options that Rails already infers
class Project < ApplicationRecord
  has_many :tasks, class_name: "Project::Task", foreign_key: :project_id, dependent: :destroy
  belongs_to :account, class_name: "Account", foreign_key: :account_id
end

# ✅ GOOD: Specify only when the default is wrong
belongs_to :creator, class_name: "User" # FK isn't user_id
```

### State as records (not booleans)

```ruby
# ❌ BAD: Boolean column
class Project < ApplicationRecord
  scope :archived, -> { where(archived: true) }
  scope :active, -> { where(archived: false) }
end

# ✅ GOOD: Separate record
class Archive < ApplicationRecord
  belongs_to :project, touch: true
  belongs_to :user, optional: true
  # created_at gives you when, user gives you who
end

class Project < ApplicationRecord
  has_one :archive, dependent: :destroy

  scope :archived, -> { joins(:archive) }
  scope :active, -> { where.missing(:archive) }

  def archived?
    archive.present?
  end
end
```

**Benefits:** Timestamp of when it happened, who did it, easy scoping via `joins` and `where.missing`.

### POROs (Plain Old Ruby Objects)

Namespaced under parent model, for presentation and complex operations:

```
app/models/
├── project.rb
├── project/
│   ├── archivable.rb        # Concern
│   ├── summary.rb           # PORO for presentation
│   └── archive.rb           # ActiveRecord
```

```ruby
class Project::Summary
  attr_reader :project, :user

  def initialize(project, user)
    @project, @user = project, user
  end

  def to_html
    # Format project for display
  end

  def to_plain_text
    # Plain text version
  end
end
```

**When to use POROs:** Presentation logic, complex operations, view context bundling. NOT service objects.

### Naming conventions

Verb methods for actions:

```ruby
project.archive
project.publish
task.complete
```

Predicate methods for state:

```ruby
project.archived?
project.active?
task.completed?
```

Bang methods (`!`) only when a non-bang counterpart exists:

```ruby
# ✅ GOOD: Bang has a non-bang counterpart
project.archive # returns false on failure
project.archive! # raises on failure

# ✅ GOOD: Rails conventions — save/save!, create/create!, update/update!
@project.save # returns false
@project.save! # raises ActiveRecord::RecordInvalid

# ❌ BAD: Bang with no counterpart — just use a regular method name
def processing_completed! # there's no processing_completed
  update!(status: "completed")
end

# ✅ GOOD: No bang needed — it's the only version
def complete_processing
  update!(status: "completed")
end
```

Concern naming (adjectives): `Archivable`, `Publishable`, `Searchable`, `Assignable`

Controller naming (nouns): `Projects::ArchivesController`, `Posts::PublicationsController`

### if/else over guard clauses for branching

```ruby
# ✅ GOOD: if/else for branching logic
def reading_time
  count = word_count || 0

  if count < 200
    "Less than 1 min"
  else
    minutes = (count / 200.0).ceil
    "#{minutes} min read"
  end
end

# ❌ BAD: Guard clause used as branching
def reading_time
  return "Less than 1 min" if (word_count || 0) < 200

  minutes = ((word_count || 0) / 200.0).ceil
  "#{minutes} min read"
end
```

### Avoid needless memoization

```ruby
# ✅ GOOD: Expensive query — memoize
def projects
  @projects ||= user.projects.ordered_by_recently_accessed
end

# ❌ BAD: Simple delegation — no need to memoize
def path
  @path ||= UrlParser.new(url).path
end
```

### Current for request context

```ruby
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :session, :user
  attribute :request_id, :user_agent, :ip_address
end

# Usage in models
belongs_to :creator, class_name: "User", default: -> { Current.user }
```

---

## Method Call Style

### Backslash continuation with shorthand keyword syntax

When a method call has multiple keyword arguments that don't fit on one line, use backslash continuation with one argument per line. Use Ruby's shorthand keyword syntax when the argument name matches the local variable.

```ruby
# ✅ GOOD: Backslash continuation, one arg per line, shorthand syntax
Project.create_with_defaults name:, account:, creator: Current.user

# ✅ GOOD: Single argument stays on one line
project.complete!(tasks_completed: tasks.size)

# ❌ BAD: Parenthesized multi-line
Project.create_with_defaults(name: name, account: account, creator: Current.user)

# ❌ BAD: Redundant explicit values when shorthand works
Project.create_with_defaults name: name, account: account, creator: Current.user

# ❌ BAD: Multiple arguments crammed on one line
Project.create_with_defaults name:, account:, creator: Current.user
```

---

## Controllers (DHH Style)

### Thin controllers, rich models

```ruby
# ✅ GOOD: Controller just orchestrates
class Projects::ArchivesController < ApplicationController
  include ProjectScoped

  def create
    @project.archive! # All logic in model
    redirect_to projects_path, notice: "Project archived"
  end

  def destroy
    @project.unarchive! # All logic in model
    redirect_to project_path(@project), notice: "Project restored"
  end
end

# ❌ BAD: Business logic in controller
class Projects::ArchivesController < ApplicationController
  def create
    @project.transaction do
      @project.create_archive!(user: Current.user)
      @project.events.create!(action: :archived, creator: Current.user)
      NotificationMailer.project_archived(@project).deliver_later
    end
  end
end
```

### RESTful resource controllers

```ruby
# ❌ BAD: Custom actions in main controller
class GroupsController < ApplicationController
  def add_member # Not one of the 7 standard actions
    @group.members << User.find(params[:user_id])
  end
end

# ✅ GOOD: Extract to separate resource controller
class Groups::MembershipsController < ApplicationController
  def create
    @group = Group.find(params[:group_id])
    @group.members << User.find(params[:user_id])
    redirect_to @group, notice: "Member added"
  end

  def destroy
    @membership = Membership.find(params[:id])
    @membership.destroy
    redirect_to @membership.group, notice: "Member removed"
  end
end
```

### Singular vs plural

| Use `resource` (singular) | Use `resources` (plural)  |
| ------------------------- | ------------------------- |
| One instance              | Many instances            |
| No `:id` in URL           | Show with `:id` in URL    |
| `archive`, `publication`  | `memberships`, `comments` |

### Common transformations

| Custom action                 | Extract to                             |
| ----------------------------- | -------------------------------------- |
| `GroupsController#add_member` | `Groups::MembershipsController#create` |
| `PostsController#publish`     | `Posts::PublicationController#create`  |
| `ProjectsController#archive`  | `Projects::ArchiveController#create`   |
| `UsersController#comments`    | `Users::CommentsController#index`      |

### Controller concerns for scoping

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

### Authorization in controller, permission logic in model

```ruby
# Controller checks permission
class ProjectsController < ApplicationController
  before_action :ensure_permission, only: :destroy

  private

  def ensure_permission
    head :forbidden unless Current.user.can_administer_project?(@project)
  end
end

# Model defines what permission means
class User < ApplicationRecord
  def can_administer_project?(project)
    admin? || project.creator == self
  end
end
```

### Method ordering — dependency below dependent

Order private methods so that a method appears below the method that calls it. Read top-down: caller first, then its dependencies in the order they're used.

```ruby
# ✅ GOOD: build_targets calls grouped_pages and build_payload — both below it

private

def build_targets
  grouped_pages.map { |host, pages| build_payload(host, pages) }
end

def grouped_pages
  pages.group_by { |p| p.host }
end

def build_payload(host, pages)
  { host:, pages: pages.map(&:url) }
end

# ❌ BAD: Helper defined before the method that calls it

private

def grouped_pages
  pages.group_by { |p| p.host }
end

def build_targets
  grouped_pages.map { |host, pages| build_payload(host, pages) }
end

def build_payload(host, pages)
  { host:, pages: pages.map(&:url) }
end
```

### Private method formatting

```ruby
# ✅ GOOD: No blank line after private, indent by 2
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

# ❌ BAD: Blank line after private, no indent
class MyController < ApplicationController
  private

  def set_resource
    @resource = Resource.find(params[:id])
  end
end
```

---

## Jbuilder for Inertia Props

**Key rules:**

- Use partials for reusable JSON structures
- Cache with `json.cache!` for expensive queries
- Use `json.(model, :attr1, :attr2)` for multiple attributes
- Use short partial paths — `"project"` not `"projects/project"` when in the same directory
- Never use inline `props:` hash in controllers
- Don't put business logic in jbuilder views
- Don't N+1 queries (use `includes` in controller)
- Don't double-nest arrays: `json.projects @projects, partial:` not `json.projects { json.array! @projects, partial: }`

Place in `app/views/` matching controller namespace:

```
app/views/
├── projects/
│   ├── index.json.jbuilder
│   ├── show.json.jbuilder
│   └── _project.json.jbuilder
└── shared/
    └── _pagination.json.jbuilder
```

```ruby
# Basic view
json.q params[:q]
json.projects @projects, partial: "project", as: :project
json.partial! "shared/pagination", pagy: @pagy

# Caching
json.cache! [project, local_assigns[:show_stats]] do
  json.(project, :id, :name, :slug, :description)
  json.stats project.stats_data if local_assigns[:show_stats]
end
```

---

## Routes

```ruby
Rails.application.routes.draw do
  root "home#index"

  resources :projects do
    scope module: :projects do
      resource :archive, only: %i[create destroy] # Singular: one per project
      resource :publication, only: :create
      resources :tasks, only: %i[index create destroy] # Plural: many per project
    end
  end
end
```

### Nested resources

```ruby
resources :projects do
  scope module: :projects do
    resource :archive, only: %i[create destroy]
    resources :memberships, only: %i[index create destroy]
    resources :comments, only: %i[index create destroy]
  end
end
```

---

## Database Patterns

```ruby
# touch: true for cache invalidation
belongs_to :project, touch: true

# ✅ GOOD: Range syntax
where(started_at: 30.minutes.ago..)
where(score: ..100)
where(created_at: 1.week.ago..1.day.ago)

# ❌ BAD: Raw SQL for simple comparisons
where("started_at > ?", 30.minutes.ago)

# HTTP caching
fresh_when etag: [@projects, Current.user]

# Global ETags in ApplicationController
etag { "v1" }
```

---

## Background Jobs

```ruby
# Shallow jobs, rich models
class ProcessProjectJob < ApplicationJob
  def perform(project)
    project.process_now
  end
end

# _later and _now convention
module Project::Processable
  def process_later
    ProcessProjectJob.perform_later(self)
  end

  def process_now
    # actual processing logic
  end
end
```

---

## Validations

```ruby
# Minimal
validates :name, presence: true

# Contextual
validates :email_address, format: { with: URI::MailTo::EMAIL_REGEXP }, on: :creation
validates :full_name, presence: true, on: :completion

# Let it crash
@comment = @project.comments.create!(comment_params)
```
