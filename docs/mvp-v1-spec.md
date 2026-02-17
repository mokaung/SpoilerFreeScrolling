# MVP v1 – Spec & File Structure

## Overview

- **v1** includes **keyword detection** only; AI classifier is planned for v1.1.
- **Popup** is served from the existing root **`index.html`** (manifest points here).
- **Edit** is inline on the Profile Detail view (no separate Edit page). Back button goes to the previous screen (list from detail, or exit edit mode from detail).
- **Modals** share a single layout component to avoid duplicate code.

---

## MVC – Action List (v1)

### Main Profile List View

- Profiles are shown in a **list** (one row per profile).
- Each row shows: **topic name**, **chevron** (indicates row is clickable), **delete** button.
- Search profiles (by title)
- Filter by media type (All, TV, Movie, Game, Book)
- Sort profiles (A–Z, Z–A, Newest First, Oldest First, Enabled First)
- Click **New** → Create Profile Page
- Click row (or chevron) → Profile Detail Page
- Delete (per row, with confirmation modal)

### Create Profile Page

- **Back** button → Main list
- Enter title
- Select media type
- Set progress (optional)
- Sensitivity slider (0–10)
- Add/remove allowed accounts
- **Save** → Main list
- **Cancel** → Main list

### Profile Detail Page

- **Back** button → Main list (when in view mode)
- View all profile info (read-only)
- View stats (tweets blocked, last blocked, active since)
- View allowed accounts (read-only list)
- View keywords → Warning modal → Keywords section
- Keywords explanation (risk levels) at top
- Display keywords with risk levels (e.g. “walter dies (10/10)”)
- **Regenerate keywords** → Loading spinner → Updated
- **Edit** button → Detail switches to **edit mode** (same screen; fields become editable)
- **In edit mode**
  - All fields from create are shown, pre-filled and editable
  - Add/remove allowed accounts
  - **Save** → Save changes and return detail to read-only
  - **Cancel** → Return detail to read-only without saving
- **Back** in edit mode → Same as Cancel (return to read-only detail)
- Delete button (with confirmation modal) → Main list
- Toggle enabled

Editing is only available from Detail (not from the list). There is no separate “Edit Profile Page”; edit is a mode of the Profile Detail view.

### Modals

- **Shared modal layout** (`Modal`) used by:
  - Warning modal (spoiler / keywords warning)
  - Delete confirmation modal  
    So both use the same layout; only content and actions differ.

---

## v1.1 considerations

- **AI classifier:** Toggle in Create Profile and in Profile Detail (edit mode) to enable/disable AI-based spoiler detection alongside keyword detection.

---

## File Structure (v1)

Popup UI lives under `src/popup/`. The popup HTML is the root **`index.html`** (not inside `src/popup/`).

```
src/popup/
├── index.css
├── main.tsx                          # Entry: mounts App, imports CSS
├── App.tsx                           # Router / view state (list | create | detail)
└── components/
    ├── views/
    │   ├── MainView.tsx               # List + search / filter / sort
    │   ├── CreateProfileView.tsx      # Full create page (AI classifier planned for v1.1)
    │   └── ProfileDetailView.tsx      # Detail + inline edit mode (AI classifier in edit mode planned for v1.1)
    ├── profile/
    │   ├── ProfileList.tsx            # Renders list of profile rows
    │   ├── ProfileListRow.tsx        # Row: topic name, chevron, delete button
    │   ├── ProfileStats.tsx
    │   └── KeywordsSection.tsx
    ├── ui/
    │   ├── Modal.tsx                 # Base modal layout (used by Warning + DeleteConfirm)
    │   ├── SearchBar.tsx
    │   ├── FilterButtons.tsx
    │   ├── SortDropdown.tsx
    │   ├── SensitivitySlider.tsx
    │   ├── AllowedAccountsInput.tsx
    │   ├── WarningModal.tsx          # Uses Modal
    │   ├── DeleteConfirmModal.tsx     # Uses Modal
    │   └── LoadingSpinner.tsx
    └── shared/
        ├── Button.tsx
        └── BackButton.tsx            # Previous page (list ← detail, or exit edit mode)
```

- **Root (project):** `index.html` = popup page; script entry is `src/popup/main.tsx` (or equivalent bundle path).
- **BackButton:** Navigates to the previous page (list when coming from detail; from edit mode, returns to read-only detail).
- **Profile list:** Rendered as rows (not cards). `ProfileList` renders the list; each item is a `ProfileListRow` (topic name, chevron, delete button).
- **ProfileDetailView:** Renders read-only allowed accounts as a list; in edit mode it uses `AllowedAccountsInput` for add/remove.
- **Modal:** `WarningModal` and `DeleteConfirmModal` both use `Modal` for layout to avoid duplicate modal markup/styles.
