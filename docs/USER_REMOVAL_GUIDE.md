# 🗑️ User Account Removal Scripts

This guide provides multiple scripts to remove user accounts from the database using their email addresses.

## 📋 Available Scripts

### 1. **Interactive Removal Script** (`remove_user_account.js`)
**Full-featured script with safety checks and confirmations**

```bash
# Interactive mode (recommended for safety)
node remove_user_account.js

# Direct removal with email
node remove_user_account.js user@example.com

# Force removal (skip confirmation)
node remove_user_account.js user@example.com --force

# Remove user and all their orders
node remove_user_account.js user@example.com --delete-orders

# List recent users
node remove_user_account.js --list
```

**Features:**
- ✅ Shows user information before deletion
- ✅ Checks for related orders
- ✅ Requires confirmation (unless --force)
- ✅ Option to delete related data
- ✅ Interactive mode for safety

### 2. **Quick Removal Script** (`quick_remove_user.js`)
**Simple and fast for trusted operations**

```bash
# Quick removal (no confirmation)
node quick_remove_user.js user@example.com
```

**Features:**
- ⚡ Fast execution
- 🎯 Single purpose
- ⚠️ No confirmation prompts

### 3. **Batch Removal Script** (`batch_remove_users.js`)
**Remove multiple users at once**

```bash
# Remove multiple users directly
node batch_remove_users.js user1@example.com user2@example.com user3@example.com

# Remove users from file
node batch_remove_users.js emails.txt
```

**File format (emails.txt):**
```
user1@example.com
user2@example.com
user3@example.com
```

**Features:**
- 📦 Bulk operations
- 📊 Detailed summary report
- 📄 File input support
- 🔄 Continues on errors

## 🚀 Usage Examples

### Example 1: Safe Interactive Removal
```bash
node remove_user_account.js
# Follow prompts to select and confirm user removal
```

### Example 2: Quick Test User Cleanup
```bash
node quick_remove_user.js test@example.com
```

### Example 3: Batch Cleanup After Testing
```bash
# Create file with test emails
echo "test1@example.com
test2@example.com
test3@example.com" > test_emails.txt

# Remove all test users
node batch_remove_users.js test_emails.txt
```

### Example 4: Force Remove Vendor with Orders
```bash
node remove_user_account.js vendor@example.com --force --delete-orders
```

## ⚠️ Safety Guidelines

### 🔒 **PRODUCTION SAFETY**
1. **Always backup database before bulk operations**
2. **Test scripts on development environment first**
3. **Use interactive mode for important accounts**
4. **Verify email addresses before execution**

### 🛡️ **Data Integrity**
- Related orders are preserved by default
- Use `--delete-orders` only when necessary
- Check user role before deletion (admin accounts)
- Verify business impact for vendor accounts

### 📋 **Best Practices**
```bash
# 1. List users first to verify
node remove_user_account.js --list

# 2. Check specific user details
node remove_user_account.js user@example.com
# (then cancel if needed)

# 3. Perform removal
node remove_user_account.js user@example.com --force
```

## 🔧 Script Capabilities

| Feature | Interactive | Quick | Batch |
|---------|-------------|-------|-------|
| User Info Display | ✅ | ❌ | ❌ |
| Related Data Check | ✅ | ❌ | ❌ |
| Confirmation Prompt | ✅ | ❌ | ❌ |
| Force Mode | ✅ | ✅ | ✅ |
| Multiple Users | ❌ | ❌ | ✅ |
| File Input | ❌ | ❌ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Summary Report | ✅ | ❌ | ✅ |

## 🎯 Common Use Cases

### Development & Testing
```bash
# Clean up test accounts
node batch_remove_users.js test1@example.com test2@example.com

# Remove specific test user
node quick_remove_user.js testuser@example.com
```

### User Management
```bash
# Safely remove user account
node remove_user_account.js user@example.com

# Remove user and all data
node remove_user_account.js user@example.com --delete-orders
```

### Bulk Operations
```bash
# Prepare email list
echo "inactive1@example.com
inactive2@example.com" > inactive_users.txt

# Remove all inactive users
node batch_remove_users.js inactive_users.txt
```

## 🚨 Emergency Recovery

If you accidentally remove users, you can:
1. **Restore from database backup**
2. **Check application logs for user details**
3. **Contact users to re-register if needed**

## 📞 Support

For issues or questions:
1. Check script output for error messages
2. Verify database connection
3. Ensure proper permissions
4. Test with non-critical accounts first

---

**⚡ Quick Reference:**
- Interactive: `node remove_user_account.js`
- Quick: `node quick_remove_user.js <email>`
- Batch: `node batch_remove_users.js <emails...>`
