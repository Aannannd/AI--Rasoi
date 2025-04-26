
    // Mobile Menu Toggle
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Search Functionality - Modified for AI Rasoi
    document.querySelector('.search-bar button').addEventListener('click', async function() {
        const ingredients = document.querySelector('.search-bar input').value;
        
        if (!ingredients.trim()) {
            alert("Please enter some ingredients!");
            return;
        }

        // Show loading state
        const searchBtn = this;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        searchBtn.disabled = true;

        try {
            // Call your backend API
            const response = await fetch('/generate_recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients: ingredients })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display the recipe in the hero section
            const hero = document.querySelector('.hero');
            hero.innerHTML = `
                <div class="hero-content">
                    <h1>Your AI-Generated Recipe</h1>
                    <div class="recipe-output">
                        ${data.recipe.replace(/\n/g, '<br>')}
                    </div>
                    <button class="btn" onclick="location.reload()">
                        <i class="fas fa-undo"></i> Search Again
                    </button>
                </div>
            `;
            
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            // Reset button
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
            searchBtn.disabled = false;
        }
    });

    // Newsletter Form Submission
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if (email.trim() !== '' && email.includes('@')) {
            alert(`Thank you for subscribing with ${email}!`);
            this.querySelector('input').value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Recipe Card Hover Effect Enhancement
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.recipe-img img').style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.querySelector('.recipe-img img').style.transform = 'scale(1)';
        });
    });

    // AI Assistant Functionality - Modified for Recipe Generation
    const aiButton = document.querySelector('.ai-button');
    const aiChatContainer = document.querySelector('.ai-chat-container');
    const aiCloseBtn = document.querySelector('.ai-close-btn');
    const aiSendBtn = document.querySelector('.ai-send-btn');
    const aiVoiceBtn = document.querySelector('.ai-voice-btn');
    const aiChatInput = document.querySelector('#ai-chat-input');
    const aiChatMessages = document.querySelector('.ai-chat-messages');

    let recognition;
    let isListening = false;

    // Initialize AI Assistant
    function initAIAssistant() {
        // Toggle chat window
        aiButton.addEventListener('click', () => {
            aiChatContainer.classList.toggle('active');
        });

        aiCloseBtn.addEventListener('click', () => {
            aiChatContainer.classList.remove('active');
        });

        // Send message function - Now calls your backend
        async function sendMessage() {
            const message = aiChatInput.value.trim();
            if (message === '') return;
            
            addMessage(message, 'user');
            aiChatInput.value = '';
            
            showTypingIndicator();
            
            try {
                // Call backend API for AI response
                const response = await fetch('/generate_recipe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ingredients: message })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                removeTypingIndicator();
                addMessage(data.recipe, 'bot');
                
            } catch (error) {
                removeTypingIndicator();
                addMessage("Sorry, I couldn't generate a recipe. Please try again.", 'bot');
            }
        }

        // Handle enter key press
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            } 
        });

        // Handle send button click
        aiSendBtn.addEventListener('click', sendMessage);

        // Initialize voice recognition
        initVoiceRecognition();
    }

    // Initialize voice recognition
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                isListening = true;
                aiVoiceBtn.classList.add('listening');
                addMessage("Listening... Tell me your ingredients", 'bot');
            };

            recognition.onerror = function(event) {
                isListening = false;
                aiVoiceBtn.classList.remove('listening');
                if (event.error === 'not-allowed') {
                    addMessage("Please allow microphone access to use voice commands", 'bot');
                } else {
                    addMessage("Voice recognition error. Please try again", 'bot');
                }
            };

            recognition.onend = function() {
                isListening = false;
                aiVoiceBtn.classList.remove('listening');
            };

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                aiChatInput.value = transcript;
                sendMessage();
            };

            aiVoiceBtn.addEventListener('click', function() {
                if (!isListening) {
                    if (!recognition) {
                        initVoiceRecognition();
                    }
                    try {
                        recognition.start();
                    } catch (error) {
                        addMessage("Couldn't start voice recognition. Please try again.", 'bot');
                    }
                } else {
                    recognition.stop();
                }
            });
        } else {
            // Browser doesn't support speech recognition
            aiVoiceBtn.style.display = 'none';
            addMessage("Your browser doesn't support voice search. Try Chrome or Edge.", 'bot');
        } 
    }

    // Add message to chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('ai-message', `ai-${sender}-message`);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('ai-message-content');
        
        if (typeof content === 'string') {
            contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        } else {
            contentDiv.appendChild(content);
        }
        
        messageDiv.appendChild(contentDiv);
        aiChatMessages.appendChild(messageDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('ai-typing');
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        aiChatMessages.appendChild(typingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.ai-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Initialize the AI Assistant when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initAIAssistant();
        
        // Add sample greeting message
        setTimeout(() => {
            addMessage("Hello! I'm your AI Rasoi assistant. Tell me what ingredients you have, and I'll suggest recipes!", 'bot');
        }, 500);
    });
