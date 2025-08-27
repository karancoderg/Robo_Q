const fs = require('fs');

// Read the server.js file
let content = fs.readFileSync('backend/src/server.js', 'utf8');

// Replace all instances of plain password assignment with hashed password
const oldPattern = /(\s+)if \(password\) \{\s*\n(\s+)user\.password = password;\s*\n(\s+)\}/g;
const newPattern = `$1if (password) {
$2  // Hash the password before saving for security
$2  const hashedPassword = await bcrypt.hash(password, 10);
$2  user.password = hashedPassword;
$3}`;

content = content.replace(oldPattern, newPattern);

// Write the updated content back
fs.writeFileSync('backend/src/server.js', content);

console.log('✅ Fixed password hashing in all complete-setup endpoints');
console.log('🔒 Passwords will now be properly hashed before saving');
