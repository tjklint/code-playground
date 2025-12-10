// === Typing Animation ===
const outputElement = document.getElementById('typing-output');
const outputs = [
  '6765',
  'Running code...',
  '✓ fibonacci(20) = 6765',
  'Done in 0.02ms'
];

let outputIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isPaused = false;

function typeOutput() {
  const currentOutput = outputs[outputIndex];
  
  if (isPaused) {
    setTimeout(typeOutput, 1500);
    isPaused = false;
    isDeleting = true;
    return;
  }
  
  if (isDeleting) {
    outputElement.textContent = currentOutput.substring(0, charIndex - 1);
    charIndex--;
    
    if (charIndex === 0) {
      isDeleting = false;
      outputIndex = (outputIndex + 1) % outputs.length;
    }
    setTimeout(typeOutput, 30);
  } else {
    outputElement.textContent = currentOutput.substring(0, charIndex + 1);
    charIndex++;
    
    if (charIndex === currentOutput.length) {
      isPaused = true;
    }
    setTimeout(typeOutput, 60);
  }
}

// Start typing animation after a short delay
setTimeout(typeOutput, 1000);

// === CTA Button - Open Webchat ===
const ctaButton = document.getElementById('open-chat');
if (ctaButton) {
  ctaButton.addEventListener('click', () => {
    // Try to open the Botpress webchat
    if (window.botpress) {
      window.botpress.open();
    } else if (window.botpressWebChat) {
      window.botpressWebChat.sendEvent({ type: 'show' });
    }
  });
}

// === Example Chips - Copy to Clipboard & Open Chat ===
const exampleChips = document.querySelectorAll('.example-chip');
exampleChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.dataset.prompt;
    
    // Copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      // Visual feedback
      const originalText = chip.textContent;
      chip.textContent = 'Copied!';
      chip.style.borderColor = 'var(--accent-green)';
      chip.style.color = 'var(--accent-green)';
      
      setTimeout(() => {
        chip.textContent = originalText;
        chip.style.borderColor = '';
        chip.style.color = '';
      }, 1000);
    });
    
    // Open webchat
    if (window.botpress) {
      window.botpress.open();
    }
  });
});

// === Smooth Scroll for Anchor Links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === Intersection Observer for Animations ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Animate feature cards on scroll
document.querySelectorAll('.feature-card').forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
  observer.observe(card);
});

// === Keyboard Shortcut ===
document.addEventListener('keydown', (e) => {
  // Press '/' to open chat
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    if (window.botpress) {
      window.botpress.open();
    }
  }
});

// === Console Easter Egg ===
console.log('%c⚡ Code Playground', 'font-size: 24px; font-weight: bold; color: #00e5ff;');
console.log('%cPress "/" to open the chat and start coding!', 'font-size: 14px; color: #8888a0;');

