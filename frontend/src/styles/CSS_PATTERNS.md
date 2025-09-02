# Quick CSS Pattern Reference

For quick copy-paste when implementing new components following the UnityBoard design system.

## 1. Basic Card Pattern

```css
.component-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.component-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}
```

## 2. Status Color System

```css
/* Status left borders */
.status-todo { border-left: 4px solid #6b7280; }
.status-in-progress { 
  background: #fffbeb; 
  border-left: 4px solid #f59e0b; 
}
.status-done { 
  background: #f0fdf4; 
  border-left: 4px solid #10b981; 
}
.status-error { 
  background: #fef2f2; 
  border-left: 4px solid #dc2626; 
}
```

## 3. Button System

```css
.btn-base {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  min-height: 32px;
  cursor: pointer;
  color: #374151;
  transition: all 0.15s ease;
}

.btn-base:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
  border-color: #2563eb;
}

.btn-primary:hover {
  background: #2563eb;
  color: #fff;
}

.btn-danger {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.btn-danger:hover {
  background: #fee2e2;
  border-color: #f87171;
}
```

## 4. Form Controls

```css
.form-input, .form-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  min-height: 32px;
  color: #374151;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

## 5. Layout Grids

```css
/* List view grid */
.list-grid {
  display: grid;
  grid-template-columns: 24px 1fr auto auto auto auto auto auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

/* Two-column form */
.form-grid-2 {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: start;
}

/* Card actions bar */
.actions-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}
```

## 6. Typography Classes

```css
.text-title {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
  line-height: 1.4;
}

.text-meta {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}

.text-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
  display: block;
}
```

## 7. Content Structure

```jsx
{/* Standard card content pattern */}
<div className="component-card">
  <div className="content-area">
    <div className="title-row">
      <span className="text-title">Title</span>
      <StatusBadge />
    </div>
    <div className="meta-row">
      <span className="text-meta">Meta info</span>
      <div className="tags">
        <span className="chip">Tag</span>
      </div>
    </div>
  </div>
  <div className="actions-bar">
    <select className="form-select">...</select>
    <button className="btn-base">Action</button>
    <button className="btn-danger">Delete</button>
  </div>
</div>
```

## 8. Empty States

```css
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 14px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  margin: 20px 0;
}
```

## 9. Bulk Actions Bar

```css
.bulk-actions {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
```

## Usage Tips:

1. **Always use the status color system** for any items with states
2. **Maintain 32px height** for all form controls and buttons  
3. **Use consistent spacing**: 8px, 12px, 16px, 24px
4. **Include hover effects** on all interactive elements
5. **Use grid for structured layouts**, flex for content flow
6. **Apply the card pattern** to any list or detail components
