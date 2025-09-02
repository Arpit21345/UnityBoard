# UnityBoard Design System

This document outlines the design patterns and CSS approaches used throughout UnityBoard for consistent, professional UI components.

## Core Design Principles

### 1. **Card-Based Layout**
- Use subtle shadows and borders for depth
- Consistent border radius (8px for cards, 6px for controls)
- Hover effects with enhanced shadows
- Clean background colors with subtle tints

### 2. **Professional Color Scheme**
```css
/* Primary Colors */
Primary: #3b82f6 (blue)
Success: #10b981 (green) 
Warning: #f59e0b (amber)
Danger: #dc2626 (red)
Neutral: #6b7280 (gray)

/* Background Colors */
Card Background: #fff
Hover Background: #f9fafb
Status Backgrounds: 
  - Todo: #fff (with gray left border)
  - In Progress: #fffbeb (with amber left border)
  - Done: #f0fdf4 (with green left border)

/* Border Colors */
Default: #e5e7eb
Hover: #d1d5db
Focus: Primary color with 3px shadow ring
```

## Component Patterns

### 1. **Task Cards (List & Board)**

#### Structure Pattern:
```jsx
<div className="task-card">
  <div className="task-content">
    <div className="task-title">
      <span>Title</span>
      <StatusBadge />
    </div>
    <div className="task-meta">
      <span>Due date</span>
      <div className="task-labels">
        <span className="chip">Label</span>
      </div>
    </div>
  </div>
  <div className="task-actions">
    <select>...</select>
    <button className="task-btn">...</button>
  </div>
</div>
```

#### CSS Pattern:
```css
.task-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.task-title {
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #6b7280;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}
```

### 2. **Status Indicators**

#### Left Border Pattern:
```css
.item-todo { border-left: 4px solid #6b7280; }
.item-in-progress { 
  background: #fffbeb; 
  border-left: 4px solid #f59e0b; 
}
.item-done { 
  background: #f0fdf4; 
  border-left: 4px solid #10b981; 
}
```

### 3. **Form Controls (Consistent Sizing)**

#### Button Pattern:
```css
.btn-primary {
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

.btn-primary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
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

#### Input/Select Pattern:
```css
.form-control {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  min-height: 32px;
  color: #374151;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 4. **Layout Patterns**

#### Grid Layout (List View):
```css
.list-item {
  display: grid;
  grid-template-columns: 24px 1fr auto auto auto auto auto auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 16px;
}
```

#### Flex Layout (Card Actions):
```css
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
```

#### Form Grid (Modal Forms):
```css
.form-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: start;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

## Spacing System

### Standard Spacing Values:
```css
/* Use these consistent spacing values */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;

/* Apply to: */
gaps: 8px, 12px
padding: 12px, 16px
margins: 8px, 16px
```

## Typography Hierarchy

### Font Weights & Sizes:
```css
/* Titles */
.title {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
  line-height: 1.4;
}

/* Meta Information */
.meta {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}

/* Button Text */
.btn-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

/* Form Labels */
.label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}
```

## Animation & Transitions

### Standard Transitions:
```css
/* Use consistent transition timing */
transition: all 0.15s ease;

/* For hover effects */
transition: box-shadow 0.15s ease, border-color 0.15s ease;

/* For focus states */
transition: border-color 0.2s, box-shadow 0.2s;
```

## Component Application Guide

### When Creating New Components:

1. **Cards**: Use the task-card pattern for any list/detail items
2. **Status**: Apply left-border color coding for status indication
3. **Controls**: Use consistent button and form control sizing (32px height)
4. **Layout**: Use CSS Grid for structured layouts, Flexbox for content flow
5. **Colors**: Stick to the defined color palette
6. **Spacing**: Use the standard spacing system
7. **Hover**: Always include subtle hover effects for interactive elements

### Examples of Components That Can Use This Pattern:

- Resource cards
- Comment cards  
- User profile cards
- Settings panels
- Learning items
- Snippet cards
- Solution cards
- Discussion threads

### Quick Implementation Checklist:

- [ ] Card structure with proper shadow/border
- [ ] Consistent padding (16px for cards, 12px for actions)
- [ ] Status indicators with left borders
- [ ] Proper typography hierarchy
- [ ] Consistent button/control sizing (32px height)
- [ ] Hover effects on interactive elements
- [ ] Grid/flex layouts as appropriate
- [ ] Standard transition timing (0.15s ease)

This design system ensures consistency across the entire application while maintaining a professional, modern appearance.
