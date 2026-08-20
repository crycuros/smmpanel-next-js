# Admin Mobile UI Plan

## Current Situation
- Admin pages have a sidebar that works on desktop (`lg:` breakpoint)
- Mobile toggle exists but is hidden by default
- Admin sidebar is hardcoded in each page (not reusable component)

## Goals
1. Make admin sidebar fully responsive for mobile
2. Create a shared admin layout component
3. Add mobile-friendly navigation
4. Ensure all admin pages work well on mobile

---

## Phase 1: Create Shared Admin Layout Component

### 1.1 Create AdminLayout component
- File: `components/admin-layout.tsx`
- Contains:
  - Mobile header with hamburger menu
  - Collapsible sidebar
  - Main content area
  - Mobile bottom navigation

### 1.2 Update all admin pages to use AdminLayout
Pages to update:
- `/admin/dashboard/page.tsx`
- `/admin/users/page.tsx`
- `/admin/orders/page.tsx`
- `/admin/services/page.tsx`
- `/admin/categories/page.tsx`
- `/admin/tickets/page.tsx`
- `/admin/add-funds/page.tsx`
- `/admin/settings/page.tsx`

---

## Phase 2: Mobile Navigation Features

### 2.1 Mobile Header
- Hamburger menu button (visible only on mobile)
- Admin logo/title
- Quick actions (notifications, profile)

### 2.2 Mobile Sidebar
- Slide-in from left when hamburger is clicked
- Close on backdrop click
- Smooth animation

### 2.3 Mobile Bottom Navigation (Optional)
- Fixed bottom bar with main nav items
- Icons: Dashboard, Orders, Services, More

---

## Phase 3: Responsive Improvements per Page

### 3.1 Dashboard
- Stats cards: stack vertically on mobile
- Charts: resize or hide on small screens
- Recent orders: horizontal scroll table

### 3.2 Orders
- Table: horizontal scroll or card view on mobile
- Filters: collapse into dropdown
- Search: full width

### 3.3 Services
- Service list: card view instead of table
- Category tabs: horizontal scroll
- Add/Edit forms: full screen modal

### 3.4 Categories
- Category cards: 1 column on mobile
- Expandable sections for services

### 3.5 Users
- User cards instead of table
- Pagination: infinite scroll or "Load More"

### 3.6 Settings
- Form sections: collapsible
- Full width inputs on mobile

---

## Implementation Priority

1. **High Priority:**
   - Create AdminLayout component
   - Update sidebar to work on mobile
   - Mobile header

2. **Medium Priority:**
   - Dashboard responsive cards
   - Orders table scroll
   - Services list responsive

3. **Low Priority:**
   - Bottom navigation
   - Card views for tables

---

## Technical Notes

- Use existing Tailwind breakpoints:
  - `sm` - 640px
  - `md` - 768px  
  - `lg` - 1024px (current desktop)
  - `xl` - 1280px

- Admin sidebar already uses `lg:` classes
- Need to add `md:` and `sm:` breakpoints

---

## Next Steps

1. Create `components/admin-layout.tsx`
2. Update one admin page as example (categories)
3. Apply to remaining pages
