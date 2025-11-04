# 🚀 Email System Setup Guide

**Quick start guide for setting up the Email Notification System**

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Fix NPM Cache (if needed)
```bash
sudo chown -R 501:20 "/Users/sumbenz/.npm"
```

### Step 2: Install Dependencies
```bash
cd /Users/sumbenz/Desktop/pkm-shop
npm install resend react-email @react-email/components
```

### Step 3: Get Resend API Key

1. Go to https://resend.com
2. Sign up for free account
3. Go to **API Keys** in dashboard
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

### Step 4: Configure Environment

Add to your `.env` file:
```bash
# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="onboarding@resend.dev"
EMAIL_REPLY_TO="support@pkm-shop.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 5: Test It!

**Test Order Confirmation:**
1. Start dev server: `npm run dev`
2. Login as user
3. Add items to cart
4. Checkout
5. Check your email inbox

**Test Code Delivery:**
1. Login as admin
2. Go to `/orders`
3. Approve a pending order
4. Check customer email inbox

---

## 📧 Email Templates

### Order Confirmation
- Sent when: User creates order
- Contains: Order details, next steps
- Recipient: Customer

### Code Delivery
- Sent when: Admin approves order
- Contains: Product codes, usage guide
- Recipient: Customer

---

## 🔧 Production Setup

### Before Going Live

1. **Verify Your Domain:**
   - Go to Resend dashboard → Domains
   - Add your domain (e.g., `pkm-shop.com`)
   - Add DNS records (provided by Resend)
   - Wait for verification (~1-24 hours)

2. **Update Production .env:**
   ```bash
   RESEND_API_KEY="re_live_key_here"
   EMAIL_FROM="noreply@pkm-shop.com"
   EMAIL_REPLY_TO="support@pkm-shop.com"
   NEXT_PUBLIC_APP_URL="https://pkm-shop.com"
   ```

3. **Test Production Emails:**
   - Create test order
   - Verify delivery
   - Check spam folder

---

## 📊 Free Tier Limits

- **3,000 emails/month**
- **100 emails/day**
- Perfect for 50-100 daily orders

---

## 🐛 Common Issues

### Emails Not Sending?

**Check:**
1. ✅ RESEND_API_KEY is set in .env
2. ✅ API key is valid (test in dashboard)
3. ✅ User has email address in database
4. ✅ Check logs for errors

**Logs to look for:**
```bash
# Success
✅ "Email sent successfully"

# Error
❌ "Failed to send email"
❌ "Email service is not configured"
```

### Emails in Spam?

For development:
- Normal for `onboarding@resend.dev`

For production:
- Verify domain in Resend
- Add DNS records (SPF, DKIM, DMARC)

---

## 📁 Files Reference

```
src/
├── lib/email.ts                    # Email service
├── emails/
│   ├── OrderConfirmation.tsx      # Order email template
│   └── CodeDelivery.tsx           # Code delivery template
└── app/api/v1/purchases/
    ├── route.ts                   # Sends order confirmation
    └── [id]/route.ts              # Sends code delivery
```

---

## 📚 Full Documentation

See [EMAIL_NOTIFICATION.md](./EMAIL_NOTIFICATION.md) for complete documentation.

---

## ✅ Checklist

- [ ] Fixed npm cache permissions
- [ ] Installed dependencies
- [ ] Created Resend account
- [ ] Got API key
- [ ] Updated .env file
- [ ] Tested order confirmation email
- [ ] Tested code delivery email
- [ ] Verified domain (production only)
- [ ] Updated production .env

---

**Need Help?**
- 📧 Resend Docs: https://resend.com/docs
- 📧 React Email Docs: https://react.email/docs
- 📧 Full Guide: [EMAIL_NOTIFICATION.md](./EMAIL_NOTIFICATION.md)
