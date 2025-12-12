# Troubleshooting Guide

## Page Not Loading Issues

### 1. Check Browser Console
- Open browser DevTools (F12)
- Check the Console tab for errors
- Check the Network tab for failed requests

### 2. Common Issues and Fixes

#### Issue: White screen / Blank page
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for JavaScript errors

#### Issue: Network errors
**Solution:**
- The app uses localStorage mock API when backend is unavailable
- Check console for "Backend API not available. Falling back to localStorage mock API."
- This is normal and the app should still work

#### Issue: Port already in use
**Solution:**
```bash
# Stop the current server (Ctrl+C in terminal)
# Or kill the process:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
# Then restart:
npm run dev
```

#### Issue: Module not found errors
**Solution:**
```bash
# Reinstall dependencies
npm install
# Restart dev server
npm run dev
```

### 3. Verify Server is Running
```bash
# Check if port 3000 is listening
netstat -ano | findstr :3000
```

### 4. Access the Application
- Local: http://localhost:3000
- Network: http://[YOUR_IP]:3000

### 5. Check for TypeScript Errors
```bash
npm run build
```

### 6. Reset Development Server
```bash
# Stop server (Ctrl+C)
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```


