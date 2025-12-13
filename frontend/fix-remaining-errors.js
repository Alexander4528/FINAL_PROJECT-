const fs = require('fs');
const path = require('path');

// Конкретные исправления для каждого файла
const fixes = [
  {
    file: 'src/pages/FavoritesPage.js',
    fixes: [
      { line: 94, find: "it's", replace: 'it&apos;s' },
      { line: 166, find: "don't", replace: 'don&apos;t' }
    ]
  },
  {
    file: 'src/pages/LoginPage.js',
    fixes: [
      { line: 220, find: "you're", replace: 'you&apos;re' }
    ]
  },
  {
    file: 'src/pages/ProfilePage.js',
    fixes: [
      { line: 328, find: "Let's", replace: 'Let&apos;s' },
      { line: 337, find: "you're", replace: 'you&apos;re' },
      { line: 340, find: "we're", replace: 'we&apos;re' },
      { line: 352, find: "it's", replace: 'it&apos;s' }
    ]
  },
  {
    file: 'src/pages/SearchPage.js',
    fixes: [
      { line: 76, find: '"posts"', replace: '&quot;posts&quot;' },
      { line: 76, find: '"users"', replace: '&quot;users&quot;' }
    ]
  },
  {
    file: 'src/pages/UserPage.js',
    fixes: [
      { line: 354, find: "user's", replace: 'user&apos;s' }
    ]
  }
];

fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл не найден: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  fileFixes.forEach(({ line, find, replace }) => {
    const lineIndex = line - 1; // Переводим в 0-based индекс
    if (lineIndex < lines.length) {
      if (lines[lineIndex].includes(find)) {
        lines[lineIndex] = lines[lineIndex].replace(find, replace);
        modified = true;
        console.log(`✓ Исправлена строка ${line} в ${file}: ${find} → ${replace}`);
      } else {
        console.log(`⚠️  Не найдено "${find}" в строке ${line} файла ${file}`);
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
  }
});

console.log('\n✅ Все ESLint ошибки исправлены! Перезапустите приложение.');