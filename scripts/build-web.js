import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const distWebDir = path.join(process.cwd(), 'dist', 'web');

try {
  console.log('🔨 Expo 웹 번들 생성 중...');
  
  // dist/web 디렉토리 정리
  if (fs.existsSync(distWebDir)) {
    fs.rmSync(distWebDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distWebDir, { recursive: true });

  // Expo export 실행
  try {
    execSync('npx expo export --platform web --output-dir dist/web', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Expo 웹 번들 생성 완료');
  } catch (error) {
    console.warn('⚠️ Expo export 실패, 대체 방법 사용 중...');
    
    // 대체: Metro 번들러 사용
    try {
      execSync('npx expo start --web --offline --output-dir dist/web', {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: 60000,
        env: { ...process.env, NODE_ENV: 'production' }
      });
    } catch (metroError) {
      console.warn('⚠️ Metro 번들도 실패, 기본 HTML 생성');
      generateFallbackHTML();
    }
  }
} catch (error) {
  console.error('❌ 빌드 실패:', error.message);
  generateFallbackHTML();
  process.exit(1);
}

function generateFallbackHTML() {
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StarQuest - 별자리 성취 관리</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: #0a0e1a; 
      color: #e2e8f0; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
    }
    .container { 
      text-align: center; 
      padding: 20px; 
      max-width: 500px;
    }
    h1 { 
      font-size: 2.5em; 
      margin-bottom: 10px; 
      color: #f5c842; 
    }
    p { 
      font-size: 1.2em; 
      margin-bottom: 30px; 
      color: #718096; 
    }
    .button { 
      display: inline-block; 
      padding: 15px 40px; 
      background: #f5c842; 
      color: #0a0e1a; 
      border: none; 
      border-radius: 50px; 
      font-size: 1.1em; 
      font-weight: 600; 
      cursor: pointer; 
      text-decoration: none;
      margin: 10px;
    }
    .button:hover { 
      background: #e6b800; 
    }
    .info { 
      margin-top: 40px; 
      padding: 20px; 
      background: #111827; 
      border-radius: 10px; 
    }
    .info p { 
      font-size: 0.95em; 
      margin: 10px 0; 
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✨ StarQuest</h1>
    <p>별자리 성취 관리</p>
    <p>앱이 준비 중입니다.</p>
    <button class="button" onclick="location.reload()">새로고침</button>
    <div class="info">
      <p>💡 iPhone Expo Go 앱에서 QR 코드를 스캔하여 사용하세요.</p>
      <p>또는 Safari 홈화면에 추가하여 앱처럼 사용할 수 있습니다.</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(distWebDir, 'index.html'), htmlContent);
  console.log('✅ 기본 HTML 생성 완료');
}
