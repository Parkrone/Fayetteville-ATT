// --- LOCAL AI CHATBOT LOGIC ---

// 1. "TRAINING DATA" (The Knowledge Base)
const faqData = [
    {
        keywords: ["hours", "open", "close", "time", "schedule"],
        answer: "We are open Monday-Saturday 10:00 AM - 8:00 PM, and Sunday 12:00 PM - 6:00 PM. (Hours may vary on holidays)."
    },
    {
        keywords: ["phone", "call", "contact", "number", "speak", "talk"],
        answer: "You can reach us at (479) 439-5471. Tap the 'Call Store' button on the home screen to dial immediately!"
    },
    // UPDATED: iPhone 17
    {
        keywords: ["iphone", "17", "pro", "max", "apple", "new iphone"],
        answer: "We have the latest iPhone 17 lineup available! Check out our 'Order Online' section to support a rep and get yours."
    },
    // UPDATED: Galaxy S25
    {
        keywords: ["samsung", "galaxy", "s25", "android", "flip", "fold"],
        answer: "The new Samsung Galaxy S25 series is in stock. Ask a rep about our trade-in offers for Galaxy devices."
    },
    // NEW: Pixel 10
    {
        keywords: ["google", "pixel", "10", "pro", "fold"],
        answer: "The Google Pixel 10 series is here! We have the latest Google phones available for order."
    },
    {
        keywords: ["trade", "trade-in", "value", "old phone", "swap"],
        answer: "We offer great trade-in values for your old devices. It's best to bring your phone into the store for an accurate appraisal by a manager."
    },
    // UPDATED: Bill Pay Link
    {
        keywords: ["bill", "pay", "payment", "billing", "due"],
        answer: "Need to pay a bill? You can use <a href='https://www.att.com/acctmgmt/fastpmt/fastpay' target='_blank' style='color: var(--att-blue); text-decoration: underline;'>Fast Pay (No Sign-In Required)</a> or visit us in-store."
    },
    // UPDATED: Device Support Link
    {
        keywords: ["help", "broken", "fix", "setup", "trouble", "issue", "device support"],
        answer: "For troubleshooting and setup guides, try the <a href='https://www.att.com/device-support/selector/' target='_blank' style='color: var(--att-blue); text-decoration: underline;'>AT&T Device Support Tool</a>."
    },
    // UPDATED: Account Management Link
    {
        keywords: ["login", "account", "password", "manage", "signin", "sign in"],
        answer: "To manage your account or view details, please <a href='https://signin.att.com/dynamic/iamLRR/LrrController?IAM_OP=login' target='_blank' style='color: var(--att-blue); text-decoration: underline;'>Log In to AT&T</a>."
    },
    // UPDATED: Complaint Handling (Store Number Only)
    {
        keywords: ["manager", "nafis", "complaint", "feedback", "issue", "problem", "mad", "upset"],
        answer: "Our Store Manager is Nafis. If you have any concerns or feedback, please call us directly at (479) 439-5471 so we can assist you immediately."
    },
    {
        keywords: ["rep", "parker", "ashley", "momilynn", "commission", "support"],
        answer: "You can support Parker, Ashley, or Momilynn by selecting their name in the 'Order Online' menu. They really appreciate it!"
    },
    {
        keywords: ["hello", "hi", "hey", "start", "greetings"],
        answer: "Hello! 👋 I'm the Fayetteville Store Virtual Assistant. I can help with hours, bill pay links, device support, and more!"
    }
];

// 2. THE "BRAIN" (Keyword Scoring Algorithm)
function findBestAnswer(userQuery) {
    const queryWords = userQuery.toLowerCase().split(/\s+/); // Tokenize input
    let bestMatch = null;
    let maxScore = 0;

    faqData.forEach(entry => {
        let score = 0;
        entry.keywords.forEach(keyword => {
            if (userQuery.toLowerCase().includes(keyword)) {
                score += 3; // Exact match bonus
            }
            // Fuzzy match (partial word)
            queryWords.forEach(word => {
                if (keyword.includes(word) && word.length > 3) {
                    score += 1;
                }
            });
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = entry;
        }
    });

    // Threshold: If score is too low, we don't know the answer.
    if (maxScore > 0 && bestMatch) {
        return bestMatch.answer;
    } else {
        return "I'm not sure about that one yet. Please call the store at (479) 439-5471 for detailed assistance!";
    }
}

// 3. UI HANDLERS
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    
    if (chatWindow.classList.contains('chat-hidden')) {
        chatWindow.classList.remove('chat-hidden');
        chatWindow.classList.add('chat-visible');
        if(chatInput) chatInput.focus();
    } else {
        chatWindow.classList.remove('chat-visible');
        chatWindow.classList.add('chat-hidden');
    }
}

function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const text = inputField.value.trim();

    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    inputField.value = "";

    // Simulate "Thinking" delay
    setTimeout(() => {
        const answer = findBestAnswer(text);
        addMessage(answer, 'bot');
    }, 600);
}

function addMessage(text, sender) {
    const msgContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender === 'user' ? 'msg-user' : 'msg-bot');
    
    // UPDATED: Use innerHTML to allow links to work
    msgDiv.innerHTML = text;
    
    msgContainer.appendChild(msgDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight; // Auto scroll to bottom
}

// Allow "Enter" key to send
document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById('chat-input');
    if (inputField) {
        inputField.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
    }
});
