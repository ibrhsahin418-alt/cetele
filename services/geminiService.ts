import { GoogleGenAI } from "@google/genai";
import { LogEntry, TaskType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_QUOTES = [
  "Her gün yeni bir başlangıçtır. Gayretini takdir ediyorum!",
  "Damlaya damlaya göl olur. Küçük adımlar büyük sonuçlar doğurur.",
  "İstikrar, başarının anahtarıdır. Aynen devam et!",
  "Bugün yaptığın çalışmalar, yarının meyveleri olacak.",
  "Manevi gelişim bir maratondur, sabırla yürü.",
  "Güzel gören güzel düşünür, güzel düşünen hayatından lezzet alır.",
  "Vazifeni yapmak en büyük ödüdür.",
  "Niyetin halis ise, az amel çok hükmündedir."
];

// Simple in-memory cache to reduce API calls
let cache: { 
  studentName: string; 
  logCount: number; 
  lastLogId: string;
  message: string;
  timestamp: number;
} | null = null;

export const getDailyMotivation = async (studentName: string, logs: LogEntry[]): Promise<string> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = logs.filter(l => l.date === today);

    // Cache Key Generation (based on student, number of logs, and ID of latest log)
    const lastLog = todaysLogs.length > 0 ? todaysLogs[0] : null;
    const cacheKeyLogId = lastLog ? lastLog.id : 'no-logs';
    
    // Return cached response if valid (valid for 1 hour if state hasn't changed)
    if (
      cache && 
      cache.studentName === studentName && 
      cache.logCount === todaysLogs.length &&
      cache.lastLogId === cacheKeyLogId &&
      (Date.now() - cache.timestamp < 1000 * 60 * 60)
    ) {
      return cache.message;
    }

    let summary = "";
    if (todaysLogs.length === 0) {
      summary = "Henüz bir veri girilmedi.";
    } else {
      summary = todaysLogs.map(l => {
        const typeName = 
          l.type === TaskType.QURAN ? "Kuran-ı Kerim" :
          l.type === TaskType.RISALE ? "Risale-i Nur" :
          l.type === TaskType.PIRLANTA ? "Pırlanta Serisi" :
          l.type === TaskType.ZIKIR ? "Zikir/Tesbihat" : "Kitap Okuma";
        return `${typeName}: ${l.value} ${l.type === TaskType.ZIKIR ? 'adet' : 'sayfa'}`;
      }).join(", ");
    }

    const prompt = `
      Sen gençlere rehberlik eden bilge, samimi ve motive edici bir eğitim koçusun (ağabey/abla tonunda).
      Öğrencinin adı: ${studentName}.
      Bugünkü yaptıkları manevi çalışmalar: ${summary}.

      Eğer çalışma yapmışsa onu tebrik et, yaptığı işin manevi kıymetine değin (kısa bir hadis veya vecize atfı yapabilirsin).
      Eğer çalışma yapmamışsa onu nazikçe, ümit verici bir dille teşvik et. Asla yargılayıcı olma.
      Cevabın 2-3 cümleyi geçmesin. Türkçeyi akıcı ve sıcak kullan.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const message = response.text || FALLBACK_QUOTES[0];
    
    // Update Cache
    cache = {
      studentName,
      logCount: todaysLogs.length,
      lastLogId: cacheKeyLogId,
      message,
      timestamp: Date.now()
    };

    return message;

  } catch (error: any) {
    // Handle Quota Limits (429) or other errors gracefully
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
       console.warn("Gemini Quota Exceeded. Using fallback motivation.");
    } else {
       console.error("Gemini Error:", error);
    }
    
    // Return a random fallback quote
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};