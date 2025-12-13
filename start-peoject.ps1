Write-Host "Запуск проекта Blog Platform..." -ForegroundColor Green
Write-Host ""

Write-Host "Шаг 1: Запуск бэкенда..." -ForegroundColor Cyan
cd backend
npm install --legacy-peer-deps
npx prisma migrate dev --name init
Start-Process cmd -ArgumentList "/k npm run dev" -WindowStyle Normal

Write-Host "Шаг 2: Запуск фронтенда..." -ForegroundColor Cyan
cd ../frontend
npm install --legacy-peer-deps
Start-Process cmd -ArgumentList "/k npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Проект запущен!" -ForegroundColor Green
Write-Host "🌐 Бэкенд: http://localhost:5000" -ForegroundColor Yellow
Write-Host "🎨 Фронтенд: http://localhost:3000" -ForegroundColor Yellow
Write-Host "📝 API проверка: http://localhost:5000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Чтобы остановить проект, закройте оба окна командной строки." -ForegroundColor Gray
pause