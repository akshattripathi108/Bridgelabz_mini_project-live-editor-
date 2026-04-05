# GitHub OAuth Setup Guide - Nexus

Complete this guide to enable GitHub login and code pushing.

---

## ✅ Step 1: Create GitHub OAuth App

1. Go to: **https://github.com/settings/developers**
2. Click **OAuth Apps** in left sidebar
3. Click **New OAuth App**
4. Fill in the form:

   | Field | Value |
   |-------|-------|
   | **Application name** | Nexus |
   | **Homepage URL** | http://localhost:3000 |
   | **Application description** | Real-time code collaboration platform |
   | **Authorization callback URL** | http://localhost:5000/api/auth/github/callback |

5. Click **Register application**
6. You'll see your credentials on the next page

---

## ✅ Step 2: Copy Your Credentials

On the GitHub OAuth App page, you'll see:
- **Client ID** (required)
- **Client Secret** (required)

**⚠️ IMPORTANT:** Never share your Client Secret publicly!

---

## ✅ Step 3: Update Server Configuration

Open `server/.env` file and update:

```env
GITHUB_CLIENT_ID=paste_your_client_id_here
GITHUB_CLIENT_SECRET=paste_your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

**Example:**
```env
GITHUB_CLIENT_ID=Ov23liXXXXXXXXXXXXXX
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

---

## ✅ Step 4: Update Client Configuration

Open `client/.env` file and update:

```env
REACT_APP_GITHUB_CLIENT_ID=paste_your_client_id_here
```

**Example:**
```env
REACT_APP_GITHUB_CLIENT_ID=Ov23liXXXXXXXXXXXXXX
```

---

## ✅ Step 5: Restart Servers

Stop and restart both servers for changes to take effect:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```

---

## ✅ Step 6: Test GitHub Login

1. Go to **http://localhost:3000/login**
2. Click **"Login with GitHub"** button
3. GitHub will ask for permission - click **Authorize**
4. You should be redirected to your dashboard

---

## ✅ Step 7: Test Push to GitHub

1. Create or join a project in Nexus
2. Write some code in the editor
3. Click **"Push to GitHub"** button
4. Select a repository
5. Enter a commit message
6. Click **Push**
7. Your code should appear in your GitHub repo!

---

## 🔧 Troubleshooting

### **Error: "404 Page Not Found" on GitHub**
- [ ] Verify `GITHUB_REDIRECT_URI` in `server/.env` matches GitHub app settings exactly
- [ ] Make sure you're using: `http://localhost:5000/api/auth/github/callback`
- [ ] Restart both servers after updating

### **Error: "This application has not been configured"**
- [ ] Check `REACT_APP_GITHUB_CLIENT_ID` in `client/.env` is correct
- [ ] Check `GITHUB_CLIENT_ID` in `server/.env` matches
- [ ] Restart frontend server

### **Error: "Failed to fetch repositories"**
- [ ] You need to login with GitHub first
- [ ] Click "Login with GitHub" on login page
- [ ] This grants the app permission to access your repos

### **"Push to GitHub" button shows "Not connected"**
- [ ] Login using GitHub OAuth (not email/password)
- [ ] Email/password login doesn't connect to GitHub
- [ ] Always use "Login with GitHub" button

### **GitHub OAuth redirects to wrong URL**
- [ ] Make sure `http://localhost:5000/api/auth/github/callback` is registered in GitHub app
- [ ] Don't use `https://` for local development
- [ ] Use exact URL without trailing slash

---

## 📋 Quick Checklist

- [ ] Created GitHub OAuth App
- [ ] Copied Client ID and Secret
- [ ] Updated `server/.env` with credentials
- [ ] Updated `client/.env` with Client ID
- [ ] Restarted both servers
- [ ] Tested GitHub login
- [ ] Tested code push to GitHub

---

## 🚀 You're All Set!

Your application now supports:
- ✅ GitHub login/signup
- ✅ Real-time code collaboration
- ✅ Direct code push to GitHub repositories

Happy coding! 🎉

---

## 📞 Need Help?

**Check these files for more info:**
- `client/src/pages/Login.jsx` - GitHub login logic
- `client/src/pages/Register.jsx` - GitHub signup logic
- `server/controllers/authController.js` - OAuth callback handling
- `server/controllers/githubController.js` - Push to GitHub logic

---

**For Production Deployment:**

When moving to production, update:
1. **Homepage URL** in GitHub OAuth app settings
2. **Authorization callback URL** in GitHub OAuth app settings
3. `client/.env` with production frontend URL
4. `server/.env` with production backend URL
5. `CLIENT_URL` in `server/.env` with production frontend domain
