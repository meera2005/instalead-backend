/**
 * Seeds demo conversations for The Label (ethnic clothing brand) — user 3
 * Run: node scripts/seed_clothing_demo.js
 */
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const USER_ID = 3;

const DEMO_CONVERSATIONS = [
  {
    name: 'Riya Kapoor',
    thread: 'label_riya_kapoor',
    status: 'Booked',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hi! I saw the sage green coord set on your stories and I\'m obsessed 😍 Is it available in size S?', hoursAgo: 72 },
      { dir: 'outbound', body: 'Hey Riya! Yes, the sage green coord set is available in S 🌿 It\'s ₹4,500. The fabric is soft chanderi so it drapes really beautifully. Want me to share the size chart?', hoursAgo: 71 },
      { dir: 'inbound',  body: 'Yes please! Also does it come in other colours?', hoursAgo: 70 },
      { dir: 'outbound', body: 'It\'s available in sage green, dusty pink, and ivory 🤍 All three are in S right now. You can order directly from our website — the link is in bio!', hoursAgo: 69 },
      { dir: 'inbound',  body: 'Just ordered the ivory S from the website! So excited 🛍️', hoursAgo: 67 },
      { dir: 'outbound', body: 'Amazing!! You\'re going to love it 🤍 We\'ll ship within 2 business days. Drop us a tag when it arrives!', hoursAgo: 66 },
    ]
  },
  {
    name: 'Ananya Mehta',
    thread: 'label_ananya_mehta',
    status: 'Booked',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hello! I wanted to order the mirror work kurta set I saw on your page. It looks stunning!', hoursAgo: 120 },
      { dir: 'outbound', body: 'Hi Ananya! 🌟 Thank you so much! The mirror work kurta set is available in XS to XL at ₹3,200. Which size were you thinking?', hoursAgo: 119 },
      { dir: 'inbound',  body: 'I\'m usually a M. Does it run true to size?', hoursAgo: 118 },
      { dir: 'outbound', body: 'Our M fits a 36-38 inch bust comfortably — it\'s a relaxed fit so most people find it true to size 😊 Go ahead and order on the website, link in bio!', hoursAgo: 117 },
      { dir: 'inbound',  body: 'Ordered! ✅ Also is there a coupon code I can use?', hoursAgo: 116 },
      { dir: 'outbound', body: 'So happy! 🎉 We don\'t have an active coupon right now, but watch our stories — we drop codes for new collection launches! Your order will ship in 2 business days 🌸', hoursAgo: 115 },
    ]
  },
  {
    name: 'Priya Bhatia',
    thread: 'label_priya_bhatia',
    status: 'Booked',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hi! I need a saree for my cousin\'s wedding next week. Do you have something in pastels?', hoursAgo: 96 },
      { dir: 'outbound', body: 'Hello Priya! 🌸 Pastels for a wedding is such a gorgeous choice! We have a blush organza saree with gold threadwork at ₹12,000 and a mint tissue silk at ₹9,500. Both are available for immediate dispatch!', hoursAgo: 95 },
      { dir: 'inbound',  body: 'The blush organza sounds perfect. Can I see more photos?', hoursAgo: 94 },
      { dir: 'outbound', body: 'Sending you photos right now! Also posting a reel of the drape today evening so you can see how it falls ✨', hoursAgo: 93 },
      { dir: 'inbound',  body: 'I just ordered it on your website! The drape looks so dreamy.', hoursAgo: 91 },
      { dir: 'outbound', body: 'You\'re going to look absolutely beautiful 🤍 Since you need it next week, we\'ll prioritise dispatch. Tracking link coming your way!', hoursAgo: 90 },
    ]
  },
  {
    name: 'Nisha Verma',
    thread: 'label_nisha_verma',
    status: 'Replied',
    temperature: 'Hot',
    messages: [
      { dir: 'inbound',  body: 'Hi! Do you ship to Dubai? I\'ve been wanting your coord sets for so long 😍', hoursAgo: 48 },
      { dir: 'outbound', body: 'Hey Nisha! Yes we ship internationally 🌍 Shipping to Dubai takes 10-14 business days. Orders above ₹10,000 get free international shipping — below that it\'s ₹1,200 flat!', hoursAgo: 47 },
      { dir: 'inbound',  body: 'Oh amazing! What about customs duties?', hoursAgo: 46 },
      { dir: 'outbound', body: 'Customs duties are at the buyer\'s end — for UAE it\'s usually minimal. You can order directly from our website, we ship internationally to 15+ countries 😊', hoursAgo: 45 },
      { dir: 'inbound',  body: 'Okay! I want the white western co-ord set. Let me order it today.', hoursAgo: 44 },
      { dir: 'outbound', body: 'The white co-ord is ₹5,500 — such a classic pick! 🤍 Go ahead on the website, link in bio. Let us know if you need help at checkout!', hoursAgo: 43 },
    ]
  },
  {
    name: 'Divya Iyer',
    thread: 'label_divya_iyer',
    status: 'Follow-up Due',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hey! When is the black embroidered blazer coming back in stock? I missed it 😭', hoursAgo: 36 },
      { dir: 'outbound', body: 'Divya, we feel you — that blazer sold out in 2 hours! 🖤 We\'re restocking by Thursday this week. Want me to add you to the waitlist? We\'ll DM you the moment it\'s live!', hoursAgo: 35 },
      { dir: 'inbound',  body: 'Yes please!! What size should I get if I\'m usually a M in western wear?', hoursAgo: 34 },
      { dir: 'outbound', body: 'For the blazer, M would be perfect for a fitted look or L if you love an oversized style 🖤 You\'re on the list for both — we\'ll ping you Thursday morning!', hoursAgo: 33 },
    ]
  },
  {
    name: 'Sneha Rao',
    thread: 'label_sneha_rao',
    status: 'Follow-up Due',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I received my order but the kurta set size is a little big. Can I exchange for a smaller size?', hoursAgo: 60 },
      { dir: 'outbound', body: 'Hey Sneha! So sorry the size didn\'t work out 💛 Yes we do exchanges within 7 days of delivery — item must be unworn and with original tags. Can you share your order number?', hoursAgo: 59 },
      { dir: 'inbound',  body: 'Order #2047. I received it 3 days ago so I\'m within the window!', hoursAgo: 58 },
      { dir: 'outbound', body: 'Perfect, you\'re well within the window 😊 I\'ll raise the exchange request now. Courier the kurta to our warehouse and we\'ll ship the smaller size within 2 days of receiving it. I\'ll DM you the warehouse address!', hoursAgo: 57 },
      { dir: 'inbound',  body: 'Thank you! Is return shipping on me?', hoursAgo: 56 },
      { dir: 'outbound', body: 'Return shipping is at your end — we cover the reshipping of the new size 🤍 I\'m DMing the address right now. So sorry again for the hassle!', hoursAgo: 55 },
    ]
  },
  {
    name: 'Meena Pillai',
    thread: 'label_meena_pillai',
    status: 'Lost',
    temperature: 'Cold',
    messages: [
      { dir: 'inbound',  body: 'Hi! Love your coord sets. Can you do 30% off? Budget is a bit tight right now.', hoursAgo: 144 },
      { dir: 'outbound', body: 'Hi Meena! 🤍 Thank you for loving our pieces! We don\'t do individual discounts — our pricing reflects hand-crafted fabrics and sustainable production. We do run sale drops on stories though!', hoursAgo: 143 },
      { dir: 'inbound',  body: 'Even 20%? Other brands give discounts on DMs.', hoursAgo: 142 },
      { dir: 'outbound', body: 'I totally get it! We can\'t match individual discount requests but we have a big sale coming up next month 🌸 Would love to have you shop then — I\'ll tag you when it\'s live!', hoursAgo: 141 },
      { dir: 'inbound',  body: 'I\'ll think about it. Thanks anyway.', hoursAgo: 140 },
    ]
  },
  {
    name: 'Rohan for Wife',
    thread: 'label_rohan_gifting',
    status: 'Lost',
    temperature: 'Cold',
    messages: [
      { dir: 'inbound',  body: 'Hi! Want to gift my wife something for our anniversary. She loves your brand. What do you suggest under 5k?', hoursAgo: 200 },
      { dir: 'outbound', body: 'How sweet! 🎁 Under ₹5,000 we have our coord sets at ₹4,500 and kurta sets at ₹3,200 — both bestsellers. What\'s her size?', hoursAgo: 199 },
      { dir: 'inbound',  body: 'I think she\'s an S or M. She\'s quite petite.', hoursAgo: 198 },
      { dir: 'outbound', body: 'For petite builds, S usually works beautifully with our sizing 🌸 I\'d suggest the dusty pink coord set in S — our most loved piece right now. You can order on the website, link in bio!', hoursAgo: 197 },
      { dir: 'inbound',  body: 'I\'ll think about it and come back.', hoursAgo: 196 },
      { dir: 'outbound', body: 'Of course! The dusty pink S is popular so it might sell out — feel free to DM if you need help choosing 🤍', hoursAgo: 195 },
    ]
  },
  {
    name: 'Kavya Nair',
    thread: 'label_kavya_nair',
    status: 'Replied',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi! I love your pieces but I wear a XXL and don\'t see it on your website. Do you do custom orders?', hoursAgo: 24 },
      { dir: 'outbound', body: 'Hey Kavya! 🌸 We stock XS to XL on the website, but yes we do custom orders for plus sizes! Starting at ₹6,000, takes 10-14 days. Can you share your measurements — bust, waist, hips?', hoursAgo: 23 },
      { dir: 'inbound',  body: 'That\'s amazing! My measurements are 46-38-48. Which piece would look best?', hoursAgo: 22 },
      { dir: 'outbound', body: 'With your measurements the wide-leg coord set would look absolutely gorgeous 🤍 I\'ll connect you with our tailor team to discuss fabric and detailing. Can I get your WhatsApp number?', hoursAgo: 21 },
    ]
  },
  {
    name: 'Zara Creates',
    thread: 'label_zara_influencer',
    status: 'New',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hi The Label! I\'m a fashion content creator with 85k followers and I\'d love to collab 🤍 I do reels and GRWM content. Can we work something out?', hoursAgo: 6 },
      { dir: 'outbound', body: 'Hi! Thank you so much for reaching out 🌟 We love your content! Please send your media kit and collab brief to collabs@thelabel.in — our team reviews every Monday and will come back with the right proposal!', hoursAgo: 5 },
      { dir: 'inbound',  body: 'Will do! Just checking — is it paid or gifting?', hoursAgo: 4 },
      { dir: 'outbound', body: 'Both, depending on reach and content plan 😊 Send the details over email and we\'ll come back with what works best for you!', hoursAgo: 3 },
    ]
  },
  {
    name: 'Fatima Sheikh',
    thread: 'label_fatima_sheikh',
    status: 'New',
    temperature: 'Warm',
    messages: [
      { dir: 'inbound',  body: 'Hiii!! When is the Monsoon Edit dropping?? I saw the hints on your stories and I\'m already obsessed 😭🌧️', hoursAgo: 3 },
      { dir: 'outbound', body: 'Hiii Fatima!! 🤍 We\'re dropping the Monsoon Edit this Friday at 8pm IST — coord sets, sarees, and some very special pieces. Sign up for the waitlist via the link in our bio for first access!', hoursAgo: 2 },
      { dir: 'inbound',  body: 'I just signed up!! What price range should I expect?', hoursAgo: 1 },
      { dir: 'outbound', body: 'The Monsoon Edit goes from ₹3,200 for kurta sets to ₹15,000 for statement sarees 🌧️ Something for every budget. Friday 8pm — set a reminder!', hoursAgo: 0 },
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
  console.log('🌱 Seeding clothing brand demo for user 3 (The Label)...\n');

  // Delete in FK-safe order
  await pool.query(`DELETE FROM knowledge_suggestions WHERE user_id = $1`, [USER_ID]);
  await pool.query(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = $1)`, [USER_ID]);
  await pool.query(`DELETE FROM leads WHERE user_id = $1`, [USER_ID]);
  await pool.query(`DELETE FROM conversations WHERE user_id = $1`, [USER_ID]);
  console.log('🗑️  Cleared existing demo data\n');

  for (const conv of DEMO_CONVERSATIONS) {
    const lastMsg = conv.messages[conv.messages.length - 1];

    const { rows: convRows } = await pool.query(
      `INSERT INTO conversations (user_id, ig_thread_id, participant_name, participant_ig_id, last_message_at)
       VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval)
       ON CONFLICT (user_id, ig_thread_id) DO UPDATE SET
         participant_name = EXCLUDED.participant_name,
         last_message_at  = EXCLUDED.last_message_at
       RETURNING id`,
      [USER_ID, conv.thread, conv.name, `demo_${conv.thread}`, lastMsg.hoursAgo]
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
