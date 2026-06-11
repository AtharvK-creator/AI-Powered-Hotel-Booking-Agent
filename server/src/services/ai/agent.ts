import OpenAI from 'openai';
import { env } from '../../config/env';
import { TOOL_DEFINITIONS, executeTool } from './tools';
import { aiRouterService } from './aiRouterService';
import { journeyAnalyticsService } from './journeyAnalyticsService';
import { memoryService } from './memoryService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are an intelligent hotel booking assistant for "Hotel Booking AI" — a premium travel platform. You help users find hotels, make bookings, and manage their reservations.

You have access to real booking tools. Always use these tools to fetch live data rather than guessing or fabricating results.

Guidelines:
- Be friendly, concise, and professional
- When searching hotels, always call searchHotels() first before making recommendations
- Before creating a booking, confirm all details with the user
- Note: The tools createBooking, modifyBooking, and cancelBooking automatically send confirmation emails upon success. Do NOT call sendConfirmationEmail after using them. Only call sendConfirmationEmail if the user explicitly asks you to resend an email for a booking.
- If the user asks about their bookings, use getUserBookings()
- Format prices in USD with 2 decimal places
- Format dates as YYYY-MM-DD when calling tools
- If you don't have enough info (like check-in date), ask for it before proceeding`;

let geminiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!geminiClient) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }
    geminiClient = new OpenAI({
      apiKey: env.geminiApiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }
  return geminiClient;
}

// ─── Caching Layer ───────────────────────────────────────────────────────────

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry>();
const detailsCache = new Map<string, CacheEntry>();

function getCachedSearch(city?: string): any | null {
  const key = city ? city.toLowerCase().trim() : 'all';
  const entry = searchCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    console.log(`💾 [Cache Hit] Found search results for key: ${key}`);
    return entry.data;
  }
  return null;
}

function setCachedSearch(city: string | undefined, data: any): void {
  const key = city ? city.toLowerCase().trim() : 'all';
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  searchCache.set(key, { data, expiresAt });
  console.log(`💾 [Cache Set] Search results cached for key: ${key}`);
}

function getCachedDetails(hotelId: string): any | null {
  const key = hotelId.toLowerCase().trim();
  const entry = detailsCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    console.log(`💾 [Cache Hit] Found details for key: ${key}`);
    return entry.data;
  }
  return null;
}

function setCachedDetails(hotelId: string, data: any): void {
  const key = hotelId.toLowerCase().trim();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  detailsCache.set(key, { data, expiresAt });
  console.log(`💾 [Cache Set] Details cached for key: ${key}`);
}

function formatDetailsResponse(details: any): string {
  let reply = `### 🏨 ${details.name} (ID: ${details.id})\n`;
  reply += `📍 **Address:** ${details.address}, ${details.city}, ${details.country}\n`;
  reply += `⭐ **Rating:** ${details.rating} / 5\n`;
  reply += `💵 **Base Price:** $${details.price_per_night} per night\n\n`;
  reply += `✨ **Amenities:** ${details.amenities.join(', ')}\n\n`;
  reply += `🛏️ **Room Options:**\n`;
  details.room_types.forEach((r: any) => {
    reply += `- **${r.type}**: $${r.price}/night (Capacity: ${r.capacity} guests) - *${r.description}*\n`;
  });
  return reply;
}

function formatSearchResponse(res: any, city?: string): string {
  let reply = `### 🔍 Hotel Search Results (Found ${res.hotels.length} hotel(s) in ${city || 'our destinations'}):\n\n`;
  res.hotels.forEach((h: any) => {
    reply += `🏨 **${h.name}** (ID: \`${h.id}\`)\n`;
    reply += `- **Location:** ${h.city}, ${h.country}\n`;
    reply += `- **Rating:** ⭐ ${h.rating} / 5\n`;
    reply += `- **Price:** from $${h.price_per_night} per night\n`;
    reply += `- **Amenities:** ${h.amenities.join(', ')}\n\n`;
  });
  return reply;
}

// ─── Direct Fallback Tool Execution & Parsing (Graceful Degradation) ─────────

// ─── Direct Fallback Tool Execution & Parsing (Graceful Degradation) ─────────

function parseBookingParams(message: string) {
  const msgLower = message.toLowerCase();
  
  // Extract hotelId (e.g., hotel-001)
  const hotelIdMatch = message.match(/hotel-\d+/i);
  const hotelId = hotelIdMatch ? hotelIdMatch[0].toLowerCase() : undefined;

  // Extract bookingId (e.g., BK-20260603-XXXX)
  const bookingIdMatch = message.match(/BK-\d{8}-[A-Z0-9]+/i);
  const bookingId = bookingIdMatch ? bookingIdMatch[0].toUpperCase() : undefined;

  // Extract dates (YYYY-MM-DD)
  const dateMatches = message.match(/\d{4}-\d{2}-\d{2}/g);
  const checkIn = dateMatches && dateMatches[0] ? dateMatches[0] : undefined;
  const checkOut = dateMatches && dateMatches[1] ? dateMatches[1] : undefined;

  // Extract guests
  const guestMatch = message.match(/(\d+)\s*(?:guest|people|person|pax)/i) || message.match(/(?:for)\s*(\d+)/i);
  const guests = guestMatch ? parseInt(guestMatch[1], 10) : undefined;

  // Extract room type
  const roomTypes = [
    'Luxury Room', 'Taj Club Suite', 'Grand Presidential Suite', 'Grande Room',
    'Royal Club Suite', 'Palace Room', 'Historical Suite', 'Luxury Lake View Room',
    'Royal Suite', 'Premier Room', 'Semi Private Pool Room', 'Villa Garden View',
    'Indulgence Villa Private Pool', 'Premier Taj View', 'Deluxe Taj View Suite',
    'Deluxe Garden Room', 'Premier Valley View', 'Lord Kitchener Suite',
    'Deluxe Room', 'Executive Suite', 'Pavilion Room', 'Meandering Pool Villa',
    'Luxury Houseboat', 'Hilltop View', 'Carriage Arrival', 'Premier Pine Room',
    'Khyber Suite', 'Executive Club', 'Eva Room', 'Chola Suite', 'Superior Room',
    'Superior Sea View', 'Hermitage Villa Private Lawn', 'Safari Hut', 'Pool Hut',
    'Standard Sea Face', 'Duplex Suite', 'Estate Cottage', 'Heritage Lodge Suite',
    'Suite'
  ];
  let roomType: string | undefined = undefined;
  for (const rt of roomTypes) {
    if (msgLower.includes(rt.toLowerCase())) {
      roomType = rt;
      break;
    }
  }

  // Extract budget limit (maxPrice)
  let maxPrice: number | undefined = undefined;
  const budgetRegex = /(?:budget|under|below|less than|max|maximum|price|limit|up to|capped at|around)\s*(?:is|of|at)?\s*(?:rs\.?|inr|usd|\$)?\s*(\d+(?:\.\d+)?)\s*(k|thousand)?/i;
  const budgetRegex2 = /(\d+(?:\.\d+)?)\s*(k|thousand)?\s*(?:budget|price|limit|max|under)/i;
  
  const match = msgLower.match(budgetRegex) || msgLower.match(budgetRegex2);
  if (match) {
    let rawVal = parseFloat(match[1]);
    const isK = match[2] && (match[2].toLowerCase().startsWith('k') || match[2].toLowerCase().startsWith('t'));
    if (isK) rawVal *= 1000;
    
    // If value is in INR (normally > 1000 or specified as Rs/INR), convert to USD (e.g. rawVal / 83)
    const hasInrSign = msgLower.includes('rs') || msgLower.includes('inr') || msgLower.includes('rupee');
    if (rawVal > 1000 || hasInrSign) {
      maxPrice = Math.round(rawVal / 83);
    } else {
      maxPrice = Math.round(rawVal);
    }
    console.log(`🔀 [Fallback Mode] Parsed budget limit: ${maxPrice} USD (raw input: ${rawVal})`);
  }

  return { hotelId, bookingId, checkIn, checkOut, guests, roomType, maxPrice };
}

export async function runFallbackFlow(message: string, userId: string): Promise<string | null> {
  const msgLower = message.toLowerCase();
  const params = parseBookingParams(message);

  // --- 1. Fallback: Booking Cancellation ---
  const isCancellation = msgLower.includes('cancel') || msgLower.includes('delete') || msgLower.includes('remove');
  if (isCancellation) {
    if (params.bookingId) {
      console.log(`🔀 [Fallback Mode] Executing cancelBooking directly for: ${params.bookingId}`);
      try {
        const res: any = await executeTool('cancelBooking', { bookingId: params.bookingId }, userId);
        if (res.error) return `I attempted to cancel booking **${params.bookingId}** directly, but it failed: ${res.error}`;
        return `### ❌ Booking Cancelled Successfully!\nYour booking **${params.bookingId}** has been cancelled. A confirmation email has been sent.`;
      } catch (err: any) {
        console.error('❌ [Fallback Mode] cancelBooking failed:', err);
        return `Failed to cancel booking: ${err.message || err}`;
      }
    } else {
      // Look up and cancel the latest active booking
      try {
        const res: any = await executeTool('getUserBookings', {}, userId);
        if (res.bookings && res.bookings.length > 0) {
          const activeBookings = res.bookings.filter((b: any) => b.status !== 'cancelled');
          if (activeBookings.length > 0) {
            const latest = activeBookings[activeBookings.length - 1];
            console.log(`🔀 [Fallback Mode] Cancelling user's latest booking ${latest.id} directly`);
            const cancelRes: any = await executeTool('cancelBooking', { bookingId: latest.id }, userId);
            if (cancelRes.error) return `I attempted to cancel booking **${latest.id}** directly, but it failed: ${cancelRes.error}`;
            return `### ❌ Booking Cancelled Successfully!\nYour reservation **${latest.id}** at **${latest.hotel_name || 'the hotel'}** has been cancelled. A confirmation email has been sent.`;
          }
        }
      } catch (dbErr) {
        console.error('Failed to lookup bookings for cancellation fallback:', dbErr);
      }
      return `⚠️ I attempted to cancel your booking directly due to AI rate limits, but the **Booking ID** is missing. Please provide the Booking ID (e.g. "Cancel booking BK-20260603-XXXX").`;
    }
  }

  // --- 2. Fallback: Booking Modification ---
  const isModification = msgLower.includes('modify') || msgLower.includes('change') || msgLower.includes('update') || msgLower.includes('alter') || msgLower.includes('reschedule');
  if (isModification) {
    if (params.bookingId) {
      console.log(`🔀 [Fallback Mode] Executing modifyBooking directly for: ${params.bookingId}`);
      try {
        const res: any = await executeTool('modifyBooking', {
          bookingId: params.bookingId,
          roomType: params.roomType,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests
        }, userId);
        if (res.error) return `I attempted to modify booking **${params.bookingId}** directly, but it failed: ${res.error}`;
        const b = res.booking;
        return `### ✏️ Booking Modified Successfully!\nYour booking **${b.id}** has been updated:\n` +
          `- **Room Type:** ${b.room_type}\n` +
          `- **Dates:** ${b.check_in} to ${b.check_out}\n` +
          `- **Guests:** ${b.guests} guest(s)\n` +
          `- **Total Price:** $${b.total_price.toFixed(2)}\n\n` +
          `An email notification has been sent.`;
      } catch (err: any) {
        console.error('❌ [Fallback Mode] modifyBooking failed:', err);
        return `Failed to modify booking: ${err.message || err}`;
      }
    } else {
      // Look up and modify the latest active booking
      try {
        const res: any = await executeTool('getUserBookings', {}, userId);
        if (res.bookings && res.bookings.length > 0) {
          const activeBookings = res.bookings.filter((b: any) => b.status !== 'cancelled');
          if (activeBookings.length > 0) {
            const latest = activeBookings[activeBookings.length - 1];
            console.log(`🔀 [Fallback Mode] Modifying user's latest booking ${latest.id} directly`);
            const modifyRes: any = await executeTool('modifyBooking', {
              bookingId: latest.id,
              roomType: params.roomType,
              checkIn: params.checkIn,
              checkOut: params.checkOut,
              guests: params.guests
            }, userId);
            if (modifyRes.error) return `I attempted to modify booking **${latest.id}** directly, but it failed: ${modifyRes.error}`;
            const b = modifyRes.booking;
            return `### ✏️ Booking Modified Successfully!\nYour booking **${b.id}** has been updated:\n` +
              `- **Room Type:** ${b.room_type}\n` +
              `- **Dates:** ${b.check_in} to ${b.check_out}\n` +
              `- **Guests:** ${b.guests} guest(s)\n` +
              `- **Total Price:** $${b.total_price.toFixed(2)}\n\n` +
              `An email notification has been sent.`;
          }
        }
      } catch (dbErr) {
        console.error('Failed to lookup bookings for modification fallback:', dbErr);
      }
      return `⚠️ I attempted to modify your booking directly due to AI rate limits, but the **Booking ID** is missing. Please provide the Booking ID (e.g. BK-20260603-XXXX) and the details you wish to change.`;
    }
  }

  // --- 3. Fallback: Create Booking ---
  const isCreation = msgLower.includes('book') || msgLower.includes('reserve') || msgLower.includes('make a booking') || msgLower.includes('room for');
  if (isCreation) {
    if (params.hotelId && params.roomType && params.checkIn && params.checkOut && params.guests !== undefined) {
      console.log(`🔀 [Fallback Mode] Executing createBooking directly for hotelId: ${params.hotelId}`);
      try {
        const res: any = await executeTool('createBooking', {
          hotelId: params.hotelId,
          roomType: params.roomType,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests
        }, userId);
        if (res.error) return `I attempted to book room directly, but it failed: ${res.error}`;
        const b = res.booking;
        return `### 🏨 Booking Confirmed!\nYour booking has been successfully created:\n` +
          `- **Booking ID:** \`${b.id}\`\n` +
          `- **Room Type:** ${b.room_type}\n` +
          `- **Dates:** ${b.check_in} to ${b.check_out}\n` +
          `- **Guests:** ${b.guests} guest(s)\n` +
          `- **Total Price:** $${b.total_price.toFixed(2)}\n\n` +
          `An email confirmation has been sent.`;
      } catch (err: any) {
        console.error('❌ [Fallback Mode] createBooking failed:', err);
        return `Failed to create booking: ${err.message || err}`;
      }
    } else {
      return `⚠️ I attempted to book a room directly due to AI rate limits, but some details are missing. Please specify: **Hotel ID** (e.g. hotel-001), **Room Type** (e.g. Suite), **Check-in date** (YYYY-MM-DD), **Check-out date** (YYYY-MM-DD), and **Guests count** (e.g. 2 guests).\n` +
        `*Parsed details so far:* \n` +
        `- Hotel ID: ${params.hotelId || '*missing*'}\n` +
        `- Room Type: ${params.roomType || '*missing*'}\n` +
        `- Check-in: ${params.checkIn || '*missing*'}\n` +
        `- Check-out: ${params.checkOut || '*missing*'}\n` +
        `- Guests: ${params.guests !== undefined ? params.guests : '*missing*'}`;
    }
  }

  // --- 4. Fallback: Hotel Details ---
  const hotelIdMatch = message.match(/hotel-\d+/i);
  const isDetailsRequest = msgLower.includes('detail') || msgLower.includes('about') || msgLower.includes('info') || msgLower.includes('pricing') || hotelIdMatch;
  if (isDetailsRequest && params.hotelId) {
    const hotelId = params.hotelId;
    console.log(`🔀 [Fallback Mode] Executing getHotelDetails directly for hotelId: ${hotelId}`);
    try {
      const details: any = await executeTool('getHotelDetails', { hotelId }, userId);
      if (details.error) return `I found the hotel ID ${hotelId} but was unable to retrieve details: ${details.error}`;
      setCachedDetails(hotelId, details);
      return formatDetailsResponse(details);
    } catch (err: any) {
      console.error('❌ [Fallback Mode] getHotelDetails failed:', err);
      return null;
    }
  }

  // --- 5. Fallback: Booking History ---
  const isHistoryRequest = msgLower.includes('my bookings') || msgLower.includes('my reservations') || msgLower.includes('booking history') || msgLower.includes('show bookings') || msgLower.includes('list bookings') || msgLower.includes('my booking') || msgLower.includes('show my booking') || msgLower.includes('view bookings') || msgLower.includes('view my bookings');
  if (isHistoryRequest) {
    console.log(`🔀 [Fallback Mode] Executing getUserBookings directly`);
    try {
      const res: any = await executeTool('getUserBookings', {}, userId);
      if (!res.bookings || res.bookings.length === 0) {
        return "You do not have any active bookings at this time.";
      }
      let reply = `### 📅 Your Booking History (Found ${res.bookings.length} reservation(s)):\n\n`;
      res.bookings.forEach((b: any) => {
        reply += `💳 **Booking ID:** \`${b.id}\`\n`;
        reply += `- **Hotel:** ${b.hotel_name || 'Luxury Hotel'}\n`;
        reply += `- **Room Type:** ${b.room_type} (${b.guests} guest(s))\n`;
        reply += `- **Dates:** ${b.check_in} to ${b.check_out}\n`;
        reply += `- **Total Cost:** $${b.total_price.toFixed(2)}\n`;
        reply += `- **Status:** \`${b.status.toUpperCase()}\`\n\n`;
      });
      return reply;
    } catch (err: any) {
      console.error('❌ [Fallback Mode] getUserBookings failed:', err);
      return null;
    }
  }

  // --- 6. Fallback: Hotel Search (City and/or Budget) ---
  const isSearchRequest = msgLower.includes('search') || msgLower.includes('find') || msgLower.includes('hotels') || msgLower.includes('hotel in') || msgLower.includes('looking for') || msgLower.includes('budget') || msgLower.includes('under') || msgLower.includes('show');
  if (isSearchRequest) {
    const knownCities = [
      'mumbai', 'new delhi', 'jaipur', 'udaipur', 'goa', 'agra', 'shimla', 
      'bengaluru', 'kochi', 'varanasi', 'jodhpur', 'hyderabad', 'gulmarg', 
      'chennai', 'mysore', 'almora'
    ];
    let matchedCity: string | undefined = undefined;
    for (const city of knownCities) {
      if (msgLower.includes(city)) {
        matchedCity = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    // Handle aliases
    if (!matchedCity && msgLower.includes('delhi')) {
      matchedCity = 'New Delhi';
    }
    if (!matchedCity && msgLower.includes('bangalore')) {
      matchedCity = 'Bengaluru';
    }

    console.log(`🔀 [Fallback Mode] Executing searchHotels directly. City: ${matchedCity || 'All Cities'}, MaxPrice: ${params.maxPrice || 'Any'}`);
    try {
      const res: any = await executeTool('searchHotels', { city: matchedCity, maxPrice: params.maxPrice }, userId);
      if (!res.hotels || res.hotels.length === 0) {
        return `I searched for hotels in **${matchedCity || 'all destinations'}** ${params.maxPrice ? `under $${params.maxPrice}` : ''} but found no results.`;
      }
      setCachedSearch(matchedCity, res);
      return formatSearchResponse(res, matchedCity);
    } catch (err: any) {
      console.error('❌ [Fallback Mode] searchHotels failed:', err);
      return null;
    }
  }

  return null;
}

// ─── Main AI Agent Loop ──────────────────────────────────────────────────────

export async function runAgentLoop(
  messages: ChatMessage[],
  userId: string
): Promise<string> {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const msgLower = lastUserMsg.toLowerCase();

  // 1. Parse and store memory from the user's latest query
  try {
    await memoryService.parseAndStoreMemory(userId, lastUserMsg);
  } catch (err) {
    console.error('Failed to parse and store memory:', err);
  }

  // ─── Cache Lookup (Bypassing Gemini Entirely to Avoid Unnecessary Requests) ───
  
  // 1. Hotel Details Cache Check
  const hotelIdMatch = lastUserMsg.match(/hotel-\d+/i);
  const isDetailsRequest = msgLower.includes('detail') || msgLower.includes('about') || msgLower.includes('info') || msgLower.includes('pricing') || hotelIdMatch;
  if (isDetailsRequest && hotelIdMatch) {
    const hotelId = hotelIdMatch[0].toLowerCase();
    const cachedDetails = getCachedDetails(hotelId);
    if (cachedDetails) {
      console.log(`💾 [Cache Bypass] Bypassing Gemini. Returning cached details for: ${hotelId}`);
      const reply = formatDetailsResponse(cachedDetails);
      journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'cache_details', hotelId });
      return reply;
    }
  }

  // 2. Hotel Search Cache Check
  const isSearchRequest = msgLower.includes('search') || msgLower.includes('find') || msgLower.includes('hotels') || msgLower.includes('hotel in') || msgLower.includes('looking for');
  if (isSearchRequest) {
    const cities = ['new york', 'miami', 'london', 'tokyo', 'paris', 'dubai', 'santorini', 'zurich', 'singapore', 'male'];
    let matchedCity: string | undefined = undefined;
    for (const city of cities) {
      if (msgLower.includes(city)) {
        matchedCity = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    const cachedSearch = getCachedSearch(matchedCity);
    if (cachedSearch) {
      console.log(`💾 [Cache Bypass] Bypassing Gemini. Returning cached search results for: ${matchedCity || 'All Destinations'}`);
      const reply = formatSearchResponse(cachedSearch, matchedCity);
      journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'cache_search', city: matchedCity });
      return reply;
    }
  }

  // ─── Primary Loop ───

  let systemPrompt = SYSTEM_PROMPT;
  try {
    const memory = memoryService.getMemory(userId);
    if (Object.keys(memory).length > 0) {
      systemPrompt += `\n\nUser Profile Memory (Personalization Context):\n${JSON.stringify(memory, null, 2)}\nUse these preferences to personalize your suggestions and hotel recommendations when applicable, but do not explicitly mention the raw JSON memory database unless asked.`;
    }
  } catch (err) {
    console.error('Failed to inject memory context:', err);
  }

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let requestCount = 0;
  // ReAct loop: max 5 iterations to allow complete multi-step tool execution flows
  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    requestCount++;
    console.log(`[Gemini Loop] User Turn - Request #${requestCount} (Iteration: ${i + 1})`);

    let response;
    try {
      response = await aiRouterService.generateCompletion({
        messages: openaiMessages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        userId,
      });
    } catch (err: any) {
      console.warn('⚠️ AI routing failed. Invoking direct tool fallbacks. Error:', err.message || err);
      
      const fallbackResponse = await runFallbackFlow(lastUserMsg, userId);
      if (fallbackResponse) {
        console.log('✅ [Fallback Mode] Fulfilled request directly via database tools.');
        journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'fallback' });
        return fallbackResponse;
      }

      console.log('⚠️ [Fallback Mode] Prompt did not match fallbacks. Returning guided notice.');
      const reply = 'I am currently experiencing connection difficulties. However, I can help you directly! ' +
        'Please type a direct command, such as:\n' +
        '- **Search destinations**: "Search Jaipur", "Hotels in Goa under 10000"\n' +
        '- **View Hotel details**: "Details hotel-001"\n' +
        '- **View Booking history**: "List bookings"\n' +
        '- **Cancel a booking**: "Cancel BK-20260603-XXXX"';
      journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'fallback_error' });
      return reply;
    }

    const choice = response.choices[0];
    if (!choice) throw new Error('No response from Gemini');

    const assistantMsg = choice.message;

    // Parse text-based function calls if present in content
    let content = assistantMsg.content || '';
    const textToolCalls: any[] = [];
    const xmlRegex = /<function[(=]([^)>\s]+)\)?\s*>?\s*({[\s\S]*?})\s*<\/function>/gi;
    let xmlMatch;
    
    xmlRegex.lastIndex = 0;
    while ((xmlMatch = xmlRegex.exec(content)) !== null) {
      const name = xmlMatch[1].trim();
      const argsStr = xmlMatch[2].trim();
      const callId = `call_text_${Math.random().toString(36).substring(2, 9)}`;
      
      textToolCalls.push({
        id: callId,
        type: 'function',
        function: {
          name,
          arguments: argsStr,
        }
      });
    }

    if (textToolCalls.length > 0) {
      console.log(`🔀 [AI Router] Translated ${textToolCalls.length} text-based XML function calls into native tool_calls.`);
      if (!assistantMsg.tool_calls) {
        assistantMsg.tool_calls = [];
      }
      assistantMsg.tool_calls.push(...textToolCalls);
      // Remove the XML tags from content to prevent displaying raw code tags to the user
      assistantMsg.content = content.replace(xmlRegex, '').trim();
    }

    openaiMessages.push(assistantMsg);

    // If no tool calls — final text response
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      console.log(`📊 Gemini Loop completed in ${requestCount} call(s).`);
      const reply = assistantMsg.content || 'I apologize, I could not generate a response.';
      journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'agent', requestCount });
      return reply;
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      assistantMsg.tool_calls.map(async (tc: any) => {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse((tc as any).function.arguments);
        } catch {
          args = {};
        }

        console.log(`🔧 Tool call: ${(tc as any).function.name}`, args);
        let result: unknown;
        try {
          result = await executeTool((tc as any).function.name, args, userId);
          
          // Populate caches upon successful execution
          if ((tc as any).function.name === 'searchHotels') {
            setCachedSearch(args.city as string | undefined, result);
          } else if ((tc as any).function.name === 'getHotelDetails') {
            if (!(result as any).error) {
              setCachedDetails(args.hotelId as string, result);
            }
          }
        } catch (err: unknown) {
          result = { error: err instanceof Error ? err.message : 'Tool execution failed' };
        }

        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        };
      })
    );

    openaiMessages.push(...toolResults);
  }

  console.warn(`[Gemini Loop] Warning: Exceeded max loop iterations (5). Request count: ${requestCount}`);
  const reply = 'I have processed your request. Please let me know if you need any additional help!';
  journeyAnalyticsService.logEvent(userId, 'RECOMMENDATION_GENERATED', { source: 'agent_max_iter' });
  return reply;
}
