import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔑 Replace these with your actual keys
const SUPABASE_URL = "https://djnctdrtmfamvkidgwhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqbmN0ZHJ0bWZhbXZraWRnd2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDg2OTQsImV4cCI6MjA3MzUyNDY5NH0.Yf8155b0oxhDu62Otx9ZIqr9VV2NcHsZZ45SWJBXZY8";
const GEMINI_API_KEY = "AIzaSyA_ex68LduETbMJIQB9n8Os_jirEbcZiYU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatBox = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = `${sender === "user" ? "You" : "Bot"}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function summarizeAndList(data) {
  if (!data || data.length === 0) return "No transactions available.";

  const categoryTotals = {};
  const transactionList = [];

  data.forEach(t => {
    const cat = t.category || "Other";
    const amount = parseFloat(t.expense);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;

    transactionList.push(`- ₹${amount.toFixed(2)} on ${t.inserted_at} for ${cat}`);
  });

  const summary = Object.entries(categoryTotals)
    .map(([cat, total]) => `- ${cat}: ₹${total.toFixed(2)}`)
    .join("\n");

  return `Transaction List:\n${transactionList.join("\n")}\n\nCategory Summary:\n${summary}`;
}

// Wrap everything in an async function
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    appendMessage("Please log in to use the chatbot.", "bot");
    return; // Exit if not logged in
  }
  const userId = user.id;

  async function getTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error.message);
      return "No transactions available.";
    }

    return summarizeAndList(data);
  }

  async function askGemini(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendMessage(userMsg, "user");
    input.value = "";

    try {
      const txSummary = await getTransactions();
      const today = new Date().toISOString().split("T")[0];
      const finalPrompt = `
User's Question:
${userMsg}

Current Date: ${today}  
Transaction History (last 30 transactions):
${txSummary}

Instructions for the Bot:
- Respond in a professional, polite, and elegant tone.
- Provide concise answers; avoid unnecessary explanations or assumptions.
- Format all numbers with ₹ and keep the output easy to read.
- Use plain text only; do not use Markdown symbols (*, **, _, etc.).
- Include only relevant categories based on the user's question.
- If the question is about a specific period, calculate totals accordingly using the provided dates.
- Present totals and breakdowns clearly and neatly.
`;

      const botReply = await askGemini(finalPrompt);
      appendMessage(botReply, "bot");
    } catch (err) {
      console.error(err);
      appendMessage("Error: " + err.message, "bot");
    }
  });
})();
