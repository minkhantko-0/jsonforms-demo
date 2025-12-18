# SSE Connection Resilience

## Current Implementation

### Automatic Reconnection
- **Exponential Backoff**: Reconnects with increasing delays (1s → 2s → 4s → 8s → 16s → 30s max)
- **Persistent Attempts**: Keeps trying to reconnect indefinitely
- **Connection Status**: Visual indicator shows "Reconnecting..." when disconnected

### Handling Edge Cases

1. **Network Interruptions**
   - Automatically detects connection loss
   - Reconnects with exponential backoff
   - Refetches notifications on successful reconnection

2. **Server Restarts**
   - Client detects server unavailability
   - Continues reconnection attempts
   - Resumes normal operation when server is back

3. **Browser Tab Sleep/Wake**
   - Detects when tab becomes visible again
   - Refetches notifications to catch missed updates
   - Ensures data consistency

4. **Missed Notifications**
   - Refetches all notifications when reconnecting
   - Refetches when tab becomes visible
   - Polling fallback (5-second interval) as backup

## What Happens During Disconnection

1. **User sees**: "Reconnecting..." indicator in the navigation bar
2. **Background**: Client attempts to reconnect automatically
3. **Fallback**: Polling continues to fetch notifications every 5 seconds
4. **On reconnect**: All notifications are refetched to ensure nothing was missed

## Testing Scenarios

### Test Network Issues
```bash
# Stop server
cd server
# Press Ctrl+C

# Client will show "Reconnecting..."
# Restart server
npm run dev

# Client automatically reconnects
```

### Test Tab Sleep
1. Switch to another tab for 30+ seconds
2. Return to the app
3. Notifications are automatically refetched

## Current Limitations

1. **No offline queue**: Actions taken while offline are not queued
2. **No retry for failed mutations**: Mark as read/delete operations don't retry
3. **No persistent connection state**: Connection state resets on page refresh

## Future Improvements

### High Priority
- [ ] Queue mutations (mark as read, delete) when offline
- [ ] Retry failed mutations when connection restored
- [ ] Show notification count of missed updates on reconnect

### Medium Priority
- [ ] Add connection quality indicator (latency)
- [ ] Implement service worker for offline support
- [ ] Add manual reconnect button

### Low Priority
- [ ] Store connection state in localStorage
- [ ] Add connection analytics/monitoring
- [ ] Implement WebSocket fallback
