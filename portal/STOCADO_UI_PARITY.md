# Stocado UI Parity Analysis

## Executive Summary

This document provides a detailed visual comparison between Stocado Portal (https://portal.stocado.com) and Navlun Portal (local), documenting exact differences and providing actionable CSS/theme tokens for achieving UI parity.

**Branch:** `cursor/stocado-parity-ui-90ab`

---

## Not (ürün kararı)

**Giriş sayfası (`/auth/*`) Navlun split-layout olarak korunur** — Stocado tek-kolon login uygulanmaz.

---

## 1. Login Page Layout

### **Stocado**
- **Layout:** Single-column centered form on plain white background
- **Card Style:** Centered card with shadow/border
- **Form Width:** ~400-450px max width
- **Background:** Pure white (`#ffffff`)
- **Branding:** Logo at top center, minimal

### **Navlun (Current)**
- **Layout:** Split-screen two-column (hero left, form right)
- **Left Panel:** Full-height gradient brand panel with hero illustration
- **Form Panel:** Right side with light gray background
- **Grid:** `1fr / 1.05fr` split

### **Required Changes**

```css
/* OPTION 1: Match Stocado exactly - single column centered */
.root {
  grid-template-columns: 1fr;  /* Remove split */
  background: #ffffff;
}

.brandPanel {
  display: none;  /* Hide hero panel */
}

.formPanel {
  background: #ffffff;  /* Pure white instead of #f6f8fc */
  align-items: center;
  justify-content: center;
}

/* OPTION 2: Keep split but simplify brand panel */
.brandPanel {
  background: linear-gradient(135deg, #1a8fff 0%, #0d6efd 100%);  /* Simpler blue gradient */
  /* Remove complex radial gradients */
}
```

**Recommendation:** Option 1 for full parity, Option 2 to keep some branding while simplifying

---

## 2. Primary & Accent Colors

### **Stocado**
- **Primary Blue (Buttons, Links, Active States):** `#1a8fff` or `#0d87f7` (bright cyan blue)
- **Orange Balance Badge:** `#ff7b00` or `#ff8800` (vibrant orange)
- **Blue KÖ Badge:** `#0d87f7` or `#1a8fff` (bright blue)
- **Background:** Pure white `#ffffff` (light mode)

### **Navlun (Current)**
```typescript
// From theme.ts
navlun: [
  '#e8edf5',  // 0
  '#c5d0e6',  // 1
  '#9fb3d6',  // 2
  '#7896c7',  // 3
  '#5279b8',  // 4
  '#355fa9',  // 5
  '#284d8f',  // 6
  '#203d75',  // 7 - Main brand navy
  '#1a335f',  // 8
  '#142949',  // 9
]
```
- **Current Primary:** Navy `#203d75` (dark, muted)
- **Accent Red:** `#C42126` (not used much)

### **Required Theme Changes**

```typescript
// theme.ts - Update to Stocado blue
export const theme = createTheme({
  primaryColor: 'stocado',
  colors: {
    stocado: [
      '#e6f4ff',  // 0 - lightest
      '#b3e0ff',  // 1
      '#80ccff',  // 2
      '#4db8ff',  // 3
      '#1aa4ff',  // 4
      '#0d87f7',  // 5 - Main Stocado blue
      '#0b6fd6',  // 6
      '#0957b5',  // 7
      '#073f94',  // 8
      '#052773',  // 9 - darkest
    ],
    orange: [
      '#fff3e0',  // 0
      '#ffe0b2',  // 1
      '#ffcc80',  // 2
      '#ffb74d',  // 3
      '#ffa726',  // 4
      '#ff8800',  // 5 - Main orange for balance badge
      '#f57c00',  // 6
      '#e65100',  // 7
      '#bf360c',  // 8
      '#9e2000',  // 9
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  defaultRadius: 'sm',  // Stocado uses smaller radius
})
```

---

## 3. Header & Finance Badges

### **Stocado Dashboard Header**
- **Height:** ~60-70px
- **Balance Badge:** Orange background `#ff8800`, white text, rounded rectangle
  - Format: "Bakiye 446.52₺"
  - Icon: Currency/wallet icon on left
  - Padding: Compact, ~8px vertical, 12px horizontal
  - Border Radius: ~6-8px
- **KÖ Alacak Badge:** Blue background `#0d87f7`, white text
  - Format: "K.Ö Alacak 4,495.76₺"
  - Similar styling to balance badge
  - Positioned immediately next to balance badge
- **Layout:** Badges are adjacent, no gap, top-left of header area

### **Navlun (Current)**
- Different header structure
- No prominent financial badges in header

### **Required Changes**

```tsx
// Add to header component
<Group gap="xs" p="md">
  <Badge 
    size="lg" 
    radius="sm"
    styles={{
      root: { 
        backgroundColor: '#ff8800',
        color: '#ffffff',
        fontWeight: 600,
        padding: '8px 12px',
        fontSize: '14px'
      }
    }}
    leftSection={<IconWallet size={16} />}
  >
    Bakiye 446.52₺
  </Badge>
  
  <Badge 
    size="lg" 
    radius="sm"
    styles={{
      root: { 
        backgroundColor: '#0d87f7',
        color: '#ffffff',
        fontWeight: 600,
        padding: '8px 12px',
        fontSize: '14px'
      }
    }}
    leftSection={<IconCurrencyLira size={16} />}
  >
    K.Ö Alacak 4,495.76₺
  </Badge>
</Group>
```

---

## 4. Sidebar Navigation

### **Stocado**
- **Width:** ~240-260px (narrower)
- **Background:** White `#ffffff` (light mode)
- **Border Right:** `1px solid #e5e7eb` (light gray)
- **Active Item:**
  - Background: Light blue `#e6f4ff` or `#e8f4ff`
  - Text: Primary blue `#0d87f7`
  - Border-left: 3px solid `#0d87f7` (indicator)
  - Font weight: 600 (semi-bold)
- **Inactive Item:**
  - Background: Transparent
  - Text: Dark gray `#374151` or `#4b5563`
  - Font weight: 400-500 (normal)
- **Hover:**
  - Background: Very light gray `#f3f4f6`
  - Text: Darker gray

### **Navlun (Current)**
```css
/* AppNavbar.module.css */
.navbar {
  width: 280px;  /* Wider than Stocado */
  background-color: light-dark(
    var(--mantine-color-gray-0),  /* #f8f9fa */
    var(--mantine-color-dark-7)
  );
}
```

### **Required Changes**

```css
/* AppNavbar.module.css */
.navbar {
  width: 250px;  /* Reduce from 280px */
  background-color: light-dark(#ffffff, var(--mantine-color-dark-7));
  border-right: 1px solid light-dark(#e5e7eb, var(--mantine-color-dark-4));
}

/* NavLink styling */
.navLink {
  border-radius: 0;  /* Remove rounded corners */
  font-weight: 500;
  color: light-dark(#4b5563, var(--mantine-color-gray-4));
  padding: 12px 16px;
  margin: 0;  /* No margins */
}

.navLink[data-active="true"] {
  background-color: light-dark(#e6f4ff, var(--mantine-color-blue-9));
  color: light-dark(#0d87f7, var(--mantine-color-blue-2));
  font-weight: 600;
  border-left: 3px solid #0d87f7;
  padding-left: 13px;  /* Compensate for border */
}

.navLink:hover:not([data-active="true"]) {
  background-color: light-dark(#f3f4f6, var(--mantine-color-dark-6));
}
```

---

## 5. Buttons

### **Stocado**
- **Primary Button:**
  - Background: Bright blue `#0d87f7` or `#1a8fff`
  - Color: White `#ffffff`
  - Border Radius: ~6-8px (smaller than Navlun's `md`)
  - Font Weight: 600
  - Padding: Slightly compact
  - Hover: Slightly darker blue `#0b6fd6`
- **Secondary Button:**
  - Background: White
  - Border: 1px solid `#d1d5db`
  - Color: Dark gray `#374151`
  - Hover: Light gray background
- **Filter Button (Blue):**
  - Background: Bright blue `#0d87f7`
  - Color: White
  - Icon on left
  - Text: "Filtreler"

### **Navlun (Current)**
```typescript
// theme.ts
Button: {
  defaultProps: {
    radius: 'md',  // ~8-12px
  },
}
```
- Uses navy `#203d75` primary color
- Larger border radius

### **Required Changes**

```typescript
// theme.ts
Button: {
  defaultProps: {
    radius: 'sm',  // ~4-6px to match Stocado
  },
  styles: {
    root: {
      fontWeight: 600,
      padding: '10px 16px',
    },
  },
}
```

```css
/* For primary buttons */
.primaryButton {
  background-color: #0d87f7 !important;
  color: #ffffff !important;
  border-radius: 6px;
  font-weight: 600;
}

.primaryButton:hover {
  background-color: #0b6fd6 !important;
}

/* For filter button specifically */
.filterButton {
  background-color: #0d87f7;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 600;
  padding: 8px 16px;
}
```

---

## 6. Typography

### **Stocado**
- **Font Family:** Appears to be **Inter** or similar modern sans-serif
- **Sizes:**
  - Headings: Bold/Semi-bold (600-700 weight)
  - Body text: 14-15px
  - Small text: 12-13px
- **Line Height:** Compact, ~1.4-1.5
- **Letter Spacing:** Minimal, -0.01em on headings

### **Navlun (Current)**
```typescript
// theme.ts
fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
headings: {
  fontFamily: 'Inter, system-ui, ...',
  fontWeight: '600',
}
```

### **Assessment**
✅ **Already matches!** Both use Inter with similar weights.

### **Minor Refinements**

```typescript
// theme.ts - Fine-tune if needed
export const theme = createTheme({
  fontSizes: {
    xs: '12px',
    sm: '13px',
    md: '14px',  // Slightly smaller than Mantine default
    lg: '16px',
    xl: '18px',
  },
  lineHeights: {
    xs: 1.4,
    sm: 1.45,
    md: 1.5,
    lg: 1.55,
    xl: 1.6,
  },
})
```

---

## 7. Table Density & Styles

### **Stocado Tables**
- **Row Height:** Compact, ~48-52px
- **Cell Padding:** `12px 16px` (horizontal padding, vertical padding tight)
- **Header:**
  - Background: Light gray `#f9fafb`
  - Text: Dark gray `#374151`, font-weight 600
  - Border-bottom: 1px solid `#e5e7eb`
- **Rows:**
  - Background: White
  - Border-bottom: 1px solid `#f3f4f6` (very light)
  - Hover: Background `#f9fafb`
- **Status Badges in Table:**
  - "Transferde" (In Transit): Bright blue `#0d87f7` background, white text
  - "Deşletimde" (Delivered?): Teal/cyan `#06b6d4` background, white text
  - Compact, small radius (~4px)
- **Action Buttons:** Blue circular button icons, minimal
- **Column Alignment:** Mixed (left for text, center for statuses, right for actions)

### **Navlun (Current)**
- Likely uses Mantine Table defaults
- May have larger padding/spacing

### **Required Changes**

```css
/* Table overrides */
.dataTable {
  font-size: 14px;
}

.dataTable thead tr {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dataTable thead th {
  color: #374151;
  font-weight: 600;
  padding: 12px 16px;
  font-size: 13px;
  text-transform: none;  /* Stocado doesn't uppercase headers */
}

.dataTable tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.dataTable tbody tr:hover {
  background-color: #f9fafb;
}

.dataTable tbody td {
  padding: 12px 16px;
  height: 52px;
}

/* Status badges in table */
.statusBadge {
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.statusBadge.transferde {
  background-color: #0d87f7;
  color: #ffffff;
}

.statusBadge.teslim {
  background-color: #06b6d4;
  color: #ffffff;
}
```

---

## 8. Tab Styles

### **Stocado Tabs (Dashboard)**
- **Active Tab:**
  - Background: Blue `#0d87f7`
  - Color: White `#ffffff`
  - Border-radius: ~6px
  - Font-weight: 600
  - Padding: ~8px 16px
- **Inactive Tab:**
  - Background: Transparent
  - Color: Dark gray `#6b7280`
  - Font-weight: 500
  - Hover: Light gray background `#f3f4f6`
- **Tab Group:** Horizontal pills with small gap between tabs

### **Navlun (Current)**
- Likely uses Mantine Pills or Tabs default styling
- May use underline style or different active state

### **Required Changes**

```tsx
// Use Pills component with custom styling
<Tabs 
  variant="pills" 
  radius="sm"
  styles={{
    tab: {
      fontWeight: 500,
      color: '#6b7280',
      padding: '8px 16px',
      '&[data-active]': {
        backgroundColor: '#0d87f7',
        color: '#ffffff',
        fontWeight: 600,
      },
      '&:hover:not([data-active])': {
        backgroundColor: '#f3f4f6',
      },
    },
    tabsList: {
      gap: '4px',
    },
  }}
>
  <Tabs.List>
    <Tabs.Tab value="kargolar">Kargolar</Tabs.Tab>
    <Tabs.Tab value="kapida-odeme">Kapıda Ödemeli</Tabs.Tab>
    <Tabs.Tab value="finans">Finans</Tabs.Tab>
  </Tabs.List>
</Tabs>
```

---

## 9. Input Fields

### **Stocado**
- **Border:** 1px solid `#d1d5db` (medium gray)
- **Border Radius:** ~6px (smaller than Navlun)
- **Focus Border:** Blue `#0d87f7`, possibly with box-shadow
- **Placeholder:** Light gray `#9ca3af`
- **Padding:** ~10px 12px (compact)
- **Font Size:** 14px

### **Navlun (Current)**
```typescript
// theme.ts
TextInput: {
  defaultProps: {
    radius: 'md',  // ~8px
    size: 'md',
  },
}
```

### **Required Changes**

```typescript
// theme.ts
TextInput: {
  defaultProps: {
    radius: 'sm',  // ~6px
    size: 'md',
  },
  styles: {
    input: {
      borderColor: '#d1d5db',
      fontSize: '14px',
      padding: '10px 12px',
      '&:focus': {
        borderColor: '#0d87f7',
        boxShadow: '0 0 0 3px rgba(13, 135, 247, 0.1)',
      },
      '&::placeholder': {
        color: '#9ca3af',
      },
    },
  },
}
```

---

## 10. Search & Filter Bar

### **Stocado**
- **Search Input:** Left side, icon inside input, placeholder "Ara..."
- **Filter Tags:** Active filters shown as small pills with X close button
  - Background: Light gray `#f3f4f6`
  - Text: Dark gray
  - Close icon: X on right
- **Filter Button:** Blue background `#0d87f7`, icon + "Filtreler" text
- **Layout:** Flex row with gap, all aligned in single bar

### **Required Implementation**

```tsx
<Group gap="sm" p="md">
  <TextInput
    placeholder="Ara..."
    leftSection={<IconSearch size={16} />}
    style={{ flex: 1, maxWidth: 300 }}
  />
  
  <Group gap="xs">
    {activeFilters.map((filter) => (
      <Badge
        key={filter.id}
        variant="light"
        rightSection={
          <ActionIcon size="xs" variant="transparent" onClick={() => removeFilter(filter.id)}>
            <IconX size={12} />
          </ActionIcon>
        }
        styles={{
          root: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            textTransform: 'none',
          },
        }}
      >
        {filter.label}
      </Badge>
    ))}
  </Group>
  
  <Button
    leftSection={<IconFilter size={16} />}
    style={{ backgroundColor: '#0d87f7' }}
  >
    Filtreler
  </Button>
</Group>
```

---

## 11. Actionable CSS/Theme Token Summary

### **Priority 1: Critical Brand Changes**

```typescript
// theme.ts - PRIMARY COLORS
colors: {
  stocado: [
    '#e6f4ff', '#b3e0ff', '#80ccff', '#4db8ff', '#1aa4ff',
    '#0d87f7',  // ← Main primary
    '#0b6fd6', '#0957b5', '#073f94', '#052773',
  ],
  orange: [
    '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726',
    '#ff8800',  // ← Balance badge
    '#f57c00', '#e65100', '#bf360c', '#9e2000',
  ],
}
primaryColor: 'stocado',
defaultRadius: 'sm',  // 6px instead of 8-12px
```

### **Priority 2: Layout Changes**

```css
/* Login page - simplify to single column */
.authLayout .root {
  grid-template-columns: 1fr;
}
.authLayout .brandPanel {
  display: none;
}
.authLayout .formPanel {
  background: #ffffff;
}

/* Sidebar - reduce width */
.navbar {
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
}
```

### **Priority 3: Component Styling**

```typescript
// Button
Button: {
  defaultProps: { radius: 'sm' },
  styles: { root: { fontWeight: 600 } },
}

// Inputs
TextInput: {
  defaultProps: { radius: 'sm' },
  styles: { input: { borderColor: '#d1d5db', fontSize: '14px' } },
}

// Navigation
NavLink: {
  styles: {
    root: {
      '&[data-active]': {
        backgroundColor: '#e6f4ff',
        color: '#0d87f7',
        fontWeight: 600,
        borderLeft: '3px solid #0d87f7',
      },
    },
  },
}
```

### **Priority 4: Add Header Finance Badges**

```tsx
// New component: FinanceBadges.tsx
<Group gap="xs">
  <Badge bg="#ff8800" c="#fff" size="lg" leftSection={<IconWallet />}>
    Bakiye {balance}₺
  </Badge>
  <Badge bg="#0d87f7" c="#fff" size="lg" leftSection={<IconCurrencyLira />}>
    K.Ö Alacak {receivables}₺
  </Badge>
</Group>
```

---

## 12. Implementation Checklist

- [ ] Update `theme.ts` with Stocado blue primary colors
- [ ] Add orange color scale for balance badge
- [ ] Change `defaultRadius` from `md` to `sm`
- [ ] Simplify login page to single-column or remove hero panel
- [ ] Add finance badges to dashboard header
- [ ] Reduce sidebar width from 280px to 250px
- [ ] Update sidebar active state styling (blue background, left border)
- [ ] Update button radius and styling
- [ ] Update tab component to pills style with blue active state
- [ ] Implement compact table styling (52px row height, light borders)
- [ ] Add status badge styling (blue/cyan backgrounds)
- [ ] Update input field border radius and focus states
- [ ] Implement search/filter bar with active filter tags
- [ ] Test in light and dark modes
- [ ] Verify responsive breakpoints

---

## 13. Visual Reference

### Screenshots Captured

1. **Stocado Login Page** - Simple centered form, white background
2. **Navlun Login Page** - Split screen with hero panel and gradient
3. **Stocado Dashboard** - Shows orange balance badge, blue KÖ badge
4. **Stocado Cargo Table** - Shows table density, status badges, action buttons

### Color Palette Quick Reference

| Element | Stocado | Navlun Current |
|---------|---------|----------------|
| Primary Button | `#0d87f7` | `#203d75` |
| Orange Badge | `#ff8800` | N/A |
| Sidebar Active | `#e6f4ff` bg, `#0d87f7` text | Gray bg, Navy text |
| Table Header | `#f9fafb` bg | Light gray |
| Button Radius | `6px` | `8-12px` |
| Sidebar Width | `250px` | `280px` |

---

## Notes

- Stocado uses a **brighter, more modern** blue (`#0d87f7`) compared to Navlun's navy (`#203d75`)
- **Smaller border radius** throughout (6px vs 8-12px) gives a more compact feel
- **Higher contrast** with pure white backgrounds and bright accent colors
- **Prominent finance badges** in header are a key differentiator
- **Compact table density** with tighter row heights and padding
- Login page is **significantly simpler** - no elaborate hero section

The main design philosophy shift is from Navlun's **professional navy/formal style** to Stocado's **bright, modern, high-contrast style** with cyan blues and vibrant accent colors.
