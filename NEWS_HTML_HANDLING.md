# News Content HTML Handling

## Background
The news editor uses **TipTap** rich text editor which allows formatting like:
- **Bold** and *Italic* text
- Bullet lists
- Links

This means the content is stored as HTML (e.g., `<p>Test</p>`) in the database to preserve formatting.

## Where HTML is Used

### ✅ Stored as HTML (in database)
- The `announcements.content` field stores HTML
- This preserves formatting for display in the mobile app and web

### ✅ Displayed with Formatting
- **News Editor**: Shows rich text with formatting
- **Mobile App**: Can render HTML for formatted display
- **Full Article View**: Shows formatted content

### ⚠️ Displayed as Plain Text (HTML stripped)
- **News List Preview**: Shows first 60 characters without HTML tags
- **Notifications**: Shows plain text message without HTML tags

## Implementation

### 1. News Manager Preview
**File:** `src/app/(protected)/news/news-manager.tsx`

Strips HTML tags for the preview in the news list:

```typescript
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();
const plainContent = stripHtml(row.original.content);
```

### 2. Notification Messages
**File:** `supabase/migrations/fix_announcement_trigger_column_reference.sql`

Database trigger strips HTML when creating notifications:

```sql
-- Strip HTML tags from content for notification message
regexp_replace(NEW.content, '<[^>]*>', '', 'g')
```

## Why This Approach?

### ✅ Advantages
1. **Preserves Formatting**: Content keeps bold, italic, lists when viewed in full
2. **Clean Previews**: List view shows clean text without `<p>` tags
3. **Clean Notifications**: Push notifications show readable plain text
4. **Flexible Display**: Can choose to show formatted or plain text per context

### ❌ Alternative Approaches Considered
1. **Store Plain Text Only**: Would lose all formatting capabilities
2. **Store Both HTML and Plain**: Would require double storage and sync issues
3. **Client-Side Stripping Only**: Would still send HTML tags in notifications

## Examples

### Input (in editor):
```
This is a **bold** announcement with a list:
- Item 1
- Item 2
```

### Stored in Database:
```html
<p>This is a <strong>bold</strong> announcement with a list:</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### Displayed in News List:
```
This is a bold announcement with a list: Item 1 Item 2...
```

### Displayed in Notification:
```
This is a bold announcement with a list: Item 1 Item 2...
```

### Displayed in Full View:
```
This is a bold announcement with a list:
• Item 1
• Item 2
```
(with actual formatting preserved)

## Benefits for Users

1. **Staff**: Can create rich formatted announcements
2. **Members**: Get clean, readable notifications
3. **System**: Efficiently stores one version of content
4. **Mobile App**: Can display formatted content when viewing full article

## Notes

- The HTML stripping is automatic and requires no manual intervention
- The regex pattern `<[^>]*>` removes all HTML tags
- Content remains safe and doesn't break layout with unexpected HTML
