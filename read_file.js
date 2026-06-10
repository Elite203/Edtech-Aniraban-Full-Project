const fs = require('fs');
const content = fs.readFileSync('e:\\Anirban Full backend\\final\\src\\pages\\SetQuestions.jsx', 'utf-8');
const lines = content.split('\n');

// Print lines 880-920
console.log("Context around line 887:\n");
for (let i = 879; i < Math.min(920, lines.length); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
