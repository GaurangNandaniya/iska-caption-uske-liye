import type { ServerWebSocket } from "bun";
import {
  createUser,
  getImage,
  getImageCount,
  createImageResponse,
} from "./model.ts";

type WebSocketData = {
  id: string;
};

const currentState = {
  wsRefs: [],
  mode: "ASK",
  currentImageNumber: 0,
};

const getHandlers = {
  "/mode/get": (req) => {
    return Response("hello");
  },
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function createResponse(body, contentType) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

Bun.serve({
  port: 3001,
  hostname: "0.0.0.0",
  routes: {
    // Mode handling
    "/mode/get": {
      GET: () => {
        return Response.json({ mode: currentState.mode });
      },
    },
    "/mode/update": {
      POST: async (req) => {
        const body = await req.json();

        currentState.wsRefs.forEach((ws) => {
          ws.send(JSON.stringify({ type: "MODE_UPDATE", value: body.mode }));
        });

        currentState.mode = body.mode;

        return new createResponse(body);
      },
    },

    // User handling
    "/user/create": {
      POST: async (req) => {
        const body = await req.json();
        return createResponse(await createUser(body));
      },
    },

    "/images/*": {
      GET: async (req) => {
        const filePath = "./" + new URL(req.url).pathname;
        const file = Bun.file(filePath);
        return new Response(file);
      },
    },

    // Image handling
    "/photo/current": {
      GET: async (req) => {
        const result = getImage({ id: currentState.currentImageNumber });
        return new createResponse(result);
      },
    },
    "/photo/next": {
      POST: async (req) => {
        const imageCount = getImageCount();

        if (imageCount < 1) {
          return createResponse({
            status: "error",
            message: "No images to show",
          });
        }

        currentState.currentImageNumber += 1;
        currentState.currentImageNumber =
          currentState.currentImageNumber % imageCount;

        return createResponse({ status: "ok" });
      },
    },

    // Response handling
    "/photo/response/create": {
      POST: async (req) => {
        const body = await req.json();
        const result = createImageResponse(body);

        return createResponse(result);
      },
    },
  },

  websocket: {
    // Fired when the connection is successfully opened
    open(ws: ServerWebSocket<WebSocketData>) {
      currentState.wsRefs.push(ws);
      console.log("Connected!");
      ws.send(JSON.stringify({ status: "connected" }));
    },

    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
      console.log(`[WS] Received: ${message}`);
      ws.send(JSON.stringify({ type: "REFETCH" }));
    },

    // Fired when the connection closes
    close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
      console.log(`[WS] Client disconnected.`);
    },
  },

  fetch(req, server) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/ws") {
      // 2. We have the 'server' object here, so we can call upgrade
      const success = server.upgrade(req);

      if (success) {
        return undefined; // Handshake successful! Hand off to 'websocket' handlers.
      }

      return new Response("Upgrade failed", { status: 400 });
    }

    return new Response("Invalid request");
  },
});
