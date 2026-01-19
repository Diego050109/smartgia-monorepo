import { Controller, Get } from "@nestjs/common";
import axios from "axios";

@Controller("health")
export class HealthController {
  @Get()
  async health() {
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";

    const services = [
      { name: "auth-service", url: process.env.AUTH_SERVICE_URL || "http://auth-service:4001" },
      { name: "user-service", url: process.env.USER_SERVICE_URL || "http://user-service:4002" },
      { name: "routine-service", url: process.env.ROUTINE_SERVICE_URL || "http://routine-service:4003" },
      { name: "exercise-service", url: process.env.EXERCISE_SERVICE_URL || "http://exercise-service:4004" },
      { name: "attendance-service", url: process.env.ATTENDANCE_SERVICE_URL || "http://attendance-service:4005" },
      { name: "history-service", url: process.env.HISTORY_SERVICE_URL || "http://history-service:4006" },
      { name: "progress-service", url: process.env.PROGRESS_SERVICE_URL || "http://progress-service:4007" },
      { name: "notification-service", url: process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4008" },
      { name: "ai-service", url: process.env.AI_SERVICE_URL || "http://ai-service:4009" }
    ];

    const headers = internalToken ? { "x-internal-token": internalToken } : {};

    const results: any[] = [];

    for (const s of services) {
      try {
        const res = await axios.get(s.url + "/health", { headers: headers, timeout: 3000 });
        results.push({ name: s.name, ok: true, data: res.data });
      } catch (e) {
        const anyErr: any = e;
        const status = anyErr && anyErr.response ? anyErr.response.status : null;
        const msg =
          anyErr && anyErr.response && anyErr.response.data && anyErr.response.data.message
            ? anyErr.response.data.message
            : (anyErr && anyErr.message ? anyErr.message : "Unknown error");

        results.push({
          name: s.name,
          ok: false,
          error: status ? ("Request failed with status code " + status + ": " + msg) : msg
        });
      }
    }

    const allOk = results.every((r: any) => r.ok === true);

    return {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: results
    };
  }
}
