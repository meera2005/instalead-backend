/**
 * Seeds demo conversations for user 3 (meera@instalead.com)
 * Run: node scripts/seed_demo.js
 */
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const USER_ID = 3;

const DEMO_CONVERSATIONS = [
  {
    name: 'Priya Sharma',
    thread: 'demo_priya_sharma',
    status: 'Booked',
    messages: [
      { dir: 'inbound',  body: 'Hi! I came across your work on Instagram. Your photos are absolutely stunning! 😍 We are planning a wedding in January and looking for a photographer.', hoursAgo: 72 },
      { dir: 'outbound', body: 'Thank you so much Priya! 🙏 Congratulations on the upcoming wedding! January is a beautiful time. Our wedding package is ₹1,00,000 — it covers 8 hours of coverage with 400+ edited photos. Want me to share what\'s all included?', hoursAgo: 71 },
      { dir: 'inbound',  body: 'Yes please! That sounds great. What all is covered?', hoursAgo: 70 },
      { dir: 'outbound', body: 'The package includes full day coverage, candid + portrait shots, one lead photographer + one assistant, online gallery delivery in 3-4 weeks, and a beautifully edited album of 400+ photos. We also do a pre-shoot consultation call! 📸', hoursAgo: 69 },
      { dir: 'inbound',  body: 'Wow that sounds amazing! Is January 18th available?', hoursAgo: 68 },
      { dir: 'outbound', body: 'Let me check — January 18th is available! 🎉 Want me to block it for you? We just need a 20% advance to confirm the booking.', hoursAgo: 67 },
      { dir: 'inbound',  body: 'Yes! Let\'s go ahead. How do I pay the advance?', hoursAgo: 66 },
      { dir: 'outbound', body: 'Amazing!! I\'ll send you the booking form and payment link right away. So excited to be a part of your special day! 🤍', hoursAgo: 65 },
    ]
  },
  {
    name: 'Ananya Reddy',
    thread: 'demo_ananya_reddy',
    status: 'Booked',
    messages: [
      { dir: 'inbound',  body: 'Hello! My sister\'s wedding is in February. We want coverage for both the sangeeth and the wedding. Do you do combo packages?', hoursAgo: 120 },
      { dir: 'outbound', body: 'Hey Ananya! Yes we do 😊 Sangeeth is ₹30,000 and wedding is ₹1,00,000. If you book both together, we can offer a small discount. Which dates are you looking at?', hoursAgo: 119 },
      { dir: 'inbound',  body: 'Feb 14th for sangeeth and Feb 16th for wedding. What would the total come to with the combo?', hoursAgo: 118 },
      { dir: 'outbound', body: 'Both dates are open! 🎉 Let me check with the team on the exact combo pricing and get back to you in a few minutes.', hoursAgo: 117 },
      { dir: 'outbound', body: 'Good news — for booking both together we can do ₹1,20,000 for the full package covering both days! That\'s a saving of ₹10,000 😊', hoursAgo: 116 },
      { dir: 'inbound',  body: 'That is so reasonable! We are in. How do we confirm?', hoursAgo: 115 },
      { dir: 'outbound', body: 'Yay!! I\'ll share the booking details now. So happy to be capturing both these special days for your family 🤍', hoursAgo: 114 },
    ]
  },
  {
    name: 'Kavya Menon',
    thread: 'demo_kavya_menon',
    status: 'Booked',
    messages: [
      { dir: 'inbound',  body: 'Hi! I\'m planning a baby shower for my sister next month. Looking for a photographer. Do you do baby showers?', hoursAgo: 96 },
      { dir: 'outbound', body: 'Aww congratulations to your sister! 🍼 Yes we do baby showers! Pricing depends on the coverage hours you need. Can you tell me roughly how many hours the event will be?', hoursAgo: 95 },
      { dir: 'inbound',  body: 'Probably 3-4 hours. How much would that be?', hoursAgo: 94 },
      { dir: 'outbound', body: 'For 3-4 hours we usually do a custom quote based on location and guest count. Can you share the date and venue city?', hoursAgo: 93 },
      { dir: 'inbound',  body: 'July 5th, Bangalore. Around 50 guests.', hoursAgo: 92 },
      { dir: 'outbound', body: 'Perfect! July 5th is available 🎉 For 4 hours, 50 guests in Bangalore — we can do ₹15,000 with 150+ edited photos. Does that work?', hoursAgo: 91 },
      { dir: 'inbound',  body: 'That\'s perfect! Let\'s book it 🙌', hoursAgo: 90 },
    ]
  },
  {
    name: 'Rhea Thomas',
    thread: 'demo_rhea_thomas',
    status: 'Replied',
    messages: [
      { dir: 'inbound',  body: 'Hi, I absolutely love your wedding portfolio! We are getting married in December and want to know more.', hoursAgo: 48 },
      { dir: 'outbound', body: 'Thank you so much Rhea, that means a lot! 🤍 Congratulations! December is so popular — what date are you thinking?', hoursAgo: 47 },
      { dir: 'inbound',  body: 'December 20th. Is it available?', hoursAgo: 46 },
      { dir: 'outbound', body: 'December 20th — let me check! Yes it\'s still open 🎉 Our wedding package is ₹1,00,000 for full day coverage. Want me to walk you through what\'s included?', hoursAgo: 45 },
      { dir: 'inbound',  body: 'Yes please! Also is there any pre-wedding shoot included?', hoursAgo: 44 },
      { dir: 'outbound', body: 'The main package covers the wedding day fully. We offer pre-wedding shoots as an add-on — let me check the pricing for that and get back to you!', hoursAgo: 43 },
    ]
  },
  {
    name: 'Divya Nair',
    thread: 'demo_divya_nair',
    status: 'Follow-up Due',
    messages: [
      { dir: 'inbound',  body: 'Hello! I need a photographer for my birthday party next month. Can you help?', hoursAgo: 36 },
      { dir: 'outbound', body: 'Hi Divya! Happy early birthday! 🎂 Yes of course! Our birthday package starts at ₹20,000. What date and how many hours are you thinking?', hoursAgo: 35 },
      { dir: 'inbound',  body: 'August 3rd, about 4 hours. 30 guests.', hoursAgo: 34 },
      { dir: 'outbound', body: 'August 3rd is available! 🎉 For 4 hours and 30 guests, ₹20,000 covers everything — candid shots, group photos, edited gallery in 2 weeks. Want to go ahead?', hoursAgo: 33 },
      { dir: 'inbound',  body: 'Sounds good! Let me discuss with my family and get back to you by tomorrow.', hoursAgo: 32 },
    ]
  },
  {
    name: 'Nisha Varma',
    thread: 'demo_nisha_varma',
    status: 'Follow-up Due',
    messages: [
      { dir: 'inbound',  body: 'Hi! Saw your bridal shower photos — they are gorgeous! Planning one for my best friend. How much would it be?', hoursAgo: 60 },
      { dir: 'outbound', body: 'Thank you! 🌸 Bridal showers are so fun to shoot. Pricing varies based on duration and coverage — can you share roughly when it is and for how many hours?', hoursAgo: 59 },
      { dir: 'inbound',  body: 'July 28th, around 3 hours. About 20 girls.', hoursAgo: 58 },
      { dir: 'outbound', body: 'July 28th works! For 3 hours, 20 guests — we can do a custom bridal shower package. Let me get the exact quote and send it to you!', hoursAgo: 57 },
      { dir: 'inbound',  body: 'Perfect! Please do send it. We are finalising everything this week.', hoursAgo: 56 },
      { dir: 'outbound', body: 'Sending it right over! Can I get your WhatsApp number so I can send the detailed quote with sample photos too? 😊', hoursAgo: 55 },
    ]
  },
  {
    name: 'Sneha Kumar',
    thread: 'demo_sneha_kumar',
    status: 'Lost',
    messages: [
      { dir: 'inbound',  body: 'Hi! How much is a haldi shoot?', hoursAgo: 144 },
      { dir: 'outbound', body: 'Hey Sneha! Haldi shoots are so colorful and fun 🌸 Our haldi package is ₹10,000. It covers 2 hours with 80+ edited photos. Does that work for you?', hoursAgo: 143 },
      { dir: 'inbound',  body: 'That is quite high for just haldi. Our budget is around 5k. Can you do anything at that price?', hoursAgo: 142 },
      { dir: 'outbound', body: 'I understand! The ₹10,000 covers professional lighting, a full-time photographer, and edited photos delivered within a week. I\'d need to check with the team if we can adjust for budget — would 1.5 hours at ₹7,500 work?', hoursAgo: 141 },
      { dir: 'inbound',  body: 'We will think about it. Thanks!', hoursAgo: 140 },
    ]
  },
  {
    name: 'Ishita Patel',
    thread: 'demo_ishita_patel',
    status: 'Lost',
    messages: [
      { dir: 'inbound',  body: 'Hi! What is the price for a wedding package?', hoursAgo: 200 },
      { dir: 'outbound', body: 'Hi Ishita! Our wedding package is ₹1,00,000 for full day coverage. Includes 400+ edited photos, two photographers, and online gallery 😊', hoursAgo: 199 },
      { dir: 'inbound',  body: 'Can you do it for 60,000? That\'s what other photographers are quoting us.', hoursAgo: 198 },
      { dir: 'outbound', body: 'I appreciate you sharing that! Discounts are something I\'d need to check with the team — our pricing reflects the quality and experience we bring. Let me get back to you on this!', hoursAgo: 197 },
      { dir: 'inbound',  body: 'Ok but we need to finalise by tomorrow. If not we\'ll go with someone else.', hoursAgo: 196 },
      { dir: 'outbound', body: 'Totally understand — I\'ll check ASAP and come back to you today!', hoursAgo: 195 },
      { dir: 'inbound',  body: 'We went ahead with another photographer. Thanks anyway.', hoursAgo: 192 },
    ]
  },
  {
    name: 'Pooja Krishnan',
    thread: 'demo_pooja_krishnan',
    status: 'Replied',
    messages: [
      { dir: 'inbound',  body: 'Hello! I want birthday photography for my daughter\'s first birthday. Super excited! 🎂', hoursAgo: 24 },
      { dir: 'outbound', body: 'Aww first birthdays are THE best to photograph! 🎉 Our birthday package is ₹20,000 for 3-4 hours with full editing. When is the big day?', hoursAgo: 23 },
      { dir: 'inbound',  body: 'September 10th! Can you do it in Chennai?', hoursAgo: 22 },
      { dir: 'outbound', body: 'September 10th — let me check availability for Chennai. We do travel for events, so travel cost would be extra. I\'ll confirm dates and share full details shortly!', hoursAgo: 21 },
    ]
  },
  {
    name: 'Aisha Mohammed',
    thread: 'demo_aisha_mohammed',
    status: 'New',
    messages: [
      { dir: 'inbound',  body: 'Assalamualaikum! I need a photographer for my sangeet ceremony. Saw your work and loved it! How much do you charge?', hoursAgo: 6 },
      { dir: 'outbound', body: 'Walaikum assalam Aisha! 🌸 Thank you so much! Our sangeeth package is ₹30,000 — covers the full event with candid photography and edited photos in 2-3 weeks. When is it planned?', hoursAgo: 5 },
      { dir: 'inbound',  body: 'October 5th, Delhi. Is that possible?', hoursAgo: 4 },
    ]
  },
  {
    name: 'Meena Iyer',
    thread: 'demo_meena_iyer',
    status: 'New',
    messages: [
      { dir: 'inbound',  body: 'Hi! We are planning a wedding for 2027 but want to book early. Do you take advance bookings?', hoursAgo: 3 },
      { dir: 'outbound', body: 'Hi Meena! Absolutely — we love early bookings and they help you secure your preferred date 😊 For 2027 we can lock in the current pricing with a small advance. When in 2027 are you thinking?', hoursAgo: 2 },
      { dir: 'inbound',  body: 'March or April 2027. We want a morning slot.', hoursAgo: 1 },
    ]
  },
];

async function seedDemo() {
  console.log('🌱 Seeding demo conversations for user 3...');

  // First, rename any existing "Unknown" conversations
  await pool.query(`
    UPDATE conversations SET participant_name = 'me_mee_meera'
    WHERE user_id = 2 AND participant_name IS NULL OR participant_name = 'Unknown'
  `).catch(() => {});

  for (const conv of DEMO_CONVERSATIONS) {
    const threadId = conv.thread;

    // Upsert conversation
    const { rows: convRows } = await pool.query(
      `INSERT INTO conversations (user_id, ig_thread_id, participant_name, participant_ig_id, last_message_at)
       VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval)
       ON CONFLICT (user_id, ig_thread_id) DO UPDATE SET
         participant_name = EXCLUDED.participant_name,
         last_message_at = EXCLUDED.last_message_at
       RETURNING id`,
      [USER_ID, threadId, conv.name, `demo_${threadId}`, conv.messages[conv.messages.length - 1].hoursAgo]
    );
    const convId = convRows[0].id;

    // Insert messages
    for (let i = 0; i < conv.messages.length; i++) {
      const m = conv.messages[i];
      await pool.query(
        `INSERT INTO messages (conversation_id, ig_message_id, direction, body, sent_at)
         VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval)
         ON CONFLICT (ig_message_id) DO NOTHING`,
        [convId, `demo_msg_${threadId}_${i}`, m.dir, m.body, m.hoursAgo]
      );
    }

    // Upsert lead status
    if (conv.status) {
      await pool.query(
        `INSERT INTO leads (conversation_id, user_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (conversation_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
        [convId, USER_ID, conv.status]
      );
    }

    console.log(`  ✅ ${conv.name} (${conv.status})`);
  }

  console.log('\n✨ Demo data seeded successfully!');
  await pool.end();
}

seedDemo().catch(err => { console.error(err); process.exit(1); });
