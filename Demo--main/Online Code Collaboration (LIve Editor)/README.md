# Nexus - Real-time Code Collaboration Platform

## ✨ Features

- ✅ **Real-time Code Collaboration** - Multiple users editing simultaneously
- ✅ **GitHub OAuth Authentication** - Secure login with GitHub
- ✅ **Terminal Execution** - Run code directly in the browser
- ✅ **GitHub Integration** - Push code directly to GitHub repositories
- ✅ **AI Code Suggestions** - Get intelligent code completions
- ✅ **Live Chat** - Communicate with collaborators in real-time
- ✅ **Multi-language Support** - 30+ programming languages

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MongoDB (local or Atlas)
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**
```bash
cd "Online Code Collaboration (LIve Editor)"
```

2. **Install dependencies**
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

3. **Configure GitHub OAuth**

   a. Go to https://github.com/settings/developers
   
   b. Click **OAuth Apps** → **New OAuth App**
   
   c. Fill in:
   - Application name: `Nexus`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
   
   d. Copy your **Client ID** and **Client Secret**

4. **Setup Environment Variables**

   **server/.env**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/nexus_collaboration
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   
   # Code Execution
   ALLOW_CODE_EXECUTION=true
   MAX_EXECUTION_TIME=5000
   ```

   **client/.env**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_GITHUB_CLIENT_ID=your_client_id_here
   REACT_APP_ENABLE_AI_CHAT=true
   REACT_APP_ENABLE_TERMINAL=true
   ```

5. **Start the servers**

   **Terminal 1 - Backend**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend**
   ```bash
   cd client
   npm start
   ```

6. **Verify Setup**
```bash
node verify-setup.js
```

---

## 🔐 GitHub Authentication

### How It Works

1. User clicks "Login with GitHub" on login page
2. Redirected to GitHub authorization page
3. User authorizes the application
4. GitHub redirects back with authorization code
5. Server exchanges code for access token
6. User is logged in and token is stored

### Features

- ✅ Automatic user creation on first login
- ✅ GitHub profile information synced
- ✅ Access token stored securely
- ✅ Seamless integration with code push

### Testing

1. Go to http://localhost:3000/login
2. Click "Login with GitHub"
3. Authorize the application
4. You should be redirected to dashboard

---

## 💻 Terminal Execution

### Features

- ✅ Execute code in 30+ languages
- ✅ Real-time output display
- ✅ Error handling and display
- ✅ Execution history tracking
- ✅ Copy/download output
- ✅ GitHub push integration

### Supported Languages

JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, HTML, CSS, JSON, SQL, and more.

### Usage

1. Write code in the editor
2. Select language from dropdown
3. Click "Run" button
4. Output appears in terminal
5. Click "Push" to push to GitHub

### Testing

1. Create a new project
2. Write test code:
   ```javascript
   console.log("Hello, World!");
   ```
3. Click "Run"
4. Verify output appears

---

## 📤 GitHub Push

### How It Works

1. User must be logged in via GitHub OAuth
2. Click "Push" button in terminal
3. Select repository from dropdown
4. Enter commit message
5. Code is pushed to selected repository

### Features

- ✅ List all user repositories
- ✅ Push to any repository
- ✅ Custom commit messages
- ✅ Branch selection
- ✅ Error handling

### Testing

1. Login with GitHub
2. Write code in editor
3. Click "Push" button
4. Select a repository
5. Enter commit message
6. Click "Push"
7. Verify code appears in GitHub

---

## 📁 .gitignore

The project includes a comprehensive .gitignore that excludes:

- ✅ Environment variables (.env files)
- ✅ Dependencies (node_modules)
- ✅ Build outputs (dist, build)
- ✅ IDE files (.vscode, .idea)
- ✅ Logs and temporary files
- ✅ Sensitive files (keys, certificates)

### Important

Never commit:
- `.env` files with credentials
- GitHub OAuth secrets
- API keys and tokens
- Database credentials
- Private keys

---

## 🛠️ Project Structure

```
Online Code Collaboration (LIve Editor)/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── editor/
│   │   │       └── Terminal.jsx (enhanced)
│   │   ├── pages/
│   │   │   ├── Editor.jsx (updated)
│   │   │   ├── Login.jsx
│   │   │   └── GitHubCallback.jsx (new)
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── githubAuth.js (new)
│   │   ├── styles/
│   │   │   └── terminal.css (new)
│   │   └── App.jsx (updated)
│   └── .env
├── server/
│   ├── controllers/
│   │   ├── authController.js (updated)
│   │   └── githubController.js
│   ├── routes/
│   │   ├── auth.js (updated)
│   │   └── github.js
│   ├── models/
│   │   └── User.js (updated)
│   ├── index.js (updated)
│   └── .env
├── .gitignore (updated)
├── SETUP_GUIDE.md
├── IMPLEMENTATION_CHECKLIST.md
└── verify-setup.js
```

---

## 🐛 Troubleshooting

### GitHub Login Issues

**Error: "GitHub not connected"**
- Solution: Use "Login with GitHub" button, not email/password
- Email login doesn't connect to GitHub

**Error: "Failed to fetch repositories"**
- Solution: 
  - Verify GitHub token is valid
  - Re-authenticate with GitHub
  - Check network connection

**Error: "404 on GitHub callback"**
- Solution:
  - Verify `GITHUB_REDIRECT_URI` matches exactly in GitHub app settings
  - Use: `http://localhost:5000/api/auth/github/callback`
  - Restart servers after updating .env

### Terminal Issues

**Error: "Failed to execute code"**
- Solution:
  - Check code syntax
  - Verify language is correct
  - Check server logs for details
  - Ensure `ALLOW_CODE_EXECUTION=true` in server .env

**Terminal not showing**
- Solution:
  - Verify `REACT_APP_ENABLE_TERMINAL=true` in client .env
  - Restart client server
  - Check browser console for errors

### .gitignore Issues

**Error: ".env files still being tracked"**
- Solution:
  - Remove from git: `git rm --cached .env`
  - Commit: `git commit -m "Remove .env from tracking"`
  - Verify .gitignore is correct

---

## 🔒 Security Best Practices

1. **Never commit .env files** - Always use .gitignore
2. **Rotate GitHub tokens** - Periodically refresh OAuth tokens
3. **Use HTTPS in production** - Update callback URLs for production
4. **Validate all inputs** - Server validates code before execution
5. **Limit execution time** - Set `MAX_EXECUTION_TIME` in .env
6. **Use strong JWT secret** - Change `JWT_SECRET` in production

---

## 📊 Environment Variables Reference

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/nexus |
| JWT_SECRET | JWT signing key | your_secret_key |
| GITHUB_CLIENT_ID | GitHub OAuth ID | Ov23li... |
| GITHUB_CLIENT_SECRET | GitHub OAuth secret | 165faea... |
| GITHUB_REDIRECT_URI | OAuth callback URL | http://localhost:5000/api/auth/github/callback |
| CLIENT_URL | Frontend URL | http://localhost:3000 |
| ALLOW_CODE_EXECUTION | Enable code execution | true |
| MAX_EXECUTION_TIME | Max execution time (ms) | 5000 |

### Client (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |
| REACT_APP_SOCKET_URL | WebSocket URL | http://localhost:5000 |
| REACT_APP_GITHUB_CLIENT_ID | GitHub OAuth ID | Ov23li... |
| REACT_APP_ENABLE_AI_CHAT | Enable AI chat | true |
| REACT_APP_ENABLE_TERMINAL | Enable terminal | true |

---

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Step-by-step verification
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub OAuth setup guide

---

## 🚀 Deployment

### For Production

1. Update GitHub OAuth app settings:
   - Homepage URL: Your production domain
   - Authorization callback URL: Your production callback URL

2. Update environment variables:
   - `GITHUB_REDIRECT_URI`: Production callback URL
   - `CLIENT_URL`: Production frontend URL
   - `JWT_SECRET`: Strong random secret
   - `MONGODB_URI`: Production MongoDB connection

3. Enable HTTPS:
   - Update all URLs to use HTTPS
   - Update GitHub OAuth settings

4. Set up proper logging and monitoring

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the setup guides
3. Check server logs: `npm run dev`
4. Check browser console: F12
5. Verify .env files are configured

---

## 📝 License

This project is part of the Nexus collaboration platform.

---

## ✅ Verification Checklist

- [ ] GitHub OAuth app created
- [ ] Environment variables configured
- [ ] Servers started successfully
- [ ] GitHub login works
- [ ] Terminal execution works
- [ ] GitHub push works
- [ ] .gitignore is working
- [ ] All files are in place

---

**Last Updated**: 2024
**Status**: Ready for Production
