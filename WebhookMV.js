const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("Webhook is live!");
});

app.post("/webhook", async (req, res) => {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    const query = req.body?.queryResult?.queryText || "No query received";
    let searchTerm = req.body.queryResult?.parameters?.any || query;  

    // Clean up search term: Remove question words
    searchTerm = searchTerm
        .toLowerCase()
        .replace(/\b(who is|what is|tell me about|define)\b/gi, "")  // Remove unnecessary words
        .trim()
        .replace(/ /g, "_");  // Convert spaces to underscores

    if (!searchTerm) {
        return res.json({ fulfillmentText: "Sorry, I couldn't understand your request." });
    }

    try {
        console.log(`Fetching Wikipedia data for: ${searchTerm}`);
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`
        );

        if (!response.data || !response.data.extract) {
            console.log("No data found for", searchTerm);
            return res.json({ fulfillmentText: "Sorry, I couldn't find anything on Wikipedia." });
        }

        console.log("Wikipedia API Response:", response.data);
        const reply = response.data.extract;

        res.json({ fulfillmentText: reply });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.json({ fulfillmentText: "There was an error fetching data. Please try again later." });
    }
});

// Use dynamic port for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));
