# Quick Reference - Emails & MailHog

## ✅ Status: EMAILS WORKING

Emails ARE being sent successfully to MailHog.

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| http://localhost:8025 | MailHog Web UI |
| http://localhost:8000/docs | API Swagger |
| http://localhost:5173 | Frontend |

---

## 📧 Access Emails

### Method 1: Web UI
```
1. Open: http://localhost:8025
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. View emails in inbox
```

### Method 2: API
```bash
curl -s "http://localhost:8025/api/v1/messages" | python3 -m json.tool
```

### Method 3: Logs
```bash
docker logs event_staffing_mailhog --tail=50
```

---

## 📨 Email Endpoints

| Endpoint | Sends Email To | Subject |
|----------|---|---|
| `POST /events/{id}/publish` | Employees | "New Event Available" |
| `POST /assignments/events/{id}/apply` | Admin | "New Application" |
| `POST /assignments/events/{id}/invite` | Employee | "You're Invited" |
| `PATCH /assignments/{id}/accept` | Admin | "Invitation Response - Accepted" |
| `PATCH /assignments/{id}/reject` | Admin | "Invitation Response - Declined" |
| `PATCH /assignments/{id}/approve` | Employee | "Application Approved" |
| `POST /auth/forgot-password` | User | "Password Reset Request" |

---

## 🧪 Test Scenarios

### Test 1: Employee Applies
```
1. Login as employee
2. Find event
3. Click "Apply"
4. Check MailHog for email to admin
```

### Test 2: Admin Invites
```
1. Login as admin
2. Go to event
3. Click "Invite" on employee
4. Check MailHog for email to employee
```

### Test 3: Employee Accepts
```
1. Login as employee
2. Go to "My Assignments"
3. Find invited event
4. Click "Accept"
5. Check MailHog for email to admin
```

### Test 4: Admin Approves
```
1. Login as admin
2. Go to event
3. Find pending application
4. Click "Approve"
5. Check MailHog for email to employee
```

---

## 🔧 Configuration

**File**: `backend/app/services/email_service.py`

**Current Settings**:
- `MAILHOG_HOST`: `mailhog`
- `MAILHOG_PORT`: `1025`
- `USE_MAILHOG`: `true`

**For Production**:
- Set `USE_MAILHOG=false`
- Set `RESEND_API_KEY` environment variable

---

## 🐛 Troubleshooting

### No emails in web UI?
```bash
# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or use API
curl -s "http://localhost:8025/api/v1/messages"
```

### Emails not sending?
```bash
# Check backend logs
docker-compose logs backend --tail=50

# Check MailHog is running
docker ps | grep mailhog
```

### MailHog not receiving?
```bash
# Check environment variables
docker exec event_staffing_backend env | grep MAILHOG

# Should show:
# MAILHOG_HOST=mailhog
# MAILHOG_PORT=1025
```

---

## 📊 Verification

✅ Backend sending emails  
✅ MailHog receiving emails  
✅ Bilingual content working  
✅ All endpoints integrated  
✅ Ready for production  

---

## 📚 Documentation

- `EMAILS_WORKING_MAILHOG_ACCESS.md` - Full guide
- `ACCESO_EMAILS_MAILHOG.md` - Spanish guide
- `RESUMEN_FINAL_SESION_20_EMAILS.md` - Complete summary

---

**Status**: 🟢 **EMAILS WORKING**

**Next**: Access http://localhost:8025 to view emails
