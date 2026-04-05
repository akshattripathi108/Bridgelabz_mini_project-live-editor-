# GitHub Authentication & Terminal Setup Guide

## Overview
This guide covers setting up GitHub OAuth authentication and terminal execution with proper .gitignore management.

---

## Part 1: GitHub OAuth Setup

### Step 1: Create GitHub OAuth Application

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: Nexus
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:5000/api/auth/github/callback
4. Click **Register application**
5. Copy your **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

**Server (.env)**
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

**Client (.env)**
```env
REACT_APP_GITHUB_CLIENT_ID=your_client_id_here
```

### Step 3: Update Server Routes

Add GitHub auth routes to `server/index.js`:

```javascript
const authGithubRoutes = require('./routes/authGithub');
app.use('/api/auth', authGithubRoutes);
```

### Step 4: Update Client Router

Add GitHub callback route to your router:

```javascript
import GitHubCallback from './pages/GitHubCallback';

// In your routes
<Route path="/auth/github/callback" element={<GitHubCallback />} />
```

---

## Part 2: Terminal Integration

### Features
- ✅ Code execution with real-time output
- ✅ Error handling and display
- ✅ Execution history tracking
- ✅ Output copy/download functionality
- ✅ GitHub push integration

### Usage

The Terminal component accepts:
```jsx
<Terminal 
  code={codeString}
  language="javascript"
  roomId={projectRoomId}
/>
```

### GitHub Push Feature

1. User must be authenticated via GitHub OAuth
2. Click "Push" button in terminal
3. Select repository from dropdown
4. Enter commit message
5. Code is pushed to selected repository

---

## Part 3: .gitignore Management

### What's Ignored
- ✅ `node_modules/` - Dependencies
- ✅ `.env` files - Sensitive credentials
- ✅ Build outputs - `dist/`, `build/`
- ✅ IDE files - `.vscode/`, `.idea/`
- ✅ Logs - `*.log`
- ✅ OS files - `.DS_Store`, `Thumbs.db`
- ✅ Temporary files - `*.tmp`, `temp/`

### Important: Never Commit
- Environment variables (.env files)
- GitHub OAuth credentials
- API keys and tokens
- Database credentials
- Private keys (.pem, .key files)

---

## Part 4: Testing

### Test GitHub Authentication
1. Start both servers:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm start
   ```

2. Go to http://localhost:3000/login
3. Click "Login with GitHub"
4. Authorize the application
5. You should be redirected to dashboard

### Test Terminal Execution
1. Create a new project
2. Write some code
3. Click "Run" button
4. Verify output appears

### Test GitHub Push
1. Ensure you're logged in via GitHub
2. Write code in editor
3. Click "Push" button
4. Select repository and enter message
5. Verify code appears in GitHub

---

## Troubleshooting

### "GitHub not connected" error
- **Solution**: Login using "Login with GitHub" button, not email/password
- Email login doesn't connect to GitHub

### "Failed to fetch repositories"
- **Solution**: 
  - Verify GitHub token is valid
  - Re-authenticate with GitHub
  - Check network connection

### "404 on GitHub callback"
- **Solution**:
  - Verify `GITHUB_REDIRECT_URI` matches exactly in GitHub app settings
  - Use: `http://localhost:5000/api/auth/github/callback`
  - Restart servers after updating .env

### Terminal shows "Failed to execute code"
- **Solution**:
  - Check code syntax
  - Verify language is correct
  - Check server logs for details
  - Ensure `ALLOW_CODE_EXECUTION=true` in server .env

### .gitignore not working
- **Solution**:
  - If files were already committed, remove them:
    ```bash
    git rm --cached .env
    git commit -m "Remove .env from tracking"
    ```
  - Then commit updated .gitignore

---

## Security Best Practices

1. **Never commit .env files** - Always use .gitignore
2. **Rotate GitHub tokens** - Periodically refresh OAuth tokens
3. **Use HTTPS in production** - Update callback URLs for production
4. **Validate all inputs** - Server validates code before execution
5. **Limit execution time** - Set `MAX_EXECUTION_TIME` in .env

---

## File Structure

```
project/
├── .gitignore (comprehensive)
├── client/
│   ├── .env (ignored)
│   └── src/
│       ├── components/editor/Terminal.jsx (enhanced)
│       ├── pages/GitHubCallback.jsx (new)
│       └── utils/githubAuth.js (new)
├── server/
│   ├── .env (ignored)
│   ├── controllers/
│   │   ├── authGithubController.js (new)
│   │   └── githubController.js (existing)
│   └── routes/
│       ├── authGithub.js (new)
│       └── github.js (existing)
└── GITHUB_SETUP.md (this file)
```

---

## Next Steps

1. ✅ Create GitHub OAuth app
2. ✅ Update .env files
3. ✅ Restart servers
4. ✅ Test GitHub login
5. ✅ Test terminal execution
6. ✅ Test GitHub push
7. ✅ Verify .gitignore is working

---

## Support

For issues:
1. Check server logs: `npm run dev`
2. Check browser console: F12
3. Verify .env files are configured
4. Ensure ports 3000 and 5000 are available
