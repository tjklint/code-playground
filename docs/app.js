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

// === Chat State ===
let isChatOpen = false;

// === Toggle Chat Function ===
function toggleChat() {
  const fab = document.getElementById('chat-fab');
  
  if (isChatOpen) {
    // Close the chat
    if (window.botpress) {
      window.botpress.close();
    }
    fab?.classList.remove('is-open');
    isChatOpen = false;
  } else {
    // Open the chat
    if (window.botpress) {
      window.botpress.open();
    }
    fab?.classList.add('is-open');
    isChatOpen = true;
  }
}

// === Custom FAB Click Handler ===
const chatFab = document.getElementById('chat-fab');
if (chatFab) {
  chatFab.addEventListener('click', toggleChat);
}

// === CTA Button - Open Webchat ===
const ctaButton = document.getElementById('open-chat');
if (ctaButton) {
  ctaButton.addEventListener('click', () => {
    const fab = document.getElementById('chat-fab');
    if (!isChatOpen) {
      if (window.botpress) {
        window.botpress.open();
      }
      fab?.classList.add('is-open');
      isChatOpen = true;
    }
  });
}

// === Listen for Webchat Close Events ===
// Sync our FAB state when user closes chat via the webchat's own close button
function setupWebchatListener() {
  if (window.botpress) {
    window.botpress.on('webchat:closed', () => {
      const fab = document.getElementById('chat-fab');
      fab?.classList.remove('is-open');
      isChatOpen = false;
    });
    
    window.botpress.on('webchat:opened', () => {
      const fab = document.getElementById('chat-fab');
      fab?.classList.add('is-open');
      isChatOpen = true;
    });
  } else {
    // Retry after a short delay if botpress isn't ready yet
    setTimeout(setupWebchatListener, 500);
  }
}

// Initialize listener after a short delay to ensure webchat is loaded
setTimeout(setupWebchatListener, 1000);

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
    
    if (!isChatOpen) {
      const fab = document.getElementById('chat-fab');
      if (window.botpress) {
        window.botpress.open();
      }
      fab?.classList.add('is-open');
      isChatOpen = true;
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
  // Press '/' to toggle chat
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    toggleChat();
  }
  
  // Press 'Escape' to close chat
  if (e.key === 'Escape' && isChatOpen) {
    toggleChat();
  }
});

// === Console Easter Egg ===
console.log('%c⚡ Code Playground', 'font-size: 24px; font-weight: bold; color: #00e5ff;');
console.log('%cPress "/" to open the chat and start coding!', 'font-size: 14px; color: #8888a0;');

