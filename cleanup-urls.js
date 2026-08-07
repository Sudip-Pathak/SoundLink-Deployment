const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

// The ugly pattern that was injected by the previous script
const UGLY_PATTERN = `(import.meta.env.VITE_BACKEND_URL?.includes('localhost') && import.meta.env.PROD ? 'https://soundlink-by-sudip.onrender.com' : import.meta.env.VITE_BACKEND_URL || 'https://soundlink-by-sudip.onrender.com')`;

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            // Skip api.js itself
            if (fullPath.endsWith('utils\\api.js') || fullPath.endsWith('utils/api.js')) continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            
            if (!content.includes(UGLY_PATTERN)) continue;
            
            let modified = false;
            
            // Check if API_BASE_URL is already imported
            const hasApiImport = content.includes("from '../../utils/api'") || 
                                 content.includes('from "../../utils/api"') ||
                                 content.includes("from '../utils/api'") || 
                                 content.includes('from "../utils/api"') ||
                                 content.includes("from './utils/api'") || 
                                 content.includes('from "./utils/api"');
            
            // Determine relative path from file to utils/api.js
            const fileDir = path.dirname(fullPath);
            const apiPath = path.join(srcDir, 'utils', 'api.js');
            let relPath = path.relative(fileDir, apiPath).replace(/\\/g, '/');
            // Remove .js extension for import
            relPath = relPath.replace('.js', '');
            if (!relPath.startsWith('.')) relPath = './' + relPath;
            
            // Add import if not present
            if (!hasApiImport) {
                // Find the last import statement
                const importRegex = /^import\s+.+$/gm;
                let lastImportMatch = null;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    // Handle multi-line imports
                    let importEnd = match.index + match[0].length;
                    if (match[0].includes('{') && !match[0].includes('}')) {
                        // Multi-line import, find the closing brace
                        const closingBrace = content.indexOf('}', importEnd);
                        if (closingBrace !== -1) {
                            const semiColon = content.indexOf(';', closingBrace);
                            importEnd = semiColon !== -1 ? semiColon + 1 : closingBrace + 1;
                        }
                    }
                    lastImportMatch = { index: match.index, end: importEnd };
                }
                
                if (lastImportMatch) {
                    // Find end of the line after last import
                    const lineEnd = content.indexOf('\n', lastImportMatch.end);
                    if (lineEnd !== -1) {
                        const importStatement = `\nimport { API_BASE_URL } from '${relPath}';`;
                        content = content.slice(0, lineEnd) + importStatement + content.slice(lineEnd);
                        modified = true;
                    }
                }
            }
            
            // Now replace all occurrences of the ugly pattern
            // Pattern 1: const backendUrl = UGLY_PATTERN;  ->  const backendUrl = API_BASE_URL;
            // Pattern 2: const url = UGLY_PATTERN;  ->  const url = API_BASE_URL;
            // Pattern 3: Direct inline usage  ->  API_BASE_URL
            
            const escapedPattern = UGLY_PATTERN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const uglyRegex = new RegExp(escapedPattern.replace(/\s+/g, '\\s*'), 'g');
            
            // Simple string replacement since the pattern is exact
            while (content.includes(UGLY_PATTERN)) {
                content = content.replace(UGLY_PATTERN, 'API_BASE_URL');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed: ${path.relative(__dirname, fullPath)}`);
            }
        }
    }
}

traverse(srcDir);
console.log('Done cleaning up URLs');
