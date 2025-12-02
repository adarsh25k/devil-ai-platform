# 🧪 ROUTING FIX - TESTING GUIDE

This guide will help you verify that the routing bug is permanently fixed.

---

## ✅ Pre-Test Checklist

Before testing, ensure you have:

1. ✅ Added OpenRouter API keys in `/admin` → 🔑 API Keys
2. ✅ Tested keys using "🔍 Test" button (should show ✅ "API key is valid and working")
3. ✅ Server is running (`bun run dev`)
4. ✅ Browser console is open (F12)
5. ✅ Server logs visible in terminal

---

## 🔥 Test 1: Verify Model IDs in Admin Panel

1. Go to `/admin` → 🔑 API Keys → Click "+ Add Key"
2. Verify dropdown shows these 8 options:
   - 🧠 Main Brain API Key
   - 💻 Coding API Key
   - 🐛 Debugging / Fix Bugs API Key
   - ⚡ Fast Daily Use API Key
   - 🎨 UI/UX & Mockup API Key
   - 🖼️ Image Generation API Key
   - 🎮 Game Dev API Key
   - 📝 Canvas / PPT / Notes API Key

3. Add at least **Coding API Key** and **Main Brain API Key**
4. Click "🔍 Test" on each key
5. Expected: ✅ "API key is valid and working"

---

## 🔥 Test 2: Send Test Message (Python If/Else)

1. Go to `/chat`
2. Send this message:
   ```
   write python if else program
   ```

3. **Check Server Terminal Logs:**

Expected output:
```
🔥🔥🔥 [CHAT API] ===== NEW CHAT REQUEST =====
📨 [CHAT API] Message: "write python if else program"

🤖 [CHAT API] Auto-detecting model...

🔥 [ROUTING] Auto-routing for message: "write python if else program"
💻 Routing to CODING: detected pattern "python"

🔍 [ROUTING] Fetching API key for: coding_key
✅ [ROUTING] Selected model: qwen/qwen3-coder-480b-a35b
📏 [ROUTING] Model ID length: 30 chars
📋 [ROUTING] Model ID (raw): "qwen/qwen3-coder-480b-a35b"

✅ [CHAT API] ===== ROUTING COMPLETE =====
📋 [CHAT API] Category: coding
🔑 [CHAT API] Key Type: coding_key
🤖 [CHAT API] Model ID: "qwen/qwen3-coder-480b-a35b"
📏 [CHAT API] Model ID Length: 30 chars

🚀 [CHAT API] ===== CALLING OPENROUTER API =====
🌐 [CHAT API] Endpoint: https://openrouter.ai/api/v1/chat/completions
🤖 [CHAT API] Model Parameter: "qwen/qwen3-coder-480b-a35b"
📦 [CHAT API] Request Body Model Field: "qwen/qwen3-coder-480b-a35b"

📡 [CHAT API] ===== OPENROUTER RESPONSE =====
📊 [CHAT API] Status: 200 OK
✅ [CHAT API] Response generated successfully
```

4. **Check Chat UI:**
   - ✅ Should see Python code with if/else example
   - ❌ Should NOT see "No endpoints found"
   - ❌ Should NOT see "Provider returned error"

---

## 🔥 Test 3: Test All 8 Categories

Send these messages to test each category:

| Message | Expected Category | Expected Model |
|---------|-------------------|----------------|
| "write python if else program" | 💻 Coding | `qwen/qwen3-coder-480b-a35b` |
| "fix this error: undefined variable" | 🐛 Debugging | `tngtech/deepseek-r1t2-chimera` |
| "what is React?" | ⚡ Fast | `xai/grok-4.1-fast` |
| "design mobile app screen" | 🎨 UI/UX Mockup | `meta-llama/llama-3.1-70b-instruct` |
| "create logo for startup" | 🖼️ Image Generation | `veniceai/uncensored` |
| "design game level mechanics" | 🎮 Game Dev | `moonshotai/kimi-k2` |
| "make ppt about AI" | 📝 Canvas/Notes | `meta-llama/llama-3.2-3b-instruct` |
| "explain software architecture" | 🧠 Main Brain | `nousresearch/nous-hermes-3-llama-3-405b` |

**For each message, verify in server logs:**
- ✅ Correct category detected
- ✅ Correct model ID selected
- ✅ Model ID matches EXACTLY (no :free, no modifications)
- ✅ Status: 200 OK
- ✅ Response generated successfully

---

## 🔥 Test 4: Debug Mode (Optional)

Test routing without calling OpenRouter:

1. Open browser console (F12)
2. Run this in console:
```javascript
fetch('/api/chat/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'write python code',
    userId: 'test123',
    chatId: 'chat123',
    debug: true
  })
})
.then(r => r.json())
.then(data => console.log('DEBUG RESULT:', data))
```

3. Expected output:
```json
{
  "debug": true,
  "chosenModel": "qwen/qwen3-coder-480b-a35b",
  "chosenKey": "coding_key",
  "routerReason": "Auto-detected: coding",
  "category": "coding",
  "message": "[DEBUG MODE] - API call skipped"
}
```

4. Verify `chosenModel` matches EXACTLY (no :free suffix)

---

## ❌ Common Issues & Solutions

### Issue 1: "API key missing for model"
**Solution:** Add the API key in `/admin` → 🔑 API Keys

### Issue 2: "API key not found in database"
**Solution:** 
1. Delete the key in admin panel
2. Re-add it with correct name
3. Test again

### Issue 3: Still seeing ":free" in logs
**Solution:**
1. Clear browser cache
2. Restart dev server: `bun run dev`
3. Check `src/lib/modelRouter.ts` - should NOT have any `:free` suffixes

### Issue 4: "No endpoints found"
**Check:**
1. Model ID in logs matches EXACTLY what's in `KEY_MODEL_MAP`
2. API key is valid (test in admin panel)
3. No typos in model ID

---

## ✅ Success Criteria

The fix is working correctly when:

1. ✅ All 8 API keys test successfully in admin panel
2. ✅ Chat messages route to correct categories
3. ✅ Server logs show EXACT model IDs (no :free)
4. ✅ OpenRouter returns 200 OK status
5. ✅ AI responses appear in chat UI
6. ✅ No "No endpoints found" errors
7. ✅ No "Provider returned error" messages

---

## 📊 What to Look For in Logs

### ✅ GOOD - Correct Routing:
```
✅ [ROUTING] Selected model: qwen/qwen3-coder-480b-a35b
🤖 [CHAT API] Model Parameter: "qwen/qwen3-coder-480b-a35b"
📡 [CHAT API] Status: 200 OK
```

### ❌ BAD - Still Has Issues:
```
❌ Model with :free suffix: qwen/qwen3-coder-480b-a35b:free
❌ Status: 400 Bad Request
❌ Error: No endpoints found
```

---

## 🔥 Final Verification

After all tests pass:

1. Send: **"write python if else program"**
2. Verify server logs show: `qwen/qwen3-coder-480b-a35b`
3. Verify chat UI shows Python code response
4. Verify no errors in console or server logs

**If all pass: ROUTING BUG IS PERMANENTLY FIXED! 🎉**

---

## 📞 Need Help?

If issues persist:
1. Check `ROUTING_BUG_PERMANENT_FIX.md` for full details
2. Verify all 8 model IDs in `src/lib/modelRouter.ts`
3. Check server logs for exact error messages
4. Ensure API keys are valid in OpenRouter dashboard
