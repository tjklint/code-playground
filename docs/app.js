/**
 * Code Playground - App JavaScript
 * Wrapped in DOMContentLoaded to ensure DOM is ready
 */

document.addEventListener('DOMContentLoaded', function() {
  // === State ===
  let isChatOpen = false;
  
  // === DOM Elements ===
  const outputElement = document.getElementById('typing-output');
  const miniCodeElement = document.getElementById('mini-code-text');
  const miniOutputElement = document.getElementById('mini-output');
  const miniTerminal = document.getElementById('chat-fab');
  const ctaButton = document.getElementById('open-chat');
  const statusTextElement = document.querySelector('.status-text');

  // === Hero Typing Animation ===
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
    if (!outputElement) return;
    
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

  // Start hero typing animation
  if (outputElement) {
    setTimeout(typeOutput, 1000);
  }

  // === Mini Terminal Animation ===
  const terminalCommands = [
    { code: 'fib(20)', output: '→ 6765', duration: 800 },
    { code: 'sum(1,100)', output: '→ 5050', duration: 600 },
    { code: 'isPrime(997)', output: '→ true', duration: 500 },
    { code: 'factorial(10)', output: '→ 3628800', duration: 700 },
    { code: 'sqrt(144)', output: '→ 12', duration: 400 },
    { code: 'random()', output: '→ 0.4281', duration: 300 },
  ];

  let terminalIndex = 0;
  let miniCharIndex = 0;
  let miniPhase = 'typing';

  function updateStatusText(text) {
    const el = document.querySelector('.status-text');
    if (el) el.textContent = text;
  }

  function animateMiniTerminal() {
    if (!miniCodeElement || !miniOutputElement || !miniTerminal) return;

    // Don't animate if chat is open
    if (isChatOpen) {
      miniCodeElement.textContent = 'chat open...';
      miniOutputElement.textContent = '';
      miniOutputElement.classList.remove('show');
      setTimeout(animateMiniTerminal, 1000);
      return;
    }

    const currentCmd = terminalCommands[terminalIndex];
    
    switch (miniPhase) {
      case 'typing':
        if (miniCharIndex < currentCmd.code.length) {
          miniCodeElement.textContent = currentCmd.code.substring(0, miniCharIndex + 1);
          miniCharIndex++;
          setTimeout(animateMiniTerminal, 70 + Math.random() * 50);
        } else {
          miniPhase = 'running';
          miniTerminal.classList.add('is-running');
          updateStatusText('running');
          setTimeout(animateMiniTerminal, currentCmd.duration);
        }
        break;
        
      case 'running':
        miniPhase = 'output';
        miniTerminal.classList.remove('is-running');
        updateStatusText('done');
        miniOutputElement.textContent = currentCmd.output;
        miniOutputElement.classList.add('show');
        setTimeout(animateMiniTerminal, 2000);
        break;
        
      case 'output':
        miniPhase = 'clearing';
        miniOutputElement.classList.remove('show');
        updateStatusText('ready');
        setTimeout(animateMiniTerminal, 300);
        break;
        
      case 'clearing':
        miniPhase = 'typing';
        miniCharIndex = 0;
        miniCodeElement.textContent = '';
        miniOutputElement.textContent = '';
        terminalIndex = (terminalIndex + 1) % terminalCommands.length;
        setTimeout(animateMiniTerminal, 500);
        break;
    }
  }

  // Start mini terminal animation
  if (miniTerminal && miniCodeElement) {
    setTimeout(animateMiniTerminal, 1500);
  }

  // === Scroll to Chat Function ===
  function scrollToChat() {
    const chatSection = document.getElementById('chat');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (miniTerminal) miniTerminal.classList.add('is-open');
      updateStatusText('connected');
      isChatOpen = true;
      
      // Also try to open the floating widget as fallback
      if (window.botpress && typeof window.botpress.open === 'function') {
        window.botpress.open();
      }
    }
  }

  // === Toggle Chat Function (for compatibility) ===
  function toggleChat() {
    scrollToChat();
  }

  // Make functions available globally
  window.toggleChat = toggleChat;
  window.scrollToChat = scrollToChat;

  // === Mini Terminal Click Handler ===
  if (miniTerminal) {
    miniTerminal.addEventListener('click', toggleChat);
    
    miniTerminal.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleChat();
      }
    });
  }

  // === CTA Button ===
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      scrollToChat();
    });
  }

  // === Track when chat section is visible ===
  const chatSection = document.getElementById('chat');
  if (chatSection) {
    const chatObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (miniTerminal) miniTerminal.classList.add('is-open');
          updateStatusText('connected');
          isChatOpen = true;
        } else {
          if (miniTerminal) miniTerminal.classList.remove('is-open');
          updateStatusText('ready');
          isChatOpen = false;
        }
      });
    }, { threshold: 0.3 });
    
    chatObserver.observe(chatSection);
  }

  // === Example Chips ===
  document.querySelectorAll('.example-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      const prompt = chip.dataset.prompt;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(prompt).then(function() {
          const originalText = chip.textContent;
          chip.textContent = 'Copied!';
          chip.style.borderColor = 'var(--accent-green)';
          chip.style.color = 'var(--accent-green)';
          
          setTimeout(function() {
            chip.textContent = originalText;
            chip.style.borderColor = '';
            chip.style.color = '';
          }, 1000);
        });
      }
      
      // Scroll to chat section
      scrollToChat();
    });
  });

  // === Smooth Scroll ===
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // === Feature Card Animations ===
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card').forEach(function(card, index) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease ' + (index * 0.1) + 's, transform 0.5s ease ' + (index * 0.1) + 's';
    observer.observe(card);
  });

  // === Keyboard Shortcuts ===
  document.addEventListener('keydown', function(e) {
    // Press '/' to scroll to chat
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      scrollToChat();
    }
    
    // Press 'Escape' to scroll back to top
    if (e.key === 'Escape' && isChatOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // === Console Easter Egg ===
  console.log('%c⚡ Code Playground', 'font-size: 24px; font-weight: bold; color: #00e5ff;');
  console.log('%cPress "/" to open the chat and start coding!', 'font-size: 14px; color: #8888a0;');
});
