# Cron Job Setup for Todo Cleanup

## Automatic Cleanup

The application automatically cleans up expired todos in two ways:

### 1. Client-Side Cleanup (Default)
The app checks every minute and removes expired todos automatically when the page is open.

### 2. Server-Side Cron Job (Optional - for production)

If you want cleanup to run even when no one is using the app, you can set up a cron job:

#### Using System Cron (Linux/Mac):

1. Open crontab:
   ```bash
   crontab -e
   ```

2. Add this line to run cleanup every minute:
   ```
   * * * * * curl http://localhost:3000/api/cron/cleanup
   ```

3. Or run every 5 minutes:
   ```
   */5 * * * * curl http://localhost:3000/api/cron/cleanup
   ```

#### Using Vercel Cron (if deployed on Vercel):

**Hobby Plan**: The `vercel.json` is configured to run cleanup once daily at midnight:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Pro Plan**: You can run cleanup more frequently (e.g., every minute):
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "* * * * *"
    }
  ]
}
```

Note: The client-side cleanup still runs every minute regardless of the Vercel plan!

#### Manual Trigger:

You can also manually trigger cleanup by visiting:
```
http://localhost:3000/api/cron/cleanup
```

## How It Works

The cleanup job:
1. Gets the current date and time in Italy (Europe/Rome) timezone
2. Compares each todo's date and end time with current time
3. Deletes todos where:
   - The date is in the past, OR
   - The date is today AND the end time has passed

## Italy Timezone

All dates and times are handled in Italy timezone (Europe/Rome):
- Dates are formatted as YYYY-MM-DD
- Times are in 24-hour format (HH:MM)
