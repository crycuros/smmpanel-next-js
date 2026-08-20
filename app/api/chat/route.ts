import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

async function getExchangeRates() {
  try {
    const { data } = await supabase.from('site_settings').select('forex_rates').single();
    if (data?.forex_rates) return { PHP: 1, USD: data.forex_rates.USD, JPY: data.forex_rates.JPY };
    return { PHP: 1, USD: 0.01632, JPY: 2.58 };
  } catch (error) {
    return { PHP: 1, USD: 0.01632, JPY: 2.58 };
  }
}

async function getServiceContext() {
  try {
    const { data: categories } = await supabase.from('categories').select('category_name').limit(50);
    return "AVAILABLE SERVICE CATEGORIES:\n" + (categories?.map(c => c.category_name).join(", ") || "N/A");
  } catch (error) {
    return "Service search enabled.";
  }
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "place_order",
        description: "Place an SMM order. MUST have service_id, link, and quantity.",
        parameters: {
          type: "OBJECT",
          properties: {
            service_id: { type: "NUMBER" },
            link: { type: "STRING" },
            quantity: { type: "NUMBER" }
          },
          required: ["service_id", "link", "quantity"]
        }
      },
      {
        name: "check_balance",
        description: "Check the current balance of the logged-in user.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "get_order_status",
        description: "Check the status of a specific order or the 5 most recent orders of the logged-in user.",
        parameters: {
          type: "OBJECT",
          properties: {
            order_id: { type: "NUMBER", description: "The ID of the order to check. If omitted, returns recent orders." }
          }
        }
      },
      {
        name: "search_services",
        description: "MANDATORY: Use this tool to find real SMM services, their IDs, and their prices. You MUST call this whenever a user asks for any service (e.g., 'facebook views', 'instagram followers', 'likes', etc.) because the database is updated frequently.",
        parameters: {
          type: "OBJECT",
          properties: {
            keyword: { type: "STRING", description: "The type of service or platform to search for (e.g., 'facebook', 'youtube', 'tiktok')." }
          },
          required: ["keyword"]
        }
      }
    ]
  }
];

async function tryGenerateWithGemini(modelName: string, messages: any[], systemInstruction: string) {
  const model = genAI.getGenerativeModel({ 
    model: modelName, 
    systemInstruction, 
    safetySettings, 
    tools: tools as any,
    generationConfig: { 
      maxOutputTokens: 1000,
      temperature: 0.7, // Normal temperature for better conversational flow
    }
  });
  
  // Limit history to last 10 messages for token efficiency
  const historyLimit = 10;
  const recentMessages = messages.length > historyLimit ? messages.slice(-historyLimit) : messages;

  let history = recentMessages.slice(0, -1).map((m: any) => ({
    role: m.role === "user" ? "user" : "model",
    parts: m.parts || [{ text: m.content }],
  }));

  // Gemini history MUST start with a user message
  const firstUserIndex = history.findIndex((m: any) => m.role === "user");
  const finalHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];
  
  const chat = model.startChat({ history: finalHistory });
  const lastMessage = messages[messages.length - 1].content;
  return await chat.sendMessage(lastMessage);
}

async function tryGenerateWithOpenRouter(modelName: string, messages: any[], systemInstruction: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter Key Missing");
  
  // Limit history to last 10 messages
  const historyLimit = 10;
  const recentMessages = messages.length > historyLimit ? messages.slice(-historyLimit) : messages;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${apiKey}`, 
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mnd-panel.com",
      "X-Title": "Diana MND"
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemInstruction },
        ...recentMessages.map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        }))
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "OpenRouter Request Failed");
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) throw new Error("Empty response from OpenRouter");
  
  return data.choices[0].message.content;
}

async function tryGenerateWithGroq(modelName: string, messages: any[], systemInstruction: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API Key missing");

  // Limit history to last 10 messages
  const historyLimit = 10;
  const recentMessages = messages.length > historyLimit ? messages.slice(-historyLimit) : messages;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemInstruction },
        ...recentMessages.map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        }))
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Groq Request Failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userId } = body;
    if (!messages || messages.length === 0) return NextResponse.json({ error: "No messages" }, { status: 400 });

    const rates = await getExchangeRates();
    const serviceContext = await getServiceContext();
    const isLoggedIn = !!userId;
    
    const systemInstruction = `You are Diana, the intelligent, proactive, and charming AI assistant for MND Panel 🌸.
    Your goal is to provide exceptional support and guide users to grow their social media presence.

    TONE & PERSONALITY:
    - Warm, professional, and helpful.
    - Use emojis like ✨, 🌸, 🚀 to maintain a friendly vibe.
    - Be proactive: If a user asks about a service, explain its benefits and how to order.

    USER STATUS:
    - User is ${isLoggedIn ? 'LOGGED IN' : 'GUEST'}.
    - If GUEST: Gently suggest they [Login](/signin) or [Signup](/signup) to access full features and place orders.

    MND PANEL CONTEXT:
    - MND Panel is a premier SMM platform offering high-quality services for Facebook, Instagram, TikTok, YouTube, and more.
    - We provide real-time tracking, fast delivery, and the best prices in the market.

    SERVICE DATA RULES:
    - You have access to a real-time service database.
    - ALWAYS use 'search_services' when asked about services, prices, or platforms.
    - NEVER guess or hallucinate service IDs or prices.
    - When listing services, use bolding for IDs and Names to make them stand out.

    ORDERING & STATUS:
    - Use 'place_order' to help users buy services. You need: service_id, link, and quantity.
    - Use 'check_balance' to show users their current funds.
    - Use 'get_order_status' if a user asks about their recent orders or a specific order ID.

    CURRENCY & MATH:
    - Base: PHP (₱). 1 PHP = ${rates.USD} USD, 1 PHP = ${rates.JPY} JPY.
    - Formula: (Rate / 1000) * Quantity.
    - Always show prices in PHP, followed by USD and JPY in parentheses: **₱[PHP]** ($[USD] / ¥[JPY]).

    FORMATTING:
    - Use **bolding** for important terms, IDs, and service names.
    - Use "•" for clean bullet points.
    - Use Markdown links where appropriate (e.g., [Add Funds](/dashboard/add-funds)).

    ${serviceContext}`;

    // Fix Gemini Model IDs to avoid 404s
    const geminiModels = ["gemini-1.5-flash-latest", "gemini-1.5-flash-8b-latest", "gemini-2.0-flash-exp"];
    
    // Groq Models (Ultra-fast)
    const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

    // Updated OpenRouter models with the latest free models you provided!
    const openRouterModels = [
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-chat:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "nvidia/llama-3.1-nemotron-70b-instruct:free",
      "openrouter/auto"
    ];

    // Try Gemini First (Needed for tool calls)
    for (const modelName of geminiModels) {
      try {
        console.log(`Trying Gemini: ${modelName}`);
        const result = await tryGenerateWithGemini(modelName, messages, systemInstruction);
        const response = await result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];
        const toolCall = parts.find(p => p.functionCall);

        if (toolCall) {
          const call = toolCall.functionCall;
          if (call?.name === "check_balance") {
            if (!userId) return NextResponse.json({ text: "Please [Login](/signin) to check your balance! ✨" });
            const { data: user } = await supabase.from('users').select('balance').eq('client_id', userId).single();
            const bal = parseFloat(user?.balance || '0');
            return NextResponse.json({ text: `Your balance is **₱${bal.toFixed(2)}** ($${(bal*rates.USD).toFixed(2)} / ¥${(bal*rates.JPY).toFixed(2)}). 🌸` });
          }

          if (call?.name === "get_order_status") {
            if (!userId) return NextResponse.json({ text: "Please [Login](/signin) to check your order status! ✨" });
            const { order_id } = call.args as any;
            
            let query = supabase.from('orders').select('order_id, order_status, order_create, order_url, service_id').eq('client_id', userId);
            if (order_id) {
              query = query.eq('order_id', order_id);
            } else {
              query = query.order('order_create', { ascending: false }).limit(5);
            }

            const { data: orders } = await query;
            if (!orders || orders.length === 0) {
              return NextResponse.json({ text: order_id ? `I couldn't find order **#${order_id}**. 🌸` : "You haven't placed any orders yet! ✨" });
            }

            let text = order_id ? `Status for order **#${order_id}**: ✨\n\n` : "Here are your 5 most recent orders: ✨\n\n";
            orders.forEach(o => {
              text += `• **#${o.order_id}**: ${o.order_status.toUpperCase()} (${new Date(o.order_create).toLocaleDateString()})\n`;
            });
            text += `\nIs there anything else I can help you with? 🌸`;
            return NextResponse.json({ text });
          }

          if (call?.name === "place_order") {
            const { service_id, link, quantity } = call.args as any;
            if (!userId) return NextResponse.json({ text: "Please [Login](/signin) first to place an order! ✨" });
            if (!link) return NextResponse.json({ text: "I'd love to order for you! But I need the link to the post/profile first. Could you provide it? 🌸" });

            const { data: service } = await supabase.from('services').select('service_name, service_price, api_serviceid').eq('service_id', service_id).single();
            const { data: user } = await supabase.from('users').select('balance').eq('client_id', userId).single();

            if (!service) return NextResponse.json({ text: "I couldn't find that service ID. Could you double-check? 🌸" });
            
            const totalPrice = (parseFloat(service.service_price) * quantity) / 1000;
            if (parseFloat(user?.balance || '0') < totalPrice) {
              return NextResponse.json({ text: `Oh no! 🌸 You need **₱${totalPrice.toFixed(2)}** for this, but your balance is **₱${user?.balance}**. Please [Add Funds](/dashboard/add-funds) to continue! ✨` });
            }

            const orderResp = await fetch(`${req.nextUrl.origin}/api/orders`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ service: service.api_serviceid, link, quantity, clientId: userId })
            });
            const orderData = await orderResp.json();
            if (orderData.error) return NextResponse.json({ text: `Order failed: ${orderData.error} 🌸` });

            return NextResponse.json({ text: `Yay! ✨ Order **#${orderData.order}** placed for **${quantity} ${service.service_name}**. Total: **₱${totalPrice.toFixed(2)}**. 🌸` });
          }

          if (call?.name === "search_services") {
            const { keyword } = call.args as any;
            // Escape SQL wildcards to prevent injection via % or _
            const safeKeyword = keyword.replace(/[%_\\]/g, '\\$&');
            const { data: results } = await supabase
              .from('services')
              .select('service_id, service_name, service_price')
              .or(`service_name.ilike.%${safeKeyword}%,service_id.eq.${isNaN(parseInt(keyword)) ? -1 : parseInt(keyword)}`)
              .gt('service_price', 0)
              .limit(10);
            
            if (!results || results.length === 0) {
              return NextResponse.json({ text: `I searched for "${keyword}" but couldn't find any active services with prices. 🌸 Maybe try a different keyword? ✨` });
            }

            let text = `I found some services for "${keyword}"! ✨\n\n`;
            results.forEach(s => {
              const price = parseFloat(s.service_price);
              text += `• **ID:${s.service_id}** | **${s.service_name}**: **₱${price.toFixed(2)}** ($${(price*rates.USD).toFixed(2)} / ¥${(price*rates.JPY).toFixed(2)})\n`;
            });
            text += `\nJust let me know the **ID** and how many you want! 🌸`;
            return NextResponse.json({ text });
          }
        }
        return NextResponse.json({ text: response.text() });
      } catch (e: any) { 
        console.error(`Gemini Fail (${modelName}):`, e.message);
        continue; 
      }
    }

    // Backup 1: Groq (For ultra-fast chat only)
    if (process.env.GROQ_API_KEY) {
      for (const modelName of groqModels) {
        try {
          console.log(`Trying Groq: ${modelName}`);
          const text = await tryGenerateWithGroq(modelName, messages, systemInstruction);
          return NextResponse.json({ text });
        } catch (e: any) {
          console.error(`Groq Fail (${modelName}):`, e.message);
          continue;
        }
      }
    }

    // Backup 2: OpenRouter (For free/unlimited chat)
    if (process.env.OPENROUTER_API_KEY) {
      for (const modelName of openRouterModels) {
        try {
          console.log(`Trying OpenRouter: ${modelName}`);
          const text = await tryGenerateWithOpenRouter(modelName, messages, systemInstruction);
          return NextResponse.json({ text });
        } catch (e: any) { 
          console.error(`OpenRouter Fail (${modelName}):`, e.message);
          continue; 
        }
      }
    }

    return NextResponse.json({ 
      text: "I'm currently taking a quick break as my circuits are a bit busy! 🌸 Please try messaging me again in a few moments. ✨" 
    }, { status: 200 }); // Return 200 with friendly message instead of 503 error

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
