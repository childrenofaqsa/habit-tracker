IMPORTANT GLOBAL RULES:
- Do not break existing functionality or existing stored user data while implementing new features.
- The application must function FULLY OFFLINE after installation and must NOT depend on an internet connection for normal operation.
- Do NOT implement this as a lightweight browser-only PWA experience.
- Structure the project so it can later be packaged into a fully installable offline mobile app using Capacitor or React Native WebView wrapping.
- All tracking, analytics, storage, and backup systems must operate completely locally on the device.

The application must feature four primary views accessible via a bottom navigation bar:
- Daily
- Values
- To-Do
- Analytics

==================================================
1. GLOBAL LAYOUT & NAVIGATION
==================================================

TOP HEADER:
- Display current view name on left
- On right include:
- Edit Mode toggle
- Backup & Restore settings button/icon

BOTTOM NAVIGATION:
- Sticky bottom navigation bar
- Four equal-width tabs:
- Daily
- Values
- To-Do
- Analytics

RESPONSIVENESS:
- Optimize for:
- iPad
- tablets
- landscape orientation
- mobile touch interaction

IPAD LAYOUT OPTIMIZATION:
- Use adaptive spacing and scaling for larger tablet screens
- Prevent excessive empty margins on iPad landscape mode
- Allow wider horizontal analytics tables on tablet screens
- Use responsive multi-column layouts where appropriate on larger displays

TOUCH TARGET RULE:
- All buttons, cards, drag handles, and interactive controls must be comfortably touchable on iPad screens without requiring precise tapping.

MOBILE INPUT SAFETY:
- Prevent virtual keyboard overlap issues on mobile/tablet forms
- Use responsive keyboard avoidance and automatic scroll repositioning

==================================================
2. DAILY VIEW (Habit Tracker Dashboard)
==================================================

STRUCTURE:
- Timeframes (Morning, Evening, Night)
- Nested Categories/Subcategories
- Habits inside categories

LAYOUT:
- Habits inside each category must display:
- side-by-side horizontally
- single row only
- no wrapping
- smooth horizontal scrolling

Use:
- flex-row
- overflow-x-auto

==================================================
HABIT CARD DESIGN
==================================================

CARD RULES:
- All habit cards must remain fixed identical size
- Example:
- w-24 h-24
- or w-28 h-28

IMPORTANT:
- Habit card dimensions must remain visually identical regardless of:
- content length
- image type
- interaction state

TEXT RULES:
- Habit title supports maximum 2 lines
- If text exceeds 2 lines:
- truncate with ellipsis (...)
- Card size must NEVER expand dynamically

DETAIL VIEW:
- Clicking/tapping ONLY the text area opens:
- tooltip
- micro modal
- or bottom sheet
- Show:
- full habit title
- extra details

IMPORTANT GESTURE RULE:
- Tapping text area must NOT trigger completion state changes

==================================================
CARD INTERACTION STATES & IMAGE REPLACEMENT
==================================================

DEFAULT STATE:
- Show uploaded custom square image/icon centered
- Habit text below image

DONE STATE:
- Single tap/click on card:
- Replace image entirely
- Full vibrant green card
- White checkmark icon centered
- Tapping again restores default state

MISSED STATE:
- Long press/hold (or right click desktop):
- Replace image entirely
- Full vibrant red card
- White X icon centered
- Long press again restores default state

IMPORTANT:
- Gesture handling must prevent conflicts between:
- card tap
- long press
- text click

==================================================
EDIT MODE SYSTEM
==================================================

WHEN EDIT MODE ON:
- Show banner:
"Edit Mode — tap items to rename, icons to delete"

SHOW:
- dashed "+ Add" card at end of habit row
- "+ Add Category" button inside timeframe
- delete/trash icons
- rename functionality
- upload/change habit images/icons

IMAGE OPTIMIZATION RULE:
- When a user uploads a custom habit image:
- automatically compress and resize
- maximum size 128x128
- prefer lightweight WebP blobs/object URLs
- avoid large Base64 strings when possible

DRAG & SORT:
- Horizontal drag sorting for habits
- Vertical drag sorting for categories

IMPORTANT DRAG RULES:
- Dragging and sorting must ONLY work when Edit Mode is active
- Ensure horizontal dragging works smoothly inside overflow-x-auto containers
- Prevent drag-scroll gesture conflicts

WHEN EDIT MODE OFF:
- Hide:
- add buttons
- edit buttons
- delete buttons
- drag controls
- backup & restore controls
- Show clean tracking interface only

==================================================
3. VALUES VIEW
==================================================

PURPOSE:
Track measurable daily values instead of binary habits.

SUPPORTED TYPES:
1. Numeric Counter
2. Textbox Log

LOGIC:
- Values reset daily
- Historical values preserved permanently inside database history

==================================================
VALUE ↔ HABIT CONNECTION & SYNC LOGIC
==================================================

Allow optional linking between:
- Daily habits
- Value trackers

When linked habit becomes DONE:
- automatically:
- open quick input modal
- OR trigger active indicator in Values view

SYNC REVERSAL RULE:
- If connected habit is unchecked/reverted:
- do NOT delete historical Value data
- only disable synchronization indicator

==================================================
4. TO-DO VIEW
==================================================

PURPOSE:
One-time tasks.

RULES:
- Completed tasks stay completed
- No recurring behavior

SCHEDULING:
- assign specific date
- OR no date

LAYOUT:
- collapsible Scheduled section
- collapsible Inbox / No Date section

OVERDUE ROLLOVER:
- Incomplete past tasks automatically appear under:
"Today / Overdue"

IMPORTANT:
- Uncompleted tasks must never become hidden or lost in old dates

==================================================
5. ANALYTICS VIEW
==================================================

==================================================
TODAY SUMMARY BANNER
==================================================

Display:
- Completion %
- Done Count
- Missed Count
- Total Tasks

==================================================
180-DAY HISTORY MATRIX
==================================================

Create:
- horizontally scrollable analytics matrix

COLUMN RULES:
- First column:
- habit/value name
- Immediate next column:
- TODAY
- Columns moving RIGHT:
- older days

Example:
- today
- yesterday
- 2 days ago
- 3 days ago

IMPORTANT:
- Use strict reverse chronological order

CELL TYPES:
- blank
- green check
- red X
- numeric values
- text snippets

TEXT LOG DISPLAY:
- Do not render long text directly inside matrix cells
- Instead show compact note/document icon
- Clicking icon opens:
- tooltip
- modal
- micro sheet
with full text content

==================================================
COMPLETION CHART
==================================================

Add minimalist bar chart:
- daily completion percentage
- historical trends

==================================================
6. DATABASE & STORAGE SYSTEM
==================================================

==================================================
SAFE SINGLE DATABASE ARCHITECTURE
==================================================

Use:
- IndexedDB via localForage preferred
- fallback LocalStorage acceptable

IMPORTANT:
- Use ONE single root database object:
APP_DATA

Structure example:
{
version: number,
timeframes: [],
categories: [],
habits: [],
values: [],
todos: [],
history: {},
settings: {}
}

==================================================
CRITICAL DATA SAFETY RULES
==================================================

1.
Never overwrite existing stored user data during initialization.

2.
Only create default/sample data if storage is completely empty.

3.
Always load existing database BEFORE initializing UI state.

4.
Every update must:
- load current data
- modify safely
- save merged state

5.
Never automatically clear user data.

6.
UI/layout changes must never reset or remap historical tracking data.

7.
Do not rename storage keys between versions.

8.
Storage migrations and cleanup scripts must never damage existing user data or historical tracking records.

==================================================
VERSIONING & MIGRATION SAFETY
==================================================

- Add schema version field inside APP_DATA

If structure changes:
- safely migrate old data
- never delete/reset existing data

CORRUPTION SAFETY:
- If partial database corruption is detected:
- attempt safe recovery first
- only isolate corrupted sections if recovery fails
- never wipe entire database unnecessarily

==================================================
180 DAY RETENTION
==================================================

- Preserve last 180 days of logs
- Automatically purge older tracking logs
- Never purge:
- settings
- habits
- categories
- configurations

==================================================
7. BACKUP & RESTORE SYSTEM
==================================================

==================================================
EXPORT
==================================================

Add:
"Backup Data" button

FUNCTION:
- Serialize entire APP_DATA
- Download JSON file:
daily_routine_backup_[date].json

==================================================
IMPORT
==================================================

Add:
"Restore Data" upload area/button

FUNCTION:
- Upload backup JSON
- Validate structure before restore

IMPORTANT:
- If imported JSON is invalid/corrupted:
- abort restore
- preserve existing data

RESTORE RULES:
- safely merge or overwrite
- refresh UI safely
- prevent corruption
- preserve compatibility

==================================================
8. UI / UX QUALITY
==================================================

Use:
- Tailwind transitions
- smooth animations
- fluid drag interactions
- accordion expansion animations

STYLE GOALS:
- minimalist
- polished
- premium feel
- touch friendly
- distraction free
- responsive scrolling

==================================================
9. CODE STRUCTURE
==================================================

Provide:
- modular
- maintainable
- scalable
- well-commented architecture

Separate into:
- DailyView
- ValuesView
- TodoView
- AnalyticsView
- BackupSettings

Use reusable:
- hooks
- utilities
- storage managers
- gesture handlers
- modal components

==================================================
10. FUTURE MOBILE PACKAGING COMPATIBILITY
==================================================

Structure codebase so it can later be:
- wrapped using Tauri 2
- converted into installable offline APK/iOS app
- packaged without requiring major architecture rewrite

Avoid browser-only APIs that break in native mobile wrappers.