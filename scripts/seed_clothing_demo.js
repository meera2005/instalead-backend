/**
 * Seeds demo account for The Label (ethnic clothing brand)
 * Creates: demo@thelabel.com / thelabel123
 * Run: node scripts/seed_clothing_demo.js
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const DEMO_EMAIL = 'demo@thelabel.com';
const DEMO_PASSWORD = 'thelabel123';

const DEMO_CONVERSATIONS = [
  // ── PRE-PURCHASE HELP ──
  {
    name: 'Riya Kapoor',
    thread: 'label_riya_kapoor',
    status: 'Booked',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hi! I saw the ivory coord set on your stories and I\'m obsessed 😍 I\'m usually between S and M — which size should I pick?', hoursAgo: 72 },
      { dir: 'outbound', body: 'Hey Riya! Our coord sets have a relaxed fit — if you\'re between S and M, I\'d suggest S for a more fitted look or M if you love a flowy style 🌿 The ivory is stunning either way! Size chart is on the product page 🤍', hoursAgo: 71 },
      { dir: 'inbound',  body: 'Going with S! Just ordered from the website 🛍️', hoursAgo: 69 },
      { dir: 'outbound', body: 'Amazing!! You\'re going to love it 🤍 Ships within 2 business days — tag us when it arrives!', hoursAgo: 68 },
    ]
  },
  {
    name: 'Priya Bhatia',
    thread: 'label_priya_bhatia',
    status: 'Booked',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I need something for my cousin\'s wedding — daytime function, pastels preferred. What would you suggest from your current collection?', hoursAgo: 96 },
      { dir: 'outbound', body: 'Hello Priya! 🌸 For a daytime wedding, our blush organza saree (₹12,000) or the mint tissue silk (₹9,500) would be perfect. Both are light, breathable, and stunning in photos ✨', hoursAgo: 95 },
      { dir: 'inbound',  body: 'The blush organza sounds dreamy. Can I see more looks?', hoursAgo: 94 },
      { dir: 'outbound', body: 'Just posted a reel of it on our page! Also DMing you some lookbook shots 🌸 You can order directly on our website — link in bio!', hoursAgo: 93 },
      { dir: 'inbound',  body: 'Ordered the blush organza! So excited 🤍', hoursAgo: 91 },
      { dir: 'outbound', body: 'You\'re going to look absolutely beautiful ✨ We\'ll prioritise dispatch — tracking link coming your way!', hoursAgo: 90 },
    ]
  },
  {
    name: 'Meena Pillai',
    thread: 'label_meena_pillai',
    status: 'Lost',
    temperature: 'Cold',
    messages: [
      { dir: 'inbound',  body: 'Hi! Is the chanderi fabric in the coord sets see-through? I have an outdoor event and I\'m worried.', hoursAgo: 144 },
      { dir: 'outbound', body: 'Hi Meena! The chanderi coord set has a lining so it\'s not see-through at all 🌿 Perfect for outdoor events. The fabric is also quite breathable for summer. You can check the product details on our website!', hoursAgo: 143 },
      { dir: 'inbound',  body: 'Oh okay. What\'s the price?', hoursAgo: 142 },
      { dir: 'outbound', body: 'The coord set is ₹4,500 😊 Available in sage green, dusty pink, ivory, and black. Link in bio to order!', hoursAgo: 141 },
      { dir: 'inbound',  body: 'That\'s a bit more than I was looking to spend. Let me think.', hoursAgo: 140 },
      { dir: 'outbound', body: 'Totally understand! Our kurta sets start at ₹3,200 if that fits better 🌸 Happy to help you find the right piece!', hoursAgo: 139 },
    ]
  },
  {
    name: 'Rohan Kapoor',
    thread: 'label_rohan_gifting',
    status: 'Lost',
    temperature: 'Cold',
    messages: [
      { dir: 'inbound',  body: 'Hi! Want to gift my wife for our anniversary. She loves your brand. Something under ₹5,000?', hoursAgo: 200 },
      { dir: 'outbound', body: 'How sweet! 🎁 Under ₹5,000 we have coord sets at ₹4,500 and kurta sets at ₹3,200 — both are bestsellers. What\'s her size?', hoursAgo: 199 },
      { dir: 'inbound',  body: 'I think S or M. She\'s petite.', hoursAgo: 198 },
      { dir: 'outbound', body: 'For petite builds, S usually works beautifully 🌸 The dusty pink coord set in S is our most loved piece right now — very gifting-worthy! Link in bio to order.', hoursAgo: 197 },
      { dir: 'inbound',  body: 'I\'ll come back to this. Thanks!', hoursAgo: 196 },
    ]
  },
  // ── POST-PURCHASE SUPPORT ──
  {
    name: 'Nisha Verma',
    thread: 'label_nisha_verma',
    status: 'Replied',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hi! I ordered 6 days ago (Order #3012) and haven\'t received a tracking link yet. Can you help?', hoursAgo: 12 },
      { dir: 'outbound', body: 'Hey Nisha! So sorry for the delay 😟 Let me check Order #3012 with our dispatch team right now. I\'ll get back to you within the hour!', hoursAgo: 11 },
      { dir: 'inbound',  body: 'Thank you! I need it by this weekend for an event.', hoursAgo: 10 },
      { dir: 'outbound', body: 'Completely understand — I\'ve escalated this as urgent. Your order shipped yesterday and the tracking link is being updated. I\'ll DM it to you the moment I have it 🤍', hoursAgo: 9 },
    ]
  },
  {
    name: 'Ananya Singh',
    thread: 'label_ananya_singh',
    status: 'Booked',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I ordered the mirror work kurta set in M but it\'s a bit loose. Can I exchange for S?', hoursAgo: 120 },
      { dir: 'outbound', body: 'Hi Ananya! So sorry to hear that 💛 Yes we do exchanges within 7 days of delivery — item must be unworn with original tags. Can you share your order number?', hoursAgo: 119 },
      { dir: 'inbound',  body: 'Order #2891. Received 4 days ago so I\'m within the window!', hoursAgo: 118 },
      { dir: 'outbound', body: 'Perfect, you\'re within the window 😊 I\'ve raised the exchange request. Courier the kurta to our warehouse (DMing address now) and we\'ll ship the S within 2 days of receiving it!', hoursAgo: 117 },
      { dir: 'inbound',  body: 'Sent it back! Thank you for making this so easy 🌸', hoursAgo: 100 },
      { dir: 'outbound', body: 'Received your return 🤍 The S will be dispatched by tomorrow. You\'ll get a tracking link shortly!', hoursAgo: 96 },
    ]
  },
  {
    name: 'Sneha Rao',
    thread: 'label_sneha_rao',
    status: 'Follow-up Due',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I think I received the wrong colour. I ordered ivory but got white?', hoursAgo: 60 },
      { dir: 'outbound', body: 'Hey Sneha! I\'m so sorry about that 😟 Can you share your order number and a quick photo of what you received? I\'ll sort this out immediately!', hoursAgo: 59 },
      { dir: 'inbound',  body: 'Order #3104. Sending a photo now.', hoursAgo: 58 },
      { dir: 'outbound', body: 'Got it! That\'s definitely the white, not ivory — our mistake entirely. I\'m arranging a replacement right now. We\'ll send the correct piece and organise return pickup at no cost to you 🤍', hoursAgo: 57 },
    ]
  },
  // ── RESTOCK & COLLECTION DROPS ──
  {
    name: 'Divya Iyer',
    thread: 'label_divya_iyer',
    status: 'Follow-up Due',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hey! I missed the rust mirror work kurta — it\'s sold out on the website 😭 Any chance of a restock?', hoursAgo: 36 },
      { dir: 'outbound', body: 'Divya, we feel you — it sold out in hours! 🪬 We\'re restocking next week. Want me to add you to the priority waitlist? We\'ll DM you the moment it\'s live — before it goes on the website!', hoursAgo: 35 },
      { dir: 'inbound',  body: 'Yes please!! Also adding me to all future restock alerts if possible 🙏', hoursAgo: 34 },
      { dir: 'outbound', body: 'Done! You\'re on the list 🌸 We\'ll ping you first. Also sign up for restock alerts on the website product page — that way you get an email the second it\'s back!', hoursAgo: 33 },
    ]
  },
  {
    name: 'Kavya Nair',
    thread: 'label_kavya_nair',
    status: 'Replied',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hii!! When is the Monsoon Edit dropping? I saw hints on your stories and I\'m already excited 🌧️', hoursAgo: 6 },
      { dir: 'outbound', body: 'Hiii Kavya!! 🤍 The Monsoon Edit drops this Friday at 8pm IST — coord sets, sarees, and some really special new pieces. Sign up for early access via the waitlist link in our bio!', hoursAgo: 5 },
      { dir: 'inbound',  body: 'Just signed up!! What price range to expect?', hoursAgo: 4 },
      { dir: 'outbound', body: 'The Monsoon Edit goes from ₹3,200 for kurta sets to ₹15,000 for statement sarees 🌧️ Something for every budget. Friday 8pm — set a reminder!', hoursAgo: 3 },
    ]
  },
  // ── COLLABS ──
  {
    name: 'Zara Creates',
    thread: 'label_zara_influencer',
    status: 'New',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi The Label! I\'m a fashion content creator with 85k followers — I do reels and GRWM content. Would love to collab 🤍', hoursAgo: 6 },
      { dir: 'outbound', body: 'Hi! Thank you so much for reaching out 🌟 We love your content! Please send your media kit and collab brief to collabs@thelabel.in — our team reviews every Monday and will come back with a proposal!', hoursAgo: 5 },
      { dir: 'inbound',  body: 'Will do! Is it paid or gifting?', hoursAgo: 4 },
      { dir: 'outbound', body: 'Both, depending on reach and content plan 😊 Email us the details and we\'ll come back with what works best!', hoursAgo: 3 },
    ]
  },
  {
    name: 'Fatima Sheikh',
    thread: 'label_fatima_collab',
    status: 'New',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I\'m a fashion blogger with around 3k followers. I\'d love to do a gifting collab with The Label! 🌸', hoursAgo: 2 },
      { dir: 'outbound', body: 'Hi Fatima! Thank you for reaching out 🤍 We love supporting up-and-coming creators! Please send your profile and content plan to collabs@thelabel.in and our team will get back to you. We review requests every Monday!', hoursAgo: 1 },
    ]
  },
];

const BUSINESS_PROFILE = {
  business_name: 'The Label',
  business_type: 'clothing brand / ethnic Indian fashion label',
  services: `Coord Sets: ₹4,500 (available in XS, S, M, L, XL — colours: dusty pink, sage green, ivory, white, black)
Kurta Sets: ₹3,200 (available in XS, S, M, L, XL)
Sarees: ₹8,000–₹15,000 (tissue silk from ₹8,000, handloom weaves from ₹10,000, organza drapes from ₹12,000)
Western Co-ords: ₹5,500 (available in XS, S, M, L, XL)
Custom / Plus-Size Orders: Starting ₹6,000 (takes 10–14 days, requires bust/waist/hip measurements)

All products are available to order on our website (link in bio). We do NOT accept orders via DM.`,
  faqs: `Q: What sizes do you stock?
A: XS to XL as standard on the website. Plus sizes (XXL and above) are available as custom orders from ₹6,000.

Q: How long does shipping take?
A: Domestic India: 3–5 business days. International: 10–14 business days. International shipping is ₹1,200 for orders under ₹10,000 and free for orders above ₹10,000.

Q: What is your return and exchange policy?
A: We accept exchanges within 7 days of delivery. The item must be unworn and have the original tags. Return shipping is at the customer's cost; we cover reshipping the new size.

Q: Do you offer discounts or coupon codes?
A: We don't offer individual DM discounts. Watch our stories for sale drops and seasonal offers. Coupon codes are announced on our Instagram stories.

Q: How do I place a custom or plus-size order?
A: DM us your measurements (bust, waist, hips) and which piece you want. Custom orders start at ₹6,000 and take 10–14 days.

Q: How can I collaborate with The Label?
A: Send your media kit and collaboration brief to collabs@thelabel.in. Our team reviews every Monday.

Q: Do you accept Cash on Delivery (COD)?
A: No, we are prepaid only — UPI, card, or net banking via our website.

Q: My order hasn't arrived yet. What do I do?
A: Please share your order number and we'll check the status with our dispatch team right away!

Q: Does the fabric shrink after washing?
A: Our chanderi and cotton pieces should be hand-washed in cold water. Silk sarees are dry-clean only. Care instructions are included with every order.`,
  tone: `Aspirational, warm, and chic — like a real fashion brand DM voice. Use light emojis (🤍🌸✨🌿). Keep messages short (2–3 sentences max). Mirror the customer's energy. End with a question or next step. Never use corporate language.`,
  escalation_rules: `- Custom orders above ₹15,000: check with the design team before confirming timeline
- Bulk or wholesale inquiries: escalate to the owner directly
- Influencer collabs with under 10k followers: politely redirect to email only
- Complaints about wrong item received or damaged goods: escalate immediately, apologise and offer a replacement
- Website technical issues (payment failures, coupon not working): ask for order ID and escalate to support team`,
};

async function seedClothingDemo() {
  console.log('🌱 Setting up The Label demo account...\n');

  // Create or update the demo user
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { rows: userRows } = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, 'The Label')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
     RETURNING id`,
    [DEMO_EMAIL, hash]
  );
  const USER_ID = userRows[0].id;
  console.log(`👤 User: ${DEMO_EMAIL} (id=${USER_ID})\n`);

  // Clear existing data for this user (safe re-run)
  await pool.query(`DELETE FROM knowledge_suggestions WHERE user_id = $1`, [USER_ID]);
  await pool.query(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = $1)`, [USER_ID]);
  await pool.query(`DELETE FROM leads WHERE user_id = $1`, [USER_ID]);
  await pool.query(`DELETE FROM conversations WHERE user_id = $1`, [USER_ID]);

  for (const conv of DEMO_CONVERSATIONS) {
    const lastMsg = conv.messages[conv.messages.length - 1];

    const { rows: convRows } = await pool.query(
      `INSERT INTO conversations (user_id, ig_thread_id, participant_name, participant_ig_id, last_message_at)
       VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval)
       ON CONFLICT (user_id, ig_thread_id) DO UPDATE SET
         participant_name = EXCLUDED.participant_name,
         last_message_at  = EXCLUDED.last_message_at
       RETURNING id`,
      [USER_ID, conv.thread, conv.name, `label_${conv.thread}`, lastMsg.hoursAgo]
    );
    const convId = convRows[0].id;

    for (let i = 0; i < conv.messages.length; i++) {
      const m = conv.messages[i];
      await pool.query(
        `INSERT INTO messages (conversation_id, ig_message_id, direction, body, sent_at)
         VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval)
         ON CONFLICT (ig_message_id) DO NOTHING`,
        [convId, `demo_msg_${conv.thread}_${i}`, m.dir, m.body, m.hoursAgo]
      );
    }

    await pool.query(
      `INSERT INTO leads (conversation_id, user_id, status, lead_temperature)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (conversation_id) DO UPDATE SET
         status           = EXCLUDED.status,
         lead_temperature = EXCLUDED.lead_temperature,
         updated_at       = NOW()`,
      [convId, USER_ID, conv.status, conv.temperature]
    );

    console.log(`  ✅ ${conv.name} — ${conv.status} / ${conv.temperature}`);
  }

  // Upsert business profile
  await pool.query(
    `INSERT INTO business_profiles (user_id, business_name, business_type, services, tone, faqs, escalation_rules, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       business_name    = EXCLUDED.business_name,
       business_type    = EXCLUDED.business_type,
       services         = EXCLUDED.services,
       tone             = EXCLUDED.tone,
       faqs             = EXCLUDED.faqs,
       escalation_rules = EXCLUDED.escalation_rules,
       updated_at       = NOW()`,
    [USER_ID, BUSINESS_PROFILE.business_name, BUSINESS_PROFILE.business_type,
     BUSINESS_PROFILE.services, BUSINESS_PROFILE.tone, BUSINESS_PROFILE.faqs,
     BUSINESS_PROFILE.escalation_rules]
  );
  console.log('\n🤍 Business profile updated → The Label (ethnic Indian fashion)');
  console.log('✨ Clothing brand demo seeded successfully!\n');

  await pool.end();
}

seedClothingDemo().catch(err => { console.error(err); process.exit(1); });
