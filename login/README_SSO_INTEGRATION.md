# SSO Integration for Admin Login

This document explains the integration between the admin login system and the SSO API, along with the GIS frontend alert functionality.

## Integration Overview

### 1. Admin Login Flow

The admin login now integrates with the SSO API at `https://10.15.38.162:3100/api/sso/v1/auth/login`:

**API Endpoint:**
```
POST https://10.15.38.162:3100/api/sso/v1/auth/login
```

**Request Body:**
```json
{
  "username": "wasil",
  "password": "wasil123",
  "app_id": 8
}
```

**Headers:**
- `Content-Type: application/json`
- `credentials: 'include'` (for cookie handling)
- `mode: 'cors'` (for CORS support)

### 2. Authentication Flow

1. **User enters credentials** in the admin login form
2. **System calls SSO API** with username, password, and app_id
3. **On successful login:**
   - Stores login status in localStorage
   - Redirects to GIS frontend (`/gis-fe/peta`)
4. **On failure:**
   - Shows error message
   - Stays on login page

### 3. GIS Frontend Authentication Alerts

The GIS frontend (`/gis-fe/peta`) shows different alerts based on authentication status:

#### Internal User (Admin)
- **Trigger:** HTTP-only cookies (`refreshToken`, `accessToken`)
- **Alert:** "Login sebagai internal (username)" (Blue gradient)
- **Verification:** Calls SSO API `/auth/me`
- **Username Display:** Shows username from SSO API response: `{ id: 2, username: "wasil", role: "admin" }`

#### External User (Registered Citizen)
- **Trigger:** localStorage `userEmail`
- **Alert:** "Login sebagai external" (Green gradient)
- **Verification:** Client-side localStorage check

#### Public User (Guest)
- **Trigger:** No authentication
- **Alert:** "Akses public" (Orange gradient)
- **Verification:** No authentication required

### 4. SSO API Integration

The system requires a working SSO API for authentication:

- **Login Endpoint:** `https://10.15.38.162:3100/api/sso/v1/auth/login`
- **Verify Endpoint:** `https://10.15.38.162:3100/api/sso/v1/auth/me`
- **Logout Endpoint:** `https://10.15.38.162:3100/api/sso/v1/auth/logout`
- **Required:** Valid SSO credentials and working API

## Technical Implementation

### Admin Login Component (`login/src/pages/AdminLogin.tsx`)

- Updated form fields to use `username` instead of `email`
- Direct integration with SSO API endpoint (`https://10.15.38.162:3100`)
- Added error handling for SSO API failures
- Uses HTTP-only cookies for authentication
- No fallback - requires working SSO API
- Requires whitelist access to SSO API

### GIS Frontend Component (`gis-fe/src/components/MapApp.vue`)

- Added multi-level authentication alerts
- **Internal:** HTTP-only cookies + SSO API verification
- **External:** localStorage email check
- **Public:** No authentication required
- Different colored alerts for each user type
- Provides dismiss functionality with appropriate cleanup

### Backend Admin Routes (`gis-be/routes/admin.js`)

- `/admin/verify` - Verify admin authentication by calling SSO API `/auth/me`
- `/admin/logout` - Clear admin cookies and logout
- Handles SSO cookies: `refreshToken`, `accessToken`
- Direct calls to `https://10.15.38.162:3100/api/sso/v1/auth/me` for verification
- Extracts username from SSO response: `{ id: 2, username: "wasil", role: "admin" }`
- No fallback - requires working SSO API
- Requires whitelist access to SSO API

## Environment Variables

No additional environment variables are required for this integration as the SSO API endpoint is hardcoded.

## Security Considerations

1. **HTTPS Required:** The SSO API uses HTTPS
2. **HTTP-Only Cookies:** Authentication uses secure HTTP-only cookies (`refreshToken`, `accessToken`)
3. **CORS Support:** Cross-origin requests are enabled with credentials
4. **Backend Verification:** Admin status is verified server-side via SSO API `/auth/me`
5. **JWT Tokens:** SSO API returns JWT tokens in HTTP-only cookies
6. **Cookie Expiration:** Cookies automatically expire after 24 hours
7. **Real-time Verification:** Each admin check calls the SSO API for current status

## Testing

### SSO API Requirements
- **Working SSO API** at `https://10.15.38.162:3100`
- **Valid SSO credentials** for admin login
- **Network connectivity** to SSO API

### Test Flow
1. Navigate to `/login/admin/login`
2. Enter valid SSO credentials
3. Should redirect to `/gis-fe/peta`
4. Should see "Login sebagai internal (username)" alert
5. Alert should auto-expire after 24 hours

### Debugging
- Check browser console for SSO API logs
- Check backend console for verification logs
- Verify SSO API connectivity

## Error Handling

The system handles various error scenarios:

- **Network errors:** Shows fallback for development
- **Invalid credentials:** Shows appropriate error message
- **API unavailable:** Falls back to development mode
- **CORS issues:** Handled with proper headers

## Logout Functionality

### Admin Dashboard Logout
- **Endpoint:** `https://10.15.38.162:3100/api/sso/v1/auth/logout`
- **Method:** POST
- **Actions:**
  - Calls SSO API logout
  - Clears all local cookies
  - Clears localStorage
  - Redirects to login page
  - Shows loading state during logout

### GIS Frontend Logout
- **Trigger:** Click close button on internal alert
- **Actions:**
  - Calls SSO API logout
  - Clears all cookies
  - Clears localStorage
  - Hides alert

## Future Enhancements

1. **Token-based authentication** instead of localStorage
2. **Refresh token mechanism** for longer sessions
3. **Role-based access control** for different admin levels
4. **Audit logging** for login attempts
5. **Rate limiting** for failed login attempts 