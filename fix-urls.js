const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Replace pattern: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
            // with a variable that handles Vercel's incorrect localhost setting
            const replacement = `(import.meta.env.VITE_BACKEND_URL?.includes('localhost') && import.meta.env.PROD ? 'https://soundlink-by-sudip.onrender.com' : import.meta.env.VITE_BACKEND_URL || 'https://soundlink-by-sudip.onrender.com')`;
            
            if (content.includes("import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'")) {
                content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL\s*\|\|\s*'http:\/\/localhost:4000'/g, replacement);
                modified = true;
            }
            
            if (content.includes('import.meta.env.VITE_BACKEND_URL') && !content.includes(replacement)) {
                // For cases like `const url = import.meta.env.VITE_BACKEND_URL;`
                content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL(?!\?)/g, replacement);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

traverse(srcDir);
console.log('Done fixing URLs');
