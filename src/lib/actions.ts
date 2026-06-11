import { createServerFn } from "@tanstack/react-start";

// In-memory store for 24-hour duplicate lead prevention
// Maps phone number → timestamp of last submission
const recentLeads = new Map<string, number>();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in ms

function cleanExpiredLeads() {
  const now = Date.now();
  for (const [phone, timestamp] of recentLeads) {
    if (now - timestamp > TWENTY_FOUR_HOURS) {
      recentLeads.delete(phone);
    }
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: {
    name: string;
    phone: string;
    city: string;
    selectedSymptoms: string[];
    submittedAt: string;
    source: string;
  }) => data)
  .handler(async ({ data }) => {
    // 0. Check for duplicate submission within 24 hours
    const phone = data.phone.trim();
    cleanExpiredLeads();

    const lastSubmission = recentLeads.get(phone);
    if (lastSubmission) {
      const elapsed = Date.now() - lastSubmission;
      if (elapsed < TWENTY_FOUR_HOURS) {
        const hoursLeft = Math.ceil((TWENTY_FOUR_HOURS - elapsed) / (60 * 60 * 1000));
        console.log(`[DUPLICATE] Phone ${phone} already submitted ${Math.floor(elapsed / 60000)} min ago`);
        return {
          success: false,
          duplicate: true,
          message: `Aapne already form submit kiya hai. Please wait for our representative's call.`,
        };
      }
    }

    // Mark this phone as submitted NOW
    recentLeads.set(phone, Date.now());

    // 1. Send to Google Sheets Webhook
    let GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;

    if (!GOOGLE_SHEET_WEBHOOK) {
      try {
        const vinxiHttp = "vinxi/http";
        const { getEvent } = await import(vinxiHttp);
        const event = getEvent();
        const cfEnv = (event?.context as any)?.cloudflare?.env;
        if (cfEnv?.GOOGLE_SHEET_WEBHOOK) {
          GOOGLE_SHEET_WEBHOOK = cfEnv.GOOGLE_SHEET_WEBHOOK;
        }
      } catch (e) {
        // Ignore, not in Vinxi environment or context not available
      }
    }

    if (!GOOGLE_SHEET_WEBHOOK) {
      try {
        const cfWorkersModule = "cloudflare:workers";
        const cfWorkers = await import(cfWorkersModule);
        if (cfWorkers?.env && (cfWorkers.env as any).GOOGLE_SHEET_WEBHOOK) {
          GOOGLE_SHEET_WEBHOOK = (cfWorkers.env as any).GOOGLE_SHEET_WEBHOOK;
        }
      } catch (e) {
        // Ignore, cloudflare:workers only available in Cloudflare runtime
      }
    }

    if (GOOGLE_SHEET_WEBHOOK) {
      try {
        await fetch(GOOGLE_SHEET_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            city: data.city,
            selectedSymptoms: data.selectedSymptoms.join(", "),
            submittedAt: data.submittedAt,
            source: data.source,
          }),
        });
      } catch (error) {
        console.error("Error sending to Google Sheet:", error);
      }
    } else {
      console.warn("GOOGLE_SHEET_WEBHOOK is not set in any environment");
    }

    return { success: true, duplicate: false, message: "" };
  });
