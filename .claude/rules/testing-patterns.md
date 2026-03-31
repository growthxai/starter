---
description: Testing conventions — Minitest, fixtures, controller tests, what to test
paths:
  - 'test/**'
---

# Testing Patterns Reference

Detailed testing examples and standards. Read this before writing any tests.

---

## Minitest, not RSpec

```ruby
class ProjectTest < ActiveSupport::TestCase
  test "calculates completion rate" do
    assert_in_delta 75.0, projects(:one).completion_rate, 0.01
  end
end
```

## Don't Test the Framework

Rails, Active Record, and Ruby are well-tested. Don't write tests for framework features.

```ruby
# ❌ BAD: Testing that Rails associations work
test "belongs to account" do
  assert_equal accounts(:one), projects(:one).account
end

# ❌ BAD: Testing that database indexes work
test "indexes account_id" do
  # Database indexes will work, no need to test
end

# ✅ GOOD: Test business logic, not framework
test "calculates completion rate from tasks" do
  assert_in_delta 75.0, projects(:one).completion_rate, 0.01
end
```

## What to Test

- Business logic and calculation methods
- Scopes and query methods with complex logic
- Custom validations beyond presence/format
- Model methods that transform or aggregate data
- Edge cases and boundary conditions

## What NOT to Test

- Framework features (associations, validations, delegated_type)
- Database indexes and constraints
- That `belongs_to` or `has_many` works
- That callbacks fire (unless testing custom callback logic)

---

## Controller Test Standards

```ruby
require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup { sign_in users(:one) }

  test "index renders projects" do
    get projects_path

    assert_response :success
  end

  test "show renders project" do
    get project_path(projects(:one))

    assert_response :success
  end

  test "new renders form" do
    get new_project_path

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

  test "edit renders form" do
    get edit_project_path(projects(:one))

    assert_response :success
  end

  test "update with valid params saves project" do
    project = projects(:one)
    assert_equal "First Project", project.name

    patch project_path(project), params: { project: { name: "Updated" } }, as: :json

    assert_equal "Updated", project.reload.name
    assert_redirected_to project_path(project)
  end

  test "update with invalid params does not save project" do
    project = projects(:one)
    assert_equal "First Project", project.name

    patch project_path(project), params: { project: { name: "" } }, as: :json

    assert_equal "First Project", project.reload.name
  end

  test "destroy removes project" do
    assert_difference -> { Project.count }, -1 do
      delete project_path(projects(:one))
    end

    assert_redirected_to projects_path
  end
end
```

### General Standards

- Controller tests are integration tests. They inherit from `ActionDispatch::IntegrationTest`, NOT the deprecated `ActionController::TestCase`.
- Setup is minimal. Just sign in a user that has permission to manage the resource.
- Never create simple records within a controller test. Use existing fixtures. If no fixtures exist, create them. Only create records within a test if a complex setup is necessary for that specific test.

### Action-Specific Standards

- Tests for read-only actions (GET index, show, new, edit) just assert success. They do NOT assert anything about the shape or contents of the JSON response.
- Tests for create actions (POST create) should wrap the call to the action with assertions about record counts changing and jobs being enqueued (if applicable).
- Tests for update actions (PATCH update) should assert a value before and after the call to the action to confirm the change.
- Tests that take params (POST create, PATCH update) should use `as: :json` to match how Inertia submits params to Rails.
- Actions that take params (POST create, PATCH update) should have two tests each (if applicable): one `with valid params` that asserts the changes and one `with invalid params` that asserts no changes occurred.
- Tests for destroy actions (DELETE destroy) should wrap the call to the action with an assertion about record counts changing.

---

## Fixtures over Factories

```yaml
# test/fixtures/projects.yml
one:
  name: 'First Project'
  account: one
  status: active
```

---

## Instance Variables in Tests

Only create instance variables for objects that are **created or modified** in setup and used across multiple tests. Don't create instance variables just to reference fixtures - even if used in multiple tests, modern editors make it easy to change with multi-cursor editing or find-and-replace.

```ruby
# ❌ BAD: Unnecessary instance variables for fixtures
class ProjectTest < ActiveSupport::TestCase
  setup do
    @account = accounts(:one)
    @project = projects(:one)
  end

  test "belongs to account" do
    assert_equal @account, @project.account
  end
end

# ✅ GOOD: Reference fixtures inline everywhere
class ProjectTest < ActiveSupport::TestCase
  test "belongs to account" do
    assert_equal accounts(:one), projects(:one).account
  end

  test "is active" do
    assert projects(:one).active?
  end
end

# ✅ GOOD: Instance variable only when creating/modifying objects in setup
class ProjectStatsTest < ActiveSupport::TestCase
  setup do
    @project = Project.create!(name: "Test", account: accounts(:one))
    @project.tasks.create!(name: "Task 1", completed: true)
    @project.tasks.create!(name: "Task 2", completed: false)
  end

  test "calculates completion rate" do
    assert_in_delta 50.0, @project.completion_rate, 0.01
  end
end
```
