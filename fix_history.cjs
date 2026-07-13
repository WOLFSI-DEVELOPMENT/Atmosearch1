const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      // Send the conversation history from the feed!
      setFeed(currentFeed => {
          history = currentFeed
              .filter(f => f.id !== feedId && f.response)
              .map(f => ({ query: f.query }));
          return currentFeed;
      });`;

const replacement = `      // Send the conversation history from the feed!
      history = feed
          .filter(f => f.id !== feedId && f.response)
          .map(f => ({ query: f.query, response: f.response?.result?.summary || '' }));`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed history logic");
} else {
    console.error("Target not found");
}
