const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/EditPostPage.js',
  'src/pages/EditProfilePage.js',
  'src/pages/FavoritesPage.js',
  'src/pages/LoginPage.js',
  'src/pages/NotFoundPage.js',
  'src/pages/PostPage.js',
  'src/pages/ProfilePage.js',
  'src/pages/SearchPage.js',
  'src/pages/UserPage.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Заменяем все апострофы
    content = content
      .replace(/it's/g, 'it&apos;s')
      .replace(/don't/g, 'don&apos;t')
      .replace(/doesn't/g, 'doesn&apos;t')
      .replace(/can't/g, 'can&apos;t')
      .replace(/won't/g, 'won&apos;t')
      .replace(/you're/g, 'you&apos;re')
      .replace(/we're/g, 'we&apos;re')
      .replace(/they're/g, 'they&apos;re')
      .replace(/I'm/g, 'I&apos;m')
      .replace(/Let's/g, 'Let&apos;s')
      .replace(/author's/g, 'author&apos;s')
      .replace(/user's/g, 'user&apos;s')
      .replace(/post's/g, 'post&apos;s')
      .replace(/haven't/g, 'haven&apos;t');
    
    // Заменяем кавычки
    content = content.replace(/"posts"/g, '&quot;posts&quot;');
    content = content.replace(/"users"/g, '&quot;users&quot;');
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Исправлен: ${file}`);
  }
});

console.log('✅ Все апострофы исправлены!');