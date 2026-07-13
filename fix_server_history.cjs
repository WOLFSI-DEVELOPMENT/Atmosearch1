const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `      if (personalization?.memoryEnabled && history && Array.isArray(history) && history.length > 0) {
         userContext = \`\\n\\nPast User Queries (Memory):\\n\${history.map((h: any) => \`- User asked: \${h.query}\`).join('\\n')}\`;
      }`;

const replacement = `      if (personalization?.memoryEnabled && history && Array.isArray(history) && history.length > 0) {
         userContext = \`\\n\\nConversation History:\\n\${history.map((h: any) => \`- User asked: \${h.query}\\n- Assistant answered: \${h.response || ''}\`).join('\\n')}\`;
      }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('server.ts', content);
    console.log("Server history fixed");
} else {
    console.error("Target not found");
}
