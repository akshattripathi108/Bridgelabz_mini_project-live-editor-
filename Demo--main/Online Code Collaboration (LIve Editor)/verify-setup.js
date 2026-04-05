#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const checks = [];

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    name: description,
    status: exists ? '✓' : '✗',
    path: filePath,
  });
  return exists;
}

function checkEnvVariable(envPath, variable) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const exists = content.includes(variable);
    checks.push({
      name: `${variable} in ${path.basename(envPath)}`,
      status: exists ? '✓' : '✗',
      path: envPath,
    });
    return exists;
  } catch (error) {
    checks.push({
      name: `${variable} in ${path.basename(envPath)}`,
      status: '✗',
      path: envPath,
    });
    return false;
  }
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   GitHub Authentication & Terminal Setup Verification    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Check server files
console.log('📁 Server Files:');
checkFile('./server/models/User.js', 'User model with GitHub fields');
checkFile('./server/controllers/authController.js', 'Auth controller with GitHub callback');
checkFile('./server/routes/auth.js', 'Auth routes with GitHub endpoints');
checkFile('./server/routes/github.js', 'GitHub routes');
checkFile('./server/controllers/githubController.js', 'GitHub controller');
checkFile('./server/index.js', 'Server index with routes');

// Check client files
console.log('\n📁 Client Files:');
checkFile('./client/src/pages/GitHubCallback.jsx', 'GitHub callback page');
checkFile('./client/src/utils/githubAuth.js', 'GitHub auth utility');
checkFile('./client/src/components/editor/Terminal.jsx', 'Enhanced Terminal component');
checkFile('./client/src/styles/terminal.css', 'Terminal styles');
checkFile('./client/src/pages/Editor.jsx', 'Editor page with Terminal');
checkFile('./client/src/App.jsx', 'App with GitHub callback route');

// Check environment variables
console.log('\n🔐 Environment Variables:');
checkEnvVariable('./server/.env', 'GITHUB_CLIENT_ID');
checkEnvVariable('./server/.env', 'GITHUB_CLIENT_SECRET');
checkEnvVariable('./server/.env', 'GITHUB_REDIRECT_URI');
checkEnvVariable('./client/.env', 'REACT_APP_GITHUB_CLIENT_ID');

// Check .gitignore
console.log('\n📋 .gitignore:');
checkFile('./.gitignore', '.gitignore file');

// Check documentation
console.log('\n📚 Documentation:');
checkFile('./SETUP_GUIDE.md', 'Setup guide');
checkFile('./IMPLEMENTATION_CHECKLIST.md', 'Implementation checklist');

// Print results
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    Verification Results                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const passed = checks.filter(c => c.status === '✓').length;
const total = checks.length;

checks.forEach(check => {
  const icon = check.status === '✓' ? '✓' : '✗';
  const color = check.status === '✓' ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  console.log(`${color}${icon}${reset} ${check.name}`);
});

console.log(`\n${passed}/${total} checks passed\n`);

if (passed === total) {
  console.log('✓ All checks passed! Your setup is complete.\n');
  console.log('Next steps:');
  console.log('1. Update GitHub OAuth credentials in .env files');
  console.log('2. Start servers: npm run dev (server) and npm start (client)');
  console.log('3. Test GitHub login at http://localhost:3000/login');
  console.log('4. Test terminal execution in the editor');
  console.log('5. Test GitHub push functionality\n');
  process.exit(0);
} else {
  console.log('✗ Some checks failed. Please review the missing files.\n');
  process.exit(1);
}
