const express = require("express");
const axios = require("axios");
const app = express();


app.use(express.json());

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("Webhook is live!");
});

app.post("/webhook", async (req, res) => {
    const query = req.body.queryResult.queryText;
    const searchTerm = req.body.queryResult.parameters.person.name.replace(/ /g, "_");


    try {
        console.log(`Fetching Wikipedia data for: ${searchTerm}`);
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`
        );

        console.log("Wikipedia API Response:", response.data);
        const reply = response.data.extract || "Sorry, I couldn't find anything.";

        res.json({
            fulfillmentMessages: [
                {
                    text: {
                        text: [reply]
                    }
                }
            ]
        });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.json({ fulfillmentText: "Error: " + error.message });
    }

});

app.listen(3000, () => console.log("Webhook server running on port 3000"));
