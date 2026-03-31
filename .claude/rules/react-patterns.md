---
description: React frontend conventions — components, state, forms, styling, TypeScript
paths:
  - 'app/frontend/**'
---

# React & Frontend Patterns Reference

Detailed code examples for React frontend development. Read this before writing any frontend code.

---

## File Naming (CRITICAL)

**All frontend files use kebab-case (including folders):**

```
✅ project-card.tsx
✅ use-project-data.ts
✅ project-form.tsx

❌ ProjectCard.tsx
❌ useProjectData.ts
❌ ProjectForm.tsx
```

When renaming files, use `git mv` to preserve history (especially on case-insensitive filesystems):

```bash
git mv ProjectCard.tsx project-card.tsx
```

---

## Resource-Based Architecture

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
├── tasks/                   # Resource: Tasks (not "project-management")
└── memberships/             # Resource: Memberships
```

**Key principles:**

- Each resource folder is self-contained
- Components in resource folders are NOT shared
- Extract to `/app/frontend/components` only when used by 2+ resources
- Features span resources; organize by resource, not feature

---

## Component Extraction Rules

1. **Start in the resource** - Build components in the resource folder first
2. **Extract when needed** - Only when 2+ resources need the same component
3. **Make it generic** - Remove resource-specific logic when extracting
4. **Place in shared folder** - Move to `/components/base/`

```tsx
// Step 1: Resource-specific component
// pages/projects/components/project-card.tsx
export function ProjectCard({ project }: { project: Project }) {
  return <div>{project.name}</div>;
}

// Step 2: Extract when Tasks also needs a card
// components/base/card.tsx
export function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

---

## Shadcn Component Usage

IMPORTANT: **DO NOT modify `/components/ui/` files** - these are Shadcn defaults.

```tsx
// ✅ Use composition
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline">Save</Button>
  </CardContent>
</Card>

// ✅ Use asChild for custom elements
<Button asChild>
  <Link href={login_path()}>Sign In</Link>
</Button>
```

If you need custom behavior, create a wrapper in `/components/base/`.

---

## State Management

**Avoid Context API** - rely on backend state via Inertia.js shared props:

```tsx
// ✅ GOOD: Shared props via Inertia
const { user } = usePage<SharedProps>().props;
```

---

## Inertia.js Forms

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
router.visit(projects_path());
projects_path({ q: 'rails', page: 2 }); // "/projects?q=rails&page=2"
```

---

## When NOT to Use useEffect

Per [React docs](https://react.dev/learn/you-might-not-need-an-effect):

| Anti-pattern                   | Better approach                      |
| ------------------------------ | ------------------------------------ |
| Computing derived data         | Calculate during render or `useMemo` |
| Event-triggered logic          | Keep in event handlers               |
| Fetching on user action        | Trigger in handler, not Effect       |
| Resetting state on prop change | Use `key` prop to remount            |
| Chained Effects                | Calculate everything in one place    |

```tsx
// ❌ BAD: Effect watches state
const [open, setOpen] = useState(false);
useEffect(() => {
  if (open) fetchData();
}, [open]);

// ✅ GOOD: Handler triggers fetch directly
const handleOpenChange = (isOpen: boolean) => {
  setOpen(isOpen);
  if (isOpen) fetchData();
};
```

```tsx
// ❌ BAD: Effect syncs state
const [items, setItems] = useState([]);
const [filtered, setFiltered] = useState([]);
useEffect(() => {
  setFiltered(items.filter((i) => i.active));
}, [items]);

// ✅ GOOD: Compute during render
const filtered = useMemo(() => items.filter((i) => i.active), [items]);
```

**Valid useEffect uses:**

- Fetching data on mount (with cleanup)
- Setting up subscriptions/event listeners (with cleanup)
- Syncing with external systems (DOM, third-party libs)

---

## Styling & Text Colors

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
text - blue - 600; // Information, links
```

**Avoid** hard-coded grays — prefer semantic colors:

```tsx
text - gray - 400; // → text-muted-foreground
text - gray - 600; // → text-muted-foreground
text - gray - 700; // → text-foreground
text - gray - 900; // → text-foreground
```

---

## Error Handling

Use `trackError()` instead of `console.error()`:

```typescript
import { trackError } from '@/lib/error-tracking';

// ✅ Tracks to error reporting with auto-detected context
trackError('Failed to load data', error);

// ❌ Only logs to console
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
type UserWithStatus = User & { status: Status };

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
