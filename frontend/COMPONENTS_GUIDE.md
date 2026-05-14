# UI Components Documentation

## Quick Start

All UI components are located in `src/components/common/` and can be imported individually:

```jsx
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import Badge from "../components/common/Badge";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import { PlusIcon, EyeIcon } from "../components/common/Icons";
```

## Button Component

### Basic Usage
```jsx
<Button onClick={handleClick}>Click me</Button>
```

### Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### With Icons
```jsx
<Button icon={<PlusIcon />}>Create</Button>
```

### Loading State
```jsx
<Button loading={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

### Full Width
```jsx
<Button fullWidth>Full Width Button</Button>
```

## Input Component

### Basic Usage
```jsx
<Input
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  placeholder="you@example.com"
/>
```

### With Error
```jsx
<Input
  label="Password"
  type="password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  error={errors.password}
  required
/>
```

### With Helper Text
```jsx
<Input
  label="Username"
  value={username}
  onChange={e => setUsername(e.target.value)}
  helperText="Choose a unique username"
/>
```

### With Icon
```jsx
<Input
  icon={<SearchIcon />}
  placeholder="Search..."
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
```

## Alert Component

### Basic Usage
```jsx
<Alert variant="success">Operation completed successfully!</Alert>
```

### Variants
```jsx
<Alert variant="success">Success message</Alert>
<Alert variant="error">Error message</Alert>
<Alert variant="warning">Warning message</Alert>
<Alert variant="info">Info message</Alert>
```

### With Title
```jsx
<Alert variant="error" title="Error">
  Something went wrong. Please try again.
</Alert>
```

### Dismissible
```jsx
<Alert variant="info" onClose={() => setShowAlert(false)}>
  This alert can be dismissed
</Alert>
```

## Badge Component

### Basic Usage
```jsx
<Badge>Default</Badge>
```

### Variants
```jsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
```

### Sizes
```jsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

## Card Component

### Basic Usage
```jsx
<Card>
  <CardTitle>Card Title</CardTitle>
  <CardDescription>Card description text</CardDescription>
  <p>Card content goes here</p>
</Card>
```

### With Hover Effect
```jsx
<Card hover>
  This card has a hover effect
</Card>
```

### Custom Padding
```jsx
<Card padding="p-8">
  Card with larger padding
</Card>
```

## Spinner Component

### Basic Usage
```jsx
<Spinner />
```

### Sizes
```jsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

### Loading Screen
```jsx
import { LoadingScreen } from "../components/common/Spinner";

<LoadingScreen message="Loading quotations..." />
```

### Loading Overlay
```jsx
import { LoadingOverlay } from "../components/common/Spinner";

<div className="relative">
  {/* Your content */}
  {loading && <LoadingOverlay message="Saving..." />}
</div>
```

## Icons

### Available Icons
- `FileTextIcon`
- `PlusIcon`
- `PencilIcon`
- `CheckCircleIcon`
- `LogoutIcon`
- `EyeIcon`
- `TrashIcon`
- `DownloadIcon`
- `ArrowLeftIcon`
- `SearchIcon`
- `ChevronLeftIcon`
- `ChevronRightIcon`

### Usage
```jsx
import { PlusIcon, EyeIcon } from "../components/common/Icons";

<PlusIcon className="h-5 w-5" />
<EyeIcon className="h-6 w-6 text-blue-600" />
```

## Toast Notifications

### Setup
Wrap your app with ToastProvider in `App.jsx`:

```jsx
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
```

### Usage
```jsx
import { useToast } from "../context/ToastContext";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Quotation created successfully!");
  };

  const handleError = () => {
    toast.error("Failed to save quotation");
  };

  const handleWarning = () => {
    toast.warning("This action cannot be undone");
  };

  const handleInfo = () => {
    toast.info("New features available");
  };

  // Custom duration (default is 3000ms)
  const handleCustom = () => {
    toast.success("This will stay for 5 seconds", 5000);
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  );
}
```

## Best Practices

### 1. Consistent Spacing
Use Tailwind's spacing scale consistently:
```jsx
<div className="space-y-4"> {/* Vertical spacing */}
  <Input label="Field 1" />
  <Input label="Field 2" />
</div>

<div className="flex gap-3"> {/* Horizontal gap */}
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

### 2. Loading States
Always provide feedback during async operations:
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await saveData();
    toast.success("Saved successfully");
  } catch (err) {
    toast.error("Failed to save");
  } finally {
    setLoading(false);
  }
};

return <Button loading={loading}>Save</Button>;
```

### 3. Error Handling
Show clear error messages:
```jsx
const [errors, setErrors] = useState({});

return (
  <>
    {errors.general && (
      <Alert variant="error" onClose={() => setErrors({})}>
        {errors.general}
      </Alert>
    )}
    <Input
      label="Email"
      error={errors.email}
      value={email}
      onChange={e => setEmail(e.target.value)}
    />
  </>
);
```

### 4. Accessibility
- Always provide labels for inputs
- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works

### 5. Responsive Design
- Test on mobile devices
- Use responsive Tailwind classes: `sm:`, `md:`, `lg:`
- Make sure tables scroll horizontally on mobile

## Color Palette

### Primary Colors
- `slate-800`, `slate-900` - Primary actions
- `emerald-600`, `emerald-700` - Success states
- `red-600`, `red-700` - Errors, destructive actions
- `amber-600`, `amber-700` - Warnings
- `blue-600`, `blue-700` - Informational

### Neutral Colors
- `slate-50`, `slate-100` - Backgrounds
- `slate-200`, `slate-300` - Borders
- `slate-600`, `slate-700` - Body text
- `slate-500` - Secondary text
- `slate-400` - Placeholders

## Typography Scale

- **Headings:** `text-2xl`, `text-3xl` with `font-bold` and `tracking-tight`
- **Body:** `text-sm`, `text-base` with normal weight
- **Labels:** `text-sm` with `font-medium`
- **Helper Text:** `text-xs`, `text-sm` with `text-slate-500`
