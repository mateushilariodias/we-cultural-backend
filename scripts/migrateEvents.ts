import mongoose from "mongoose";
import Event from "../src/models/eventModel.js";
import { parseBrazilianDate } from "../src/utils/parseDate.js";

const MONGO_URI = "SUA_URL_AQUI";

const migrate = async () => {
  await mongoose.connect(MONGO_URI);

  const events = await Event.find();

  for (const event of events) {
    try {
      // DATA PRINCIPAL
      if (typeof event.date === "string") {
        event.date = parseBrazilianDate(event.date);
      }

      // DATAS MÚLTIPLAS
      if (Array.isArray(event.dates) && typeof event.dates[0] === "string") {
        event.dates = event.dates
          .map((d: string) => {
            try {
              return parseBrazilianDate(d.split(" ")[0]);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      }

      await event.save();

      console.log("✅ Migrado:", event.title);
    } catch {
      console.log("❌ Erro:", event.title);
    }
  }

  console.log("🚀 Migração finalizada");
  process.exit();
};

migrate();