document.getElementById('prefixButton').addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            const currentUrl = tab.url;
            // You can use your own api or other tools and website to remove paywall like 12ft.io, freedium etc.
            const newUrl = "https://archive.ph/search/?q=" + currentUrl;
            chrome.tabs.update(tab.id, { url: newUrl });
        }
    } catch (error) {
        console.error("Error updating link:", error);
    }
  });
  
  // Summarize Page
  document.getElementById('summarizeButton').addEventListener('click', async () => {
    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
        if (!tab) return;
  
        let results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText.substring(0, 5000) // Extracts first 5000 characters
        });
  
        let pageContent = results[0]?.result;
        if (!pageContent || pageContent.trim() === "") {
            document.getElementById('summary').innerText = "No readable content found!";
            return;
        }
  
        console.log("Extracted Text (First 200 chars):", pageContent.substring(0, 200)); // Debugging
  
        // Call Gemini AI API for summarization
        const summary = await summarizeWithGemini(pageContent);
  
        // Display the summary
        let summaryDiv = document.getElementById('summary');
        summaryDiv.innerText = summary;
        summaryDiv.style.display = 'block';
  
    } catch (error) {
        console.error("Error summarizing content:", error);
        document.getElementById('summary').innerText = "Error summarizing content. Check console.";
    }
  });
  
  // Google Gemini API Request Function. you can also use other AI API's including openai,claude etc.
  async function summarizeWithGemini(text) {
    // Replace with actual API key
    const API_KEY = "your_API_key";  
    // Check the official documentation of googlle gemini api for changing the ai model, or other AI model documentation on how to setup the api endpoint.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`; 
  
    try {
        console.log("Sending API request to Gemini..."); // Debugging
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Summarize this webpage content:\n\n${text.substring(0, 4000)}` }]
                }]
            })
        });
  
        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            return `API Error: ${response.status} ${response.statusText}`;
        }
  
        const data = await response.json();
        console.log("API Response:", data); // Debugging
  
        if (!data || !data.candidates || data.candidates.length === 0) {
            return "No summary available.";
        }
  
        return data.candidates[0]?.content?.parts?.[0]?.text || "Summary not found.";
  
    } catch (error) {
        console.error("❌ Gemini API Request Failed:", error);
        return "Failed to connect to AI. Check API Key & Internet.";
    }
  }
  