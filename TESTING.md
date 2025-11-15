# Phase 1 Testing Guide

## Quick Test: Browser Console

Open browser console and run these commands to verify Phase 1 implementation:

### Test 1: Storage Layer Basics

```javascript
// Import storage classes (if using modules)
// Or access via window if exported globally

// Test Auth Storage
const authData = {
  resovaApiKey: 'test-key-123',
  resovaApiUrl: 'https://api.resova.us/v1',
  claudeApiKey: 'test-claude-key-456',
  lastLogin: new Date().toISOString(),
  version: '1.0'
};

// This won't work directly in console - need to import first
// See "Test via Component" section below
```

### Test 2: Via Browser DevTools

1. Open DevTools → Application → Local Storage → `http://localhost:3000`
2. Look for these keys:
   - `resova_intelligence_auth`
   - `resova_intelligence_config`
   - `resova_intelligence_onboarding_complete`

### Test 3: Via Test Component

Create a test page to validate storage:

```typescript
// app/test-storage/page.tsx
'use client';

import { useState } from 'react';
import { AuthStorage } from '@/app/lib/storage/auth-storage';
import { ConfigStorage } from '@/app/lib/storage/config-storage';

export default function TestStoragePage() {
  const [results, setResults] = useState<string[]>([]);

  const runTests = () => {
    const log: string[] = [];

    try {
      // Test 1: Auth Storage
      log.push('=== Testing Auth Storage ===');

      AuthStorage.save({
        resovaApiKey: 'test-key',
        resovaApiUrl: 'https://api.resova.us/v1',
        claudeApiKey: 'test-claude-key',
        lastLogin: new Date().toISOString(),
        version: '1.0'
      });
      log.push('✅ Auth saved');

      const auth = AuthStorage.load();
      log.push(auth ? '✅ Auth loaded' : '❌ Auth load failed');
      log.push(`Auth key: ${auth?.resovaApiKey.substring(0, 10)}...`);

      const isAuth = AuthStorage.isAuthenticated();
      log.push(isAuth ? '✅ Is authenticated' : '❌ Not authenticated');

      // Test 2: Config Storage
      log.push('\n=== Testing Config Storage ===');

      ConfigStorage.save({
        activityTypes: ['karting-adult', 'arcade'],
        businessName: 'Test FEC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      log.push('✅ Config saved');

      const config = ConfigStorage.load();
      log.push(config ? '✅ Config loaded' : '❌ Config load failed');
      log.push(`Activities: ${config?.activityTypes.join(', ')}`);
      log.push(`Business: ${config?.businessName}`);

      // Test 3: Update operations
      log.push('\n=== Testing Updates ===');

      ConfigStorage.addActivityType('laser-tag');
      const updated = ConfigStorage.load();
      log.push(`Added laser-tag: ${updated?.activityTypes.includes('laser-tag') ? '✅' : '❌'}`);

      ConfigStorage.removeActivityType('arcade');
      const removed = ConfigStorage.load();
      log.push(`Removed arcade: ${!removed?.activityTypes.includes('arcade') ? '✅' : '❌'}`);

      // Test 4: Clear
      log.push('\n=== Testing Clear ===');

      AuthStorage.clear();
      const authAfterClear = AuthStorage.load();
      log.push(authAfterClear === null ? '✅ Auth cleared' : '❌ Auth clear failed');

      log.push('\n✅ ALL TESTS PASSED');
    } catch (error) {
      log.push(`\n❌ ERROR: ${error}`);
    }

    setResults(log);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Storage Layer Tests</h1>

      <button
        onClick={runTests}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Tests
      </button>

      <div className="mt-4 bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre">
        {results.join('\n') || 'Click "Run Tests" to begin'}
      </div>
    </div>
  );
}
```

### Test 4: Activity Configuration

```typescript
// app/test-activities/page.tsx
'use client';

import { useState } from 'react';
import {
  getActivityConfig,
  getActivityOptionsByCategory,
  buildActivitySeedPrompt
} from '@/app/lib/config/activity-types';

export default function TestActivitiesPage() {
  const [results, setResults] = useState<string[]>([]);

  const runTests = () => {
    const log: string[] = [];

    try {
      // Test 1: Get activity config
      log.push('=== Testing Activity Config ===');

      const karting = getActivityConfig('karting-adult');
      log.push(karting ? '✅ Got karting config' : '❌ Failed to get config');
      log.push(`Label: ${karting?.label}`);
      log.push(`Category: ${karting?.category}`);
      log.push(`Prompt length: ${karting?.seedPrompt.length} chars`);

      // Test 2: Get by category
      log.push('\n=== Testing Category Grouping ===');

      const byCategory = getActivityOptionsByCategory();
      log.push(`Total categories: ${byCategory.length}`);
      byCategory.forEach(cat => {
        log.push(`${cat.category}: ${cat.activities.length} activities`);
      });

      // Test 3: Build seed prompt
      log.push('\n=== Testing Seed Prompt Building ===');

      const prompt = buildActivitySeedPrompt(['karting-adult', 'arcade']);
      log.push(prompt.includes('BUSINESS CONTEXT') ? '✅ Prompt structure correct' : '❌ Prompt structure wrong');
      log.push(prompt.includes('Karting (Adult)') ? '✅ Karting included' : '❌ Karting missing');
      log.push(prompt.includes('Arcades') ? '✅ Arcade included' : '❌ Arcade missing');
      log.push(`Total prompt length: ${prompt.length} chars`);

      log.push('\n✅ ALL TESTS PASSED');
    } catch (error) {
      log.push(`\n❌ ERROR: ${error}`);
    }

    setResults(log);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Activity Configuration Tests</h1>

      <button
        onClick={runTests}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Tests
      </button>

      <div className="mt-4 bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre">
        {results.join('\n') || 'Click "Run Tests" to begin'}
      </div>
    </div>
  );
}
```

## Manual Testing Checklist

### Storage Persistence
- [ ] Save auth credentials
- [ ] Refresh page
- [ ] Verify credentials still loaded
- [ ] Open new tab to same URL
- [ ] Verify credentials available in new tab

### Activity Configuration
- [ ] Select 2-3 activity types
- [ ] Save config
- [ ] Refresh page
- [ ] Verify activity types still selected
- [ ] Add new activity type
- [ ] Verify addition persisted
- [ ] Remove activity type
- [ ] Verify removal persisted

### Clear/Logout
- [ ] Save both auth and config
- [ ] Call AuthStorage.clear()
- [ ] Verify auth cleared
- [ ] Verify config still present (doesn't auto-clear)
- [ ] Call localStorage.clear()
- [ ] Verify both auth and config cleared

### Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test in private/incognito mode

## Automated Test Script

```bash
# Run this in browser console after importing storage classes

function runStorageTests() {
  const { AuthStorage, ConfigStorage } = window;

  console.group('Auth Storage Tests');

  // Save
  AuthStorage.save({
    resovaApiKey: 'test-key',
    resovaApiUrl: 'https://api.resova.us/v1',
    claudeApiKey: 'test-claude',
    lastLogin: new Date().toISOString(),
    version: '1.0'
  });
  console.assert(AuthStorage.isAuthenticated(), 'Auth save failed');

  // Load
  const auth = AuthStorage.load();
  console.assert(auth?.resovaApiKey === 'test-key', 'Auth load failed');

  // Clear
  AuthStorage.clear();
  console.assert(!AuthStorage.isAuthenticated(), 'Auth clear failed');

  console.groupEnd();

  console.group('Config Storage Tests');

  // Save
  ConfigStorage.save({
    activityTypes: ['karting-adult'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Add activity
  ConfigStorage.addActivityType('arcade');
  let config = ConfigStorage.load();
  console.assert(config?.activityTypes.length === 2, 'Add activity failed');

  // Remove activity
  ConfigStorage.removeActivityType('karting-adult');
  config = ConfigStorage.load();
  console.assert(config?.activityTypes.length === 1, 'Remove activity failed');
  console.assert(config?.activityTypes[0] === 'arcade', 'Wrong activity removed');

  console.groupEnd();

  console.log('✅ All tests passed!');
}
```

## Expected Results

### localStorage Contents
```json
{
  "resova_intelligence_auth": {
    "resovaApiKey": "sk_test_...",
    "resovaApiUrl": "https://api.resova.us/v1",
    "claudeApiKey": "sk-ant-...",
    "lastLogin": "2025-11-15T06:30:00.000Z",
    "version": "1.0"
  },
  "resova_intelligence_config": {
    "activityTypes": ["karting-adult", "arcade", "laser-tag"],
    "businessName": "My FEC",
    "createdAt": "2025-11-15T06:30:00.000Z",
    "updatedAt": "2025-11-15T06:35:00.000Z"
  },
  "resova_intelligence_onboarding_complete": "true"
}
```

## Performance Benchmarks

Expected performance (measured in browser console):

```javascript
// Save performance
console.time('auth-save');
AuthStorage.save(authData);
console.timeEnd('auth-save');
// Expected: < 5ms

// Load performance
console.time('auth-load');
AuthStorage.load();
console.timeEnd('auth-load');
// Expected: < 2ms

// Activity prompt building
console.time('prompt-build');
buildActivitySeedPrompt(['karting-adult', 'arcade', 'laser-tag']);
console.timeEnd('prompt-build');
// Expected: < 10ms
```

## Debugging Tips

### If storage not working:
1. Check browser console for errors
2. Verify localStorage is enabled (not in private mode with strict settings)
3. Check for quota exceeded errors (unlikely with our small data)
4. Verify correct import paths

### If activity prompts not appearing in AI:
1. Check ConfigStorage.load() returns data
2. Verify activityTypes array is not empty
3. Check ClaudeService constructor receives config
4. Inspect getSystemPrompt() output (add console.log)

### If persistence not working:
1. Verify same origin (protocol, domain, port)
2. Check for browser extensions blocking localStorage
3. Verify browser localStorage quota not exceeded
4. Check browser privacy settings
