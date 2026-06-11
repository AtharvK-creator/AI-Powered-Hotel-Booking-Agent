import { db } from '../../config/database';
import { bookingModel } from '../../models/bookingModel';
import { hotelModel } from '../../models/hotelModel';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface UserMemoryData {
  travelStyle?: string;
  budgetPreference?: number;
  hotelTypePreference?: string;
  roomPreference?: string;
  interests?: string[];
  preferredDestinations?: string[];
  travelHistory?: string[];
}

class MemoryService {
  /**
   * Get user memory profile
   */
  public getMemory(userId: string): UserMemoryData {
    try {
      const row = db.prepare('SELECT memory_data FROM user_memories WHERE user_id = ?').get(userId) as { memory_data: string } | undefined;
      if (!row) {
        return {};
      }
      return JSON.parse(row.memory_data);
    } catch (err: any) {
      console.error('❌ Failed to get user memory:', err.message || err);
      return {};
    }
  }

  /**
   * Update user memory profile directly
   */
  public saveMemory(userId: string, data: UserMemoryData): void {
    const id = `mem-${uuidv4()}`;
    const dataStr = JSON.stringify(data);
    try {
      db.prepare(
        `INSERT INTO user_memories (id, user_id, memory_data, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
         ON CONFLICT(user_id) DO UPDATE SET memory_data = EXCLUDED.memory_data, updated_at = CURRENT_TIMESTAMP`
      ).run(id, userId, dataStr);
    } catch (err: any) {
      logger.error('Failed to save user memory:', err);
    }
  }

  /**
   * Auto-extract user preferences from messages and booking history
   */
  public async parseAndStoreMemory(userId: string, message: string): Promise<UserMemoryData> {
    const memory = this.getMemory(userId);
    const msgLower = message.toLowerCase();

    // 1. Extract Travel Style
    if (msgLower.includes('family') || msgLower.includes('children') || msgLower.includes('kids')) {
      memory.travelStyle = 'family';
    } else if (msgLower.includes('solo') || msgLower.includes('myself') || msgLower.includes('alone')) {
      memory.travelStyle = 'solo';
    } else if (msgLower.includes('business') || msgLower.includes('work trip') || msgLower.includes('conference')) {
      memory.travelStyle = 'business';
    } else if (msgLower.includes('couple') || msgLower.includes('honeymoon') || msgLower.includes('partner') || msgLower.includes('wife') || msgLower.includes('husband')) {
      memory.travelStyle = 'couple';
    }

    // 2. Extract Budget Preference
    // e.g. "under 5000", "budget is 10k", "under $300"
    const budgetMatch = msgLower.match(/(?:budget|under|below|less than)\s*(?:is|of|at)?\s*(?:rs\.?|inr|usd|\$)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
    if (budgetMatch) {
      let val = parseFloat(budgetMatch[1]);
      const isK = budgetMatch[2] && budgetMatch[2].toLowerCase() === 'k';
      if (isK) val *= 1000;
      
      // Convert to standard USD reference
      const isLargeValue = val > 1000 || msgLower.includes('rs') || msgLower.includes('inr');
      memory.budgetPreference = isLargeValue ? Math.round(val / 83) : Math.round(val);
    }

    // 3. Extract Interests
    if (!memory.interests) memory.interests = [];
    if (msgLower.includes('beach') || msgLower.includes('ocean') || msgLower.includes('sea view') || msgLower.includes('coast')) {
      this.addUnique(memory.interests, 'beaches');
    }
    if (msgLower.includes('mountain') || msgLower.includes('trek') || msgLower.includes('hill station') || msgLower.includes('snow')) {
      this.addUnique(memory.interests, 'mountains');
    }
    if (msgLower.includes('palace') || msgLower.includes('history') || msgLower.includes('historic') || msgLower.includes('heritage')) {
      this.addUnique(memory.interests, 'heritage');
    }
    if (msgLower.includes('safari') || msgLower.includes('wildlife') || msgLower.includes('forest') || msgLower.includes('jungle')) {
      this.addUnique(memory.interests, 'wildlife');
    }

    // 4. Extract Room Preferences
    if (msgLower.includes('suite') || msgLower.includes('presidential')) {
      memory.roomPreference = 'suite';
    } else if (msgLower.includes('pool view') || msgLower.includes('private pool')) {
      memory.roomPreference = 'pool view';
    } else if (msgLower.includes('balcony') || msgLower.includes('terrace')) {
      memory.roomPreference = 'balcony';
    }

    // 5. Extract Preferred Destinations
    if (!memory.preferredDestinations) memory.preferredDestinations = [];
    const knownCities = [
      'mumbai', 'new delhi', 'jaipur', 'udaipur', 'goa', 'agra', 'shimla', 
      'bengaluru', 'kochi', 'varanasi', 'jodhpur', 'hyderabad', 'gulmarg', 
      'chennai', 'mysore', 'almora'
    ];
    for (const city of knownCities) {
      if (msgLower.includes(city)) {
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        this.addUnique(memory.preferredDestinations, cityName);
      }
    }

    // 6. Sync Travel History from Bookings Database
    try {
      const bookings = bookingModel.findByUser(userId);
      if (bookings.length > 0) {
        if (!memory.travelHistory) memory.travelHistory = [];
        bookings.forEach((b) => {
          const hotel = hotelModel.findById(b.hotel_id);
          if (hotel) {
            this.addUnique(memory.travelHistory!, hotel.city);
          }
        });
      }
    } catch (err) {
      // Ignore booking query failure during tests
    }

    // Save profile changes back to database
    this.saveMemory(userId, memory);
    logger.info(`💾 Saved updated memory profile for User ${userId}`, memory);

    return memory;
  }

  private addUnique(arr: string[], val: string) {
    if (!arr.includes(val)) arr.push(val);
  }
}

export const memoryService = new MemoryService();
