# Auto-Push Setup for module-craft-edit

Bu layihə üçün avtomatik push funksiyası quruldu. Dəyişikliklər avtomatik olaraq GitHub repository-yə göndəriləcək.

## 🚀 İstifadə etmək üçün

### Seçim 1: Node.js skripti (tövsiyə olunur)
```bash
npm run auto-push
```

### Seçim 2: Bash skripti
```bash
npm run auto-push:bash
```

### Seçim 3: Birbaşa işə salmaq
```bash
# Node.js versiyası
node auto-push.js

# Bash versiyası
./auto-push.sh
```

## ⚙️ Konfiqurasiya

### Node.js skripti (auto-push.js)
- **WATCH_INTERVAL**: 3 saniyə (dəyişiklikləri yoxlayır)
- **COMMIT_COOLDOWN**: 10 saniyə (commit-lər arası minimum vaxt)
- **IGNORE_PATTERNS**: `.git`, `node_modules`, `dist`, `build`, `.DS_Store`, `*.log` faylları nəzərə alınmır

### Bash skripti (auto-push.sh)
- **Check interval**: 5 saniyə
- Bütün dəyişikliklər avtomatik commit və push edilir

## 📝 Commit mesajları

Avtomatik commit-lər aşağıdakı formatda yaradılır:
```
Auto-commit: Changes made at [tarix və vaxt]
```

## 🛑 Skripti dayandırmaq

Skripti dayandırmaq üçün `Ctrl+C` düyməsini basın.

## ⚠️ Diqqət

1. **Git credentials**: Git-də authentication qurulmalıdır
2. **Repository access**: Repository-yə push etmək üçün icazəniz olmalıdır
3. **Network connection**: İnternet bağlantısı lazımdır
4. **Conflict resolution**: Conflict-lər avtomatik həll edilmir, manual müdaxilə tələb olunur

## 🔧 Troubleshooting

### Git authentication problemi
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Permission problemi
```bash
chmod +x auto-push.js
chmod +x auto-push.sh
```

### Repository problemi
```bash
git remote -v
git remote set-url origin https://github.com/hemidirasim/module-craft-edit.git
```

## 📊 Status

Skript işləyərkən aşağıdakı status mesajlarını görəcəksiniz:
- 🚀 Skript başladı
- 🔍 Dəyişikliklər yoxlanılır
- 📝 Dəyişikliklər tapıldı, commit edilir
- ✅ Uğurla push edildi
- ⏳ Çox tez commit, gözləyir
- ❌ Xəta baş verdi

## 🎯 Məqsəd

Bu skript sayəsində:
- Dəyişikliklər avtomatik olaraq GitHub-a göndərilir
- Manual commit/push etməyə ehtiyac yoxdur
- Real-time collaboration təmin edilir
- Kod dəyişiklikləri izlənir
