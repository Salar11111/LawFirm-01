#!/bin/bash
cd /home/z/my-project
pkill -f "next" 2>/dev/null
sleep 3
NODE_OPTIONS="--max-old-space-size=2048" nohup setsid bash -c 'exec ./node_modules/.bin/next dev -p 3000' > /dev/null 2>&1 & disown
echo "Server starting..."
sleep 20
echo "=== HOME CHECK ==="
curl -s -o /dev/null -w "home:%{http_code}\n" --max-time 20 http://localhost:3000

echo "=== OPEN HOME ==="
agent-browser open http://localhost:3000 2>&1 | tail -1
sleep 5
agent-browser snapshot -c 2>&1 | grep -i "justice\|practice\|shaheen\|hero" | head -5

echo "=== CLICK SIGN IN ==="
agent-browser find text "Sign In" click 2>&1 | tail -1
sleep 2

echo "=== FILL CLIENT CREDS ==="
# Get refs for email, password, and client demo button
agent-browser snapshot -i 2>&1 | grep -iE "textbox|client.*button|button.*client" | head -8
