#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix files with TypeScript issues
const fixes = [
  // Remove unused imports
  {
    file: 'src/components/AddItemModal.tsx',
    search: 'import React, { useState } from \'react\';',
    replace: 'import React from \'react\';'
  },
  {
    file: 'src/contexts/AuthContext.tsx',
    search: 'import { User, LoginResponse } from \'../types\';',
    replace: 'import { User } from \'../types\';'
  },
  {
    file: 'src/pages/Items.tsx',
    search: 'import React, { useState, useEffect } from \'react\';',
    replace: 'import React, { useState } from \'react\';'
  },
  {
    file: 'src/pages/OrderDetail.tsx',
    search: 'import { useParams } from \'react-router-dom\';\nimport { useQuery } from \'react-query\';\nimport orderAPI from \'../services/api\';',
    replace: 'import { useParams } from \'react-router-dom\';'
  },
  {
    file: 'src/pages/OrderTracking.tsx',
    search: 'import {\n  MapPinIcon,\n  ClockIcon,\n  CheckCircleIcon,\n  TruckIcon\n} from \'@heroicons/react/24/outline\';',
    replace: 'import {\n  MapPinIcon,\n  CheckCircleIcon,\n  TruckIcon\n} from \'@heroicons/react/24/outline\';'
  },
  {
    file: 'src/pages/Orders.tsx',
    search: 'import LoadingSpinner from \'../components/LoadingSpinner\';',
    replace: ''
  },
  {
    file: 'src/pages/VendorDashboard.tsx',
    search: 'import React, { useState, useEffect } from \'react\';',
    replace: 'import React, { useEffect } from \'react\';'
  },
  {
    file: 'src/pages/VendorItems.tsx',
    search: 'import {\n  PlusIcon,\n  PencilIcon,\n  TrashIcon,\n  EyeIcon,\n  EyeSlashIcon\n} from \'@heroicons/react/24/outline\';',
    replace: 'import {\n  PlusIcon,\n  PencilIcon,\n  TrashIcon\n} from \'@heroicons/react/24/outline\';'
  },
  {
    file: 'src/pages/VendorProfile.tsx',
    search: 'const { user, updateProfile } = useAuth();',
    replace: 'const { user } = useAuth();'
  },
  {
    file: 'src/services/api.ts',
    search: 'export interface PaginatedResponse<T> {',
    replace: '// export interface PaginatedResponse<T> {'
  }
];

// Apply fixes
fixes.forEach(fix => {
  const filePath = path.join(__dirname, 'frontend', fix.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${fix.file}`);
    } else {
      console.log(`⚠️  Pattern not found in ${fix.file}`);
    }
  } else {
    console.log(`❌ File not found: ${fix.file}`);
  }
});

console.log('🎉 Frontend TypeScript fixes applied!');
