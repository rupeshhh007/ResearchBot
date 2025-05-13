document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['researchNotes'], function(result) {
        if (result.researchNotes) {
            document.getElementById('notes').value = result.researchNotes;
        }
    });

    document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
});

async function summarizeText() {
    try {
        // Get the active tab in the browser
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Execute script to get the selected text from the tab
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        // If no text is selected, show a message to the user
        if (!result) {
            showResult('Please select some text first');
            return;
        }

        // API call to your backend (make sure to replace this with your live backend URL)
        const response = await fetch('https://researchbot-1.onrender.com/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: 'summarize' })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));  // Format the result for display

    } catch (error) {
        // Show error messages if something goes wrong
        showResult('Error: ' + error.message);
    }
}

async function saveNotes() {
    const notes = document.getElementById('notes').value;

    // Save the notes in the Chrome local storage
    chrome.storage.local.set({ 'researchNotes': notes }, function() {
        alert('Notes saved successfully');
    });
}

function showResult(content) {
    // Display the result content in the side panel
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
}
