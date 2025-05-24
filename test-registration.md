# Registration Error Handling Test

## Test Cases for Duplicate Data

### Scenario 1: Duplicate Username with New Email

**Request:**

```json
POST /api/auth/register
{
  "username": "existing_user",  // Already exists in database
  "email": "newemail@example.com",  // New email
  "password": "Password123",
  "full_name": "New User"
}
```

**Expected Response:**

```json
HTTP 409 Conflict
{
  "message": "Username already exists. Please choose a different username.",
  "error": "DUPLICATE_USERNAME"
}
```

**What happens:**

1. ✅ Checks PostgreSQL for existing username FIRST
2. ✅ Finds existing username
3. ✅ Returns error immediately
4. ✅ NO Firebase user is created
5. ✅ NO orphaned data

---

### Scenario 2: Duplicate Email with New Username

**Request:**

```json
POST /api/auth/register
{
  "username": "new_username",  // New username
  "email": "existing@example.com",  // Already exists in database
  "password": "Password123",
  "full_name": "New User"
}
```

**Expected Response:**

```json
HTTP 409 Conflict
{
  "message": "Email already exists. Please choose a different email.",
  "error": "DUPLICATE_EMAIL"
}
```

---

### Scenario 3: Firebase Auth Email Already Exists

**Request:**

```json
POST /api/auth/register
{
  "username": "new_username",
  "email": "firebase_existing@example.com",  // Exists in Firebase but not in PostgreSQL
  "password": "Password123",
  "full_name": "New User"
}
```

**Expected Response:**

```json
HTTP 409 Conflict
{
  "message": "Email already exists in Firebase Auth.",
  "error": "FIREBASE_EMAIL_EXISTS"
}
```

---

### Scenario 4: Weak Password

**Request:**

```json
POST /api/auth/register
{
  "username": "new_username",
  "email": "new@example.com",
  "password": "123",  // Too weak for Firebase
  "full_name": "New User"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request
{
  "message": "Password is too weak. Please choose a stronger password.",
  "error": "WEAK_PASSWORD"
}
```

---

## Error Flow Improvements

### Before (❌ Problem):

1. Create Firebase user
2. Try to create PostgreSQL user
3. If PostgreSQL fails → Firebase user is orphaned
4. Generic error message

### After (✅ Fixed):

1. Check PostgreSQL for duplicates FIRST
2. If duplicate found → Return specific error
3. Only create Firebase user if no conflicts
4. Specific error codes and messages
5. No orphaned data

## Error Codes Reference

| Error Code                  | HTTP Status | Description                                 |
| --------------------------- | ----------- | ------------------------------------------- |
| `DUPLICATE_USERNAME`        | 409         | Username exists in PostgreSQL               |
| `DUPLICATE_EMAIL`           | 409         | Email exists in PostgreSQL                  |
| `FIREBASE_EMAIL_EXISTS`     | 409         | Email exists in Firebase Auth               |
| `WEAK_PASSWORD`             | 400         | Password doesn't meet Firebase requirements |
| `INVALID_EMAIL`             | 400         | Email format is invalid                     |
| `DATABASE_CONSTRAINT_ERROR` | 409         | Fallback for database constraints           |
| `UNKNOWN_ERROR`             | 500         | Unexpected error occurred                   |
