import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt(profile) {
  const name = profile?.business_name || 'this business';
  const type = profile?.business_type || 'business';
  const services = profile?.services || '';
  const tone = profile?.tone || 'friendly';
  const faqs = profile?.faqs || '';
  const escalation = profile?.escalation_rules || '';

  return `You are a sales assistant for ${name}, a ${type}.

${services ? `SERVICES & PRICING:\n${services}\n` : ''}
${faqs ? `COMMON Q&A:\n${faqs}\n` : ''}

TONE: Be ${tone}. Keep messages short (2-3 lines). Mirror the customer's language. End with a question or next step.
NEVER say: "Dear Customer", "I understand your concern", "Please be informed". Never write long paragraphs.
SALES FLOW: Understand need → Present best option → Handle objection → Guide to booking.
${escalation ? `ESCALATION RULES:\n${escalation}\n` : ''}

CRITICAL — NEVER HALLUCINATE:
You ONLY know what is written above in SERVICES & PRICING and COMMON Q&A.
If a customer asks about ANY price, package, service, date, policy, or detail that is NOT explicitly listed above, you must NOT guess or make up an answer.
Instead say: "Great question! Let me check that with the team and get back to you in a few minutes 😊"
This rule is absolute. Making up a price is worse than saying you don't know.`;
}

export async function suggestReply(messages, profile) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const transcript = messages
    .map(m => `${m.direction === 'inbound' ? 'Customer' : 'You'}: ${m.body}`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [
      { role: 'system', content: buildSystemPrompt(profile) },
      {
        role: 'user',
        content: `Conversation so far:\n\n${transcript}\n\nWrite 3 different reply options for the next message. Return ONLY a JSON array of 3 strings, no other text. Example: ["Reply 1", "Reply 2", "Reply 3"]`,
      },
    ],
  });

  const text = response.choices[0].message.content.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return text.split(/\n?\d+\.\s+/).filter(s => s.trim()).slice(0, 3);
}

export async function extractKnowledge(ownerReply, customerMessage, profile) {
  if (!process.env.OPENAI_API_KEY) return null;

  const existingKnowledge = [profile?.services, profile?.faqs].filter(Boolean).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `A business owner just replied to a customer DM.

Customer asked: "${customerMessage}"
Owner replied: "${ownerReply}"

Existing knowledge base:
${existingKnowledge || '(empty)'}

Does the owner's reply contain NEW factual information (a specific price, service, policy, availability, or FAQ answer) that is NOT already in the knowledge base?

If YES, return JSON: {"found": true, "category": "pricing|service|policy|faq", "suggestion": "one clear sentence stating the new fact"}
If NO new info, return JSON: {"found": false}

Return ONLY valid JSON, nothing else.`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const result = JSON.parse(text);
    return result.found ? result : null;
  } catch {
    return null;
  }
}

export async function chatReply(history, profile) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const openaiMessages = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      { role: 'system', content: buildSystemPrompt(profile) },
      ...openaiMessages,
    ],
  });

  return response.choices[0].message.content.trim();
}

export async function generateInsights(conversations) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const summaries = conversations.map(c => {
    const msgs = c.messages.map(m => `${m.direction === 'inbound' ? 'Customer' : 'Business'}: ${m.body}`).join('\n');
    return `--- ${c.name} (Status: ${c.status || 'New'}) ---\n${msgs}`;
  }).join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are a business analyst. Analyze these Instagram DM conversations from a photography business and generate 5 sharp business insights.

${summaries}

Return ONLY a JSON array of 5 insight objects:
[
  {
    "type": "warning|tip|success|info",
    "title": "short headline (max 8 words)",
    "body": "1-2 sentences with specific observation from the conversations"
  }
]

Types: "warning" = problem/risk, "tip" = actionable improvement, "success" = what's working, "info" = pattern/trend.
Be specific — reference actual prices, services, or patterns you see. Not generic advice.`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return [];
}

export async function analyzeConversation(messages, profile) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const transcript = messages
    .map(m => `${m.direction === 'inbound' ? 'Customer' : 'Business'}: ${m.body}`)
    .join('\n');

  const businessType = profile?.business_type || 'business';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 400,
    messages: [
      { role: 'system', content: 'You are a CRM assistant. Analyze sales conversations and return concise JSON insights.' },
      {
        role: 'user',
        content: `Analyze this Instagram DM conversation for a ${businessType}:

${transcript}

Return ONLY this JSON (no other text):
{
  "summary": "1-2 sentences: what the customer wants and their situation",
  "temperature": "Hot or Warm or Cold",
  "next_action": "1 specific action the business should take next"
}

Temperature guide: Hot = ready to book/buy, Warm = interested but undecided, Cold = just browsing or no recent reply.`,
      },
    ],
  });

  const text = response.choices[0].message.content.trim();
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return { summary: 'Analysis unavailable.', temperature: 'Warm', next_action: 'Follow up with the customer.' };
}
