# Quick Setup Checklist

## ✅ Setup Toast Notifications (5 minutes)

### Step 1: Wrap App with ToastProvider

Edit `src/App.jsx`:

```jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext"; // Add this import

function App() {
  return (
    <ToastProvider> {/* Add this wrapper */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
```

### Step 2: Use Toast in Components

In any component (e.g., `CreateQuotation.jsx`):

```jsx
import { useToast } from "../context/ToastContext";

const CreateQuotation = () => {
  const toast = useToast(); // Add this hook

  const handleSubmit = async () => {
    try {
      await createQuotation(payload);
      toast.success("Quotation created successfully!"); // Add this
      navigate("/");
    } catch (err) {
      toast.error("Failed to create quotation"); // Add this
    }
  };

  // ... rest of component
};
```

## ✅ Component Migration (Optional)

### Replace Old Buttons

**Before:**
```jsx
<button
  onClick={handleClick}
  className="rounded-lg bg-slate-800 px-4 py-2.5 text-white hover:bg-slate-700"
>
  Click Me
</button>
```

**After:**
```jsx
import Button from "../components/common/Button";

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Replace Old Inputs

**Before:**
```jsx
<input
  type="text"
  className="w-full rounded-lg border px-4 py-2.5"
  value={value}
  onChange={onChange}
/>
```

**After:**
```jsx
import Input from "../components/common/Input";

<Input
  label="Field Name"
  value={value}
  onChange={onChange}
  helperText="Optional helper text"
/>
```

## ✅ Recommended Updates

### 1. QuotationList - Add Toast for Delete
```jsx
const handleDelete = async id => {
  try {
    await deleteQuotation(id);
    toast.success("Quotation deleted successfully");
    // ... rest of code
  } catch (err) {
    toast.error("Failed to delete quotation");
  }
};
```

### 2. CreateQuotation - Add Toast for Success
```jsx
const handleSubmit = async () => {
  try {
    await createQuotation(payload);
    toast.success("Quotation created!");
    navigate("/");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to create quotation");
  }
};
```

### 3. EditQuotation - Add Toast for Updates
```jsx
const handleUpdate = async () => {
  try {
    await updateQuotation(id, payload);
    toast.success("Quotation updated successfully");
    navigate("/");
  } catch (err) {
    toast.error("Failed to update quotation");
  }
};
```

### 4. ViewQuotation - Add Toast for Downloads
```jsx
const handleDownload = async type => {
  try {
    const response = type === "pdf" ? await downloadPDF(id) : await downloadExcel(id);
    // ... download logic
    toast.success(`${type.toUpperCase()} downloaded successfully`);
  } catch (err) {
    toast.error(`Failed to download ${type.toUpperCase()}`);
  }
};
```

## 🎯 Priority Order

1. **High Priority** - Add ToastProvider to App.jsx (required for toasts to work)
2. **Medium Priority** - Add toasts to async operations (better UX)
3. **Low Priority** - Migrate to new Button/Input components (consistency)

## 🧪 Test Checklist

After implementing:

- [ ] Toast appears on successful actions
- [ ] Toast appears on errors
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Toast can be manually dismissed
- [ ] Multiple toasts stack properly
- [ ] Toast animation is smooth
- [ ] Loading states show spinners
- [ ] Buttons are disabled during loading
- [ ] Error messages are clear
- [ ] Forms validate properly

## 📝 Notes

- The UI components are **backward compatible** - you can migrate gradually
- Existing pages will continue to work without changes
- New components follow the same design system
- All components are fully documented in `COMPONENTS_GUIDE.md`

## 🚀 You're Done!

Your frontend now has professional UI components ready to use. Start small by adding toasts, then migrate components as needed.
