import fs from 'fs';
import path from 'path';

const distWebDir = path.join(process.cwd(), 'dist', 'web');

// dist/web 디렉토리 생성
if (!fs.existsSync(distWebDir)) {
  fs.mkdirSync(distWebDir, { recursive: true });
}

// index.html 생성
const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StarQuest - 별자리 성취 관리</title>
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: #0a0e1a; 
      color: #e2e8f0; 
    }
    .app { min-height: 100vh; display: flex; flex-direction: column; }
    .header { 
      background: linear-gradient(135deg, #1a1f3a 0%, #0a0e1a 100%);
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #333;
    }
    .header h1 { color: #f5c842; font-size: 2em; margin-bottom: 5px; }
    .header p { color: #718096; font-size: 0.9em; }
    .content { flex: 1; padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #333; }
    .tab-btn { 
      padding: 10px 20px; 
      background: none; 
      border: none; 
      color: #718096; 
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;
    }
    .tab-btn.active { 
      color: #f5c842; 
      border-bottom-color: #f5c842;
    }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .achievement-list { display: grid; gap: 10px; }
    .achievement-item {
      background: #111827;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #f5c842;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .achievement-item.completed {
      opacity: 0.6;
      border-left-color: #4ade80;
    }
    .achievement-title { font-weight: 600; }
    .achievement-category { font-size: 0.85em; color: #718096; margin-top: 5px; }
    .input-group { display: flex; gap: 10px; margin-bottom: 20px; }
    .input-group input { 
      flex: 1; 
      padding: 10px; 
      background: #111827; 
      border: 1px solid #333; 
      color: #e2e8f0; 
      border-radius: 4px;
    }
    .input-group button { 
      padding: 10px 20px; 
      background: #f5c842; 
      color: #0a0e1a; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-weight: 600;
    }
    .input-group button:hover { background: #e6b800; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
    .stat-card {
      background: #111827;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #333;
    }
    .stat-number { font-size: 2em; color: #f5c842; font-weight: bold; }
    .stat-label { color: #718096; font-size: 0.9em; margin-top: 5px; }
    .button-group { display: flex; gap: 10px; flex-wrap: wrap; }
    .button { 
      padding: 10px 15px; 
      background: #111827; 
      color: #e2e8f0; 
      border: 1px solid #333; 
      border-radius: 4px; 
      cursor: pointer;
      transition: all 0.3s;
    }
    .button:hover { background: #1a2332; }
    .button.danger { color: #f87171; border-color: #f87171; }
    .button.success { color: #4ade80; border-color: #4ade80; }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #718096; 
      font-size: 0.9em;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const { useState, useEffect } = React;
    const root = ReactDOM.createRoot(document.getElementById('root'));

    function StarQuestApp() {
      const [achievements, setAchievements] = useState([]);
      const [newTitle, setNewTitle] = useState('');
      const [activeTab, setActiveTab] = useState('home');

      // 로컬 스토리지에서 로드
      useEffect(() => {
        const saved = localStorage.getItem('starquest_achievements');
        if (saved) {
          try {
            setAchievements(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to load achievements:', e);
          }
        }
      }, []);

      // 로컬 스토리지에 저장
      const saveAchievements = (items) => {
        setAchievements(items);
        localStorage.setItem('starquest_achievements', JSON.stringify(items));
      };

      const addAchievement = () => {
        if (newTitle.trim()) {
          const newItem = {
            id: Date.now(),
            title: newTitle,
            category: '일반',
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
          };
          saveAchievements([...achievements, newItem]);
          setNewTitle('');
        }
      };

      const toggleAchievement = (id) => {
        const updated = achievements.map(item =>
          item.id === id
            ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null }
            : item
        );
        saveAchievements(updated);
      };

      const deleteAchievement = (id) => {
        saveAchievements(achievements.filter(item => item.id !== id));
      };

      const clearAll = () => {
        if (confirm('정말 모든 성취를 삭제하시겠습니까?')) {
          saveAchievements([]);
        }
      };

      const stats = {
        total: achievements.length,
        completed: achievements.filter(a => a.completed).length,
        pending: achievements.filter(a => !a.completed).length,
        completionRate: achievements.length > 0 ? Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100) : 0
      };

      return React.createElement('div', { className: 'app' },
        React.createElement('div', { className: 'header' },
          React.createElement('h1', null, '✨ StarQuest'),
          React.createElement('p', null, '별자리 성취 관리')
        ),

        React.createElement('div', { className: 'content' },
          React.createElement('div', { className: 'tabs' },
            React.createElement('button', { 
              className: \`tab-btn \${activeTab === 'home' ? 'active' : ''}\`,
              onClick: () => setActiveTab('home')
            }, '🏠 홈'),
            React.createElement('button', { 
              className: \`tab-btn \${activeTab === 'stats' ? 'active' : ''}\`,
              onClick: () => setActiveTab('stats')
            }, '📊 통계'),
            React.createElement('button', { 
              className: \`tab-btn \${activeTab === 'settings' ? 'active' : ''}\`,
              onClick: () => setActiveTab('settings')
            }, '⚙️ 설정')
          ),

          React.createElement('div', { className: \`tab-content \${activeTab === 'home' ? 'active' : ''}\` },
            React.createElement('div', { className: 'input-group' },
              React.createElement('input', {
                type: 'text',
                placeholder: '새로운 성취를 입력하세요...',
                value: newTitle,
                onChange: (e) => setNewTitle(e.target.value),
                onKeyPress: (e) => e.key === 'Enter' && addAchievement()
              }),
              React.createElement('button', { onClick: addAchievement }, '추가')
            ),

            React.createElement('div', { className: 'achievement-list' },
              achievements.length === 0
                ? React.createElement('p', { style: { color: '#718096', textAlign: 'center', padding: '20px' } }, '성취를 추가해보세요! ⭐')
                : achievements.map(item =>
                    React.createElement('div', { key: item.id, className: \`achievement-item \${item.completed ? 'completed' : ''}\` },
                      React.createElement('div', null,
                        React.createElement('div', { className: 'achievement-title', style: { textDecoration: item.completed ? 'line-through' : 'none' } },
                          (item.completed ? '✓ ' : '○ ') + item.title
                        ),
                        React.createElement('div', { className: 'achievement-category' }, item.category)
                      ),
                      React.createElement('div', { className: 'button-group' },
                        React.createElement('button', { 
                          className: \`button \${item.completed ? 'success' : ''}\`,
                          onClick: () => toggleAchievement(item.id)
                        }, item.completed ? '취소' : '완료'),
                        React.createElement('button', { 
                          className: 'button danger',
                          onClick: () => deleteAchievement(item.id)
                        }, '삭제')
                      )
                    )
                  )
            )
          ),

          React.createElement('div', { className: \`tab-content \${activeTab === 'stats' ? 'active' : ''}\` },
            React.createElement('div', { className: 'stats-grid' },
              React.createElement('div', { className: 'stat-card' },
                React.createElement('div', { className: 'stat-number' }, stats.total),
                React.createElement('div', { className: 'stat-label' }, '전체 성취')
              ),
              React.createElement('div', { className: 'stat-card' },
                React.createElement('div', { className: 'stat-number' }, stats.completed),
                React.createElement('div', { className: 'stat-label' }, '완료된 성취')
              ),
              React.createElement('div', { className: 'stat-card' },
                React.createElement('div', { className: 'stat-number' }, stats.pending),
                React.createElement('div', { className: 'stat-label' }, '진행 중')
              ),
              React.createElement('div', { className: 'stat-card' },
                React.createElement('div', { className: 'stat-number' }, stats.completionRate + '%'),
                React.createElement('div', { className: 'stat-label' }, '완료율')
              )
            )
          ),

          React.createElement('div', { className: \`tab-content \${activeTab === 'settings' ? 'active' : ''}\` },
            React.createElement('div', { style: { padding: '20px', background: '#111827', borderRadius: '8px' } },
              React.createElement('h3', { style: { marginBottom: '15px' } }, '설정'),
              React.createElement('p', { style: { color: '#718096', marginBottom: '15px' } }, '💾 데이터는 브라우저 로컬 저장소에 자동 저장됩니다.'),
              React.createElement('div', { className: 'button-group' },
                React.createElement('button', { 
                  className: 'button',
                  onClick: () => {
                    const data = JSON.stringify(achievements, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`starquest_backup_\${new Date().toISOString().split('T')[0]}.json\`;
                    a.click();
                  }
                }, '📥 백업 다운로드'),
                React.createElement('button', { 
                  className: 'button',
                  onClick: () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target.result);
                          if (Array.isArray(data)) {
                            saveAchievements(data);
                            alert('백업이 복구되었습니다!');
                          }
                        } catch (err) {
                          alert('파일 형식이 올바르지 않습니다.');
                        }
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }
                }, '📤 백업 복구'),
                React.createElement('button', { 
                  className: 'button danger',
                  onClick: clearAll
                }, '🗑️ 모두 삭제')
              )
            )
          )
        ),

        React.createElement('div', { className: 'footer' },
          React.createElement('p', null, '🌟 StarQuest - 별자리 성취 관리 앱'),
          React.createElement('p', null, '데이터는 브라우저에 안전하게 저장됩니다')
        )
      );
    }

    root.render(React.createElement(StarQuestApp));
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(distWebDir, 'index.html'), htmlContent);
console.log('✅ dist/web/index.html 생성 완료');
