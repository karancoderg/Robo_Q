const fs = require('fs');

// Read the server.js file
let content = fs.readFileSync('backend/src/server.js', 'utf8');

// Replace the manual hashing with direct assignment (let the model handle hashing)
const oldPattern = /(\s+)if \(password\) \{\s*\n(\s+)\/\/ Hash the password before saving for security\s*\n(\s+)const hashedPassword = await bcrypt\.hash\(password, 10\);\s*\n(\s+)user\.password = hashedPassword;\s*\n(\s+)\}/g;

const newPattern = `$1if (password) {
$2  // Let the User model's pre-save hook handle password hashing
$2  user.password = password;
$5}`;

content = content.replace(oldPattern, newPattern);

// Write the updated content back
fs.writeFileSync('backend/src/server.js', content);

console.log('✅ Fixed double password hashing issue');
console.log('🔒 User model pre-save hook will now handle all password hashing');
console.log('📝 Complete-setup endpoints updated to avoid double hashing');
