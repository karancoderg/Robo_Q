// Comprehensive React Key Debugging Script
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging React Key Issues\n');

// Function to find all .map() calls without proper keys
function findMapCallsWithoutKeys(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      // Look for .map( calls
      if (line.includes('.map(')) {
        const lineNumber = index + 1;
        
        // Check if there's a key prop in the next few lines
        let hasKey = false;
        for (let i = index; i < Math.min(index + 10, lines.length); i++) {
          if (lines[i].includes('key=')) {
            hasKey = true;
            break;
          }
        }
        
        if (!hasKey) {
          issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim()
          });
        }
      }
      
      // Look for React Fragments without keys
      if (line.includes('<>') || line.includes('</>')){
        const lineNumber = index + 1;
        issues.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'fragment'
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Function to recursively find all React files
function findReactFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
        files.push(...findReactFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

// Main debugging function
function debugReactKeys() {
  const frontendDir = '/home/karandeep/robo_Q/frontend/src';
  const reactFiles = findReactFiles(frontendDir);
  
  console.log(`Found ${reactFiles.length} React files to analyze\n`);
  
  let totalIssues = 0;
  
  reactFiles.forEach(file => {
    const issues = findMapCallsWithoutKeys(file);
    
    if (issues.length > 0) {
      console.log(`📄 ${file.replace('/home/karandeep/robo_Q/frontend/src/', '')}:`);
      
      issues.forEach(issue => {
        totalIssues++;
        if (issue.type === 'fragment') {
          console.log(`  ⚠️  Line ${issue.line}: Fragment without key - ${issue.content}`);
        } else {
          console.log(`  ❌ Line ${issue.line}: .map() without key - ${issue.content}`);
        }
      });
      console.log('');
    }
  });
  
  if (totalIssues === 0) {
    console.log('✅ No obvious React key issues found!');
  } else {
    console.log(`\n📊 Summary: Found ${totalIssues} potential React key issues`);
  }
  
  // Additional checks
  console.log('\n🔧 Additional Recommendations:');
  console.log('1. Check browser console for exact React warnings');
  console.log('2. Look for dynamic arrays being rendered');
  console.log('3. Ensure all list items have stable, unique keys');
  console.log('4. Avoid using array indices as keys when possible');
  console.log('5. Check for conditional rendering that might cause key conflicts');
}

// Run the debugging
debugReactKeys();

// Also check for common React patterns that might cause issues
console.log('\n🔍 Checking for common React anti-patterns...');

const headerFile = '/home/karandeep/robo_Q/frontend/src/components/Header.tsx';
if (fs.existsSync(headerFile)) {
  const headerContent = fs.readFileSync(headerFile, 'utf8');
  
  // Check for specific patterns
  const patterns = [
    { pattern: /notifications\.slice\(.*\)\.map/, description: 'Notifications mapping' },
    { pattern: /\{.*&&.*\(\s*<>/, description: 'Conditional fragments' },
    { pattern: /key=\{.*index.*\}/, description: 'Index-based keys (potentially problematic)' }
  ];
  
  patterns.forEach(({ pattern, description }) => {
    const matches = headerContent.match(pattern);
    if (matches) {
      console.log(`  ⚠️  Found: ${description}`);
    }
  });
}

console.log('\n✅ React Key Debugging Complete!');
