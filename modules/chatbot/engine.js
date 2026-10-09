const fs = require('fs');
const path = require('path');

let faqs = [];
try {
  faqs = JSON.parse(fs.readFileSync(path.join(__dirname, 'faq.json'), 'utf8'));
} catch (e) {
  console.error('Failed to load faq.json', e);
}

function processMessage(message) {
  const msgLower = message.toLowerCase();
  
  // Rule-based keyword matching
  let bestMatch = null;
  let maxScore = 0;

  for (const faq of faqs) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (msgLower.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch.answer;
  }

  // Fallback response
  return "I'm a simple bot and I'm not sure about that. Please leave your details or use our <a href='/contact' style='color: white; text-decoration: underline;'>contact form</a> to get in touch with Ajay Singla.";
}

module.exports = {
  processMessage
};
