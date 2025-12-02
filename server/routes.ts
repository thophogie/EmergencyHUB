import type { Express } from "express";
import { createServer, type Server } from "http";
// storage is imported lazily inside registerRoutes so we can skip DB initialization
// when running in environments where the database is unavailable.
import fs from "fs/promises";
import path from "path";
import { 
  insertIncidentSchema, 
  insertGoBagItemSchema,
  insertHouseholdSchema,
  insertMemberSchema,
  insertCheckInSchema
} from "@shared/schema";
import { z } from "zod";
import { sendSMS } from "./twilio";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lazily import storage so we can optionally skip DB usage in test environments
  let storage: any = null;
  if (process.env.DISABLE_DB === "1") {
    console.warn("DISABLE_DB=1 set — skipping database initialization and routes that require the DB.");
  } else {
    try {
      const mod = await import("./storage");
      storage = mod.storage;

      // Initialize default data with error handling
      try {
        await storage.initializeGoBagItems();
        await storage.initializeEvacuationCenters();
        await storage.initializeHouseholds();
        await storage.initializeMembers();
        await storage.initializeHazardZones();
        await storage.initializePois();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
        console.error("Please ensure your Supabase database endpoint is running and the DATABASE_URL is correctly configured.");
      }
    } catch (err) {
      console.error("Could not import storage module:", err);
    }
  }

  const requireStorage = (res: any) => {
    if (!storage) {
      res.status(503).json({ error: "Database unavailable" });
      return false;
    }
    return true;
  };
  // Incident Routes
  app.post("/api/incidents", async (req, res) => {
    try {
      const incident = insertIncidentSchema.parse(req.body);
      if (!requireStorage(res)) return;
      const newIncident = await storage.createIncident(incident);
      res.json(newIncident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create incident" });
    }
  });

  app.get("/api/incidents", async (req, res) => {
    try {
      if (!requireStorage(res)) return;
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  // Go Bag Routes
  app.get("/api/go-bag-items", async (req, res) => {
    try {
      if (!storage) return res.status(503).json({ error: "Database unavailable" });
      const items = await storage.getGoBagItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch go bag items" });
    }
  });

  app.patch("/api/go-bag-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { checked } = req.body;
      if (typeof checked !== "boolean") {
        return res.status(400).json({ error: "checked must be a boolean" });
      }
      if (!storage) return res.status(503).json({ error: "Database unavailable" });
      const item = await storage.updateGoBagItem(id, checked);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // Evacuation Centers Routes
  app.get("/api/evacuation-centers", async (req, res) => {
    try {
      if (!requireStorage(res)) return;
      const centers = await storage.getEvacuationCenters();
      res.json(centers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch evacuation centers" });
    }
  });

  app.patch("/api/evacuation-centers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "status is required" });
      }
      if (!requireStorage(res)) return;
      const center = await storage.updateEvacuationCenter(id, status);
      res.json(center);
    } catch (error) {
      res.status(500).json({ error: "Failed to update evacuation center" });
    }
  });

  // Public Documents (list files in attached_assets)
  app.get("/api/public-documents", async (req, res) => {
    try {
      const assetsDir = path.resolve(__dirname, "..", "attached_assets");
      const filenames = await fs.readdir(assetsDir);
      const fileInfos = await Promise.all(
        filenames.map(async (filename) => {
          try {
            const filePath = path.join(assetsDir, filename);
            const stats = await fs.stat(filePath);
            const sizeKb = Math.max(1, Math.round(stats.size / 1024));
            const mime = (() => {
              const lower = filename.toLowerCase();
              if (lower.endsWith(".pdf")) return "application/pdf";
              if (lower.endsWith(".kml")) return "application/vnd.google-earth.kml+xml";
              if (lower.endsWith(".md") || lower.endsWith(".txt")) return "text/plain";
              return "application/octet-stream";
            })();

            return {
              id: filename,
              name: filename,
              mimeType: mime,
              size: `${sizeKb} KB`,
              modifiedTime: stats.mtime.toISOString(),
              webViewLink: `${req.protocol}://${req.get("host")}/assets/${encodeURIComponent(filename)}`,
            };
          } catch (innerErr) {
            return null;
          }
        })
      );

      const filtered = fileInfos.filter(Boolean);
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Failed to list public documents" });
    }
  });

  // Household Routes
  app.get("/api/households", async (req, res) => {
    try {
      if (!requireStorage(res)) return;
      const households = await storage.getHouseholds();
      res.json(households);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch households" });
    }
  });

  app.post("/api/households", async (req, res) => {
    try {
      const household = insertHouseholdSchema.parse(req.body);
      if (!requireStorage(res)) return;
      const newHousehold = await storage.createHousehold(household);
      res.json(newHousehold);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create household" });
    }
  });

  // Member Routes
  app.get("/api/households/:householdId/members", async (req, res) => {
    try {
      const householdId = parseInt(req.params.householdId);
      if (!requireStorage(res)) return;
      const members = await storage.getMembers(householdId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const member = insertMemberSchema.parse(req.body);
      if (!requireStorage(res)) return;
      const newMember = await storage.createMember(member);
      res.json(newMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, location } = req.body;
      if (!status) {
        return res.status(400).json({ error: "status is required" });
      }
      if (!requireStorage(res)) return;
      const member = await storage.updateMemberStatus(id, status, location);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member status" });
    }
  });

  // Check-in Routes
  app.get("/api/members/:memberId/check-ins", async (req, res) => {
    try {
      const memberId = parseInt(req.params.memberId);
      if (!requireStorage(res)) return;
      const checkIns = await storage.getCheckIns(memberId);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch check-ins" });
    }
  });

  app.post("/api/check-ins", async (req, res) => {
    try {
      const checkIn = insertCheckInSchema.parse(req.body);
      if (!requireStorage(res)) return;
      const newCheckIn = await storage.createCheckIn(checkIn);
      res.json(newCheckIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create check-in" });
    }
  });

  // Hazard Zone Routes
  app.get("/api/hazard-zones", async (req, res) => {
    try {
      if (!requireStorage(res)) return;
      const zones = await storage.getHazardZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hazard zones" });
    }
  });

  // POI Routes
  app.get("/api/pois", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      if (!requireStorage(res)) return;
      const pois = await storage.getPois(type);
      res.json(pois);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POIs" });
    }
  });

  // Config Route for Google API Key
  app.get("/api/config/google-api-key", async (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_API || '' });
  });

  // SMS Route using Twilio integration
  const smsSchema = z.object({
    to: z.string().min(10, "Phone number is required"),
    message: z.string().min(1, "Message is required")
  });

  app.post("/api/sms/send", async (req, res) => {
    try {
      const { to, message } = smsSchema.parse(req.body);
      const result = await sendSMS(to, message);
      res.json({ success: true, sid: result.sid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("SMS send error:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // Weather API Routes
  app.get("/api/weather/current", async (req, res) => {
    try {
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenWeather API key not configured" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching current weather:", error);
      res.status(500).json({ error: "Failed to fetch current weather" });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenWeather API key not configured" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
