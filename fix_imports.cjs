const fs = require('fs');
const path = require('path');
const dirs = ['Admin', 'Auth', 'Exam', 'Performance', 'Public', 'User', 'CurrentAffairs'];
dirs.forEach(dir => {
  const dirPath = path.join('e:/Anirban Full backend/final/src/pages', dir);
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const filePath = path.join(dirPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix imports starting with ../
      content = content.replace(/from\s+['"]\.\.\//g, "from '../../");
      content = content.replace(/import\s+['"]\.\.\//g, "import '../../");
      
      fs.writeFileSync(filePath, content);
    }
  });
});
console.log('Fixed relative imports in subdirectories');
