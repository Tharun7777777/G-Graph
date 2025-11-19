import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://djnctdrtmfamvkidgwhx.supabase.co";
const SUPABASE_ANON_KEY = "AIzaSyDkpCjMn-nip8amGgp09LSPpgCcoBNebG8";
const GEMINI_API_KEY = "AIzaSyA_ex68LduETbMJIQB9n8Os_jirEbcZiYU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatBox = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

// Append messages
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.textContent = `${sender === "user" ? "You" : "Bot"}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Summarize transactions
function summarizeAndList(data) {
  if (!data || data.length === 0) return "No transactions available.";

  const categoryTotals = {};
  const transactionList = [];

  data.forEach(t => {
    const cat = t.category || "Other";
    const amount = parseFloat(t.expense);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    transactionList.push(`- ₹${amount.toFixed(2)} on ${new Date(t.inserted_at).toLocaleString()} for ${cat}`);
  });

  const summary = Object.entries(categoryTotals)
    .map(([cat, total]) => `- ${cat}: ₹${total.toFixed(2)}`)
    .join("\n");

  return `Transaction List:\n${transactionList.join("\n")}\n\nCategory Summary:\n${summary}`;
}

// Parse period from user input
function getPeriodFromQuestion(question) {
  const lower = question.toLowerCase();
  const now = new Date();
  let start = null, end = null;

  if (/today/.test(lower)) {
    start = new Date(now); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  } else if (/yesterday/.test(lower)) {
    start = new Date(now); start.setDate(now.getDate() -1); start.setHours(0,0,0,0);
    end = new Date(now); end.setDate(now.getDate() -1); end.setHours(23,59,59,999);
  } else if (/last week/.test(lower)) {
    const day = now.getDay(); // Sunday=0
    start = new Date(now); start.setDate(now.getDate() - day - 6); start.setHours(0,0,0,0);
    end = new Date(now); end.setDate(now.getDate() - day); end.setHours(23,59,59,999);
  } else if (/last month/.test(lower)) {
    start = new Date(now.getFullYear(), now.getMonth() -1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (/last (\d+) days/.test(lower)) {
    const days = parseInt(lower.match(/last (\d+) days/)[1]);
    start = new Date(now); start.setDate(now.getDate() - days); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  } else if (/last (sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(lower)) {
    const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const match = lower.match(/last (sunday|monday|tuesday|wednesday|thursday|friday|saturday)/)[1];
    const targetDay = dayNames.indexOf(match);
    const diff = (new Date().getDay() - targetDay + 7) % 7 || 7; // days to subtract
    start = new Date(now); start.setDate(now.getDate() - diff); start.setHours(0,0,0,0);
    end = new Date(now); end.setDate(now.getDate() - diff); end.setHours(23,59,59,999);
  }

  return { start, end };
}

// Filter transactions by date range
function filterTransactionsByDate(data, start, end) {
  if (!start || !end) return data;
  return data.filter(t => {
    const date = new Date(t.inserted_at);
    return date >= start && date <= end;
  });
}

// Main IIFE
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    appendMessage("Please log in to use the chatbot.", "bot");
    return;
  }
  const userId = user.id;

  async function getTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
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

  // Handle chat form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendMessage(userMsg, "user");
    input.value = "";

    try {
      const allData = await getTransactions();
      const { start, end } = getPeriodFromQuestion(userMsg);
      const filteredData = filterTransactionsByDate(allData, start, end);
      const txSummary = summarizeAndList(filteredData);

      const today = new Date().toISOString().split("T")[0];
      const finalPrompt = `
User's Question:
${userMsg}

Current Date: ${today}  
Transaction History:
${txSummary}

Instructions for the Bot:
- Respond professionally, politely, and elegantly.
- Provide concise answers; avoid unnecessary explanations or assumptions.
- Format all numbers with ₹ and keep the output easy to read.
- Use plain text only; do not use Markdown symbols (*, **, _, etc.).
- Include only relevant categories based on the user's question.
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

