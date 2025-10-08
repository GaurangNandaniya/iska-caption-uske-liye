import {
  createUser,
  getImage,
  getImageCount,
  createImageResponse,
  getAllImageResponses,
  getImageResponses,
} from "./model.ts";

const currentState: {
  mode: "ASK" | "REVEAL";
  wsRefs: any[];
  currentImageNumber: number;
} = {
  wsRefs: [],
  mode: "ASK",
  currentImageNumber: 0,
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function createJsonResponse(body: any) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function sendModeUpdateSignal(body: any) {
  currentState.wsRefs.forEach((ws: any) => {
    ws.send(JSON.stringify({ type: "MODE_UPDATE", value: body.mode }));
  });
}

function sendRefetchSignal() {
  currentState.wsRefs.forEach((ws: any) => {
    ws.send(JSON.stringify({ type: "REFETCH" }));
  });
}

function sendNextResponseSignal(body: any) {
  currentState.wsRefs.forEach((ws: any) => {
    ws.send(JSON.stringify({ type: "NEXT_RESPONSE", value: body }));
  });
}

Bun.serve({
  port: 3001,
  hostname: "0.0.0.0",
  routes: {
    // Mode handling
    "/mode/get": {
      GET: () => {
        return createJsonResponse({ mode: currentState.mode });
      },
    },
    "/mode/update": {
      POST: async (req: any) => {
        const body = await req.json();

        // Send signals
        sendModeUpdateSignal(body);
        sendRefetchSignal();

        currentState.mode = body.mode;

        return createJsonResponse(body);
      },
    },

    // User handling
    "/user/create": {
      POST: async (req: any) => {
        const body = await req.json();
        const result = await createUser(body);

        sendRefetchSignal();
        return createJsonResponse(result);
      },
    },

    "/images/*": {
      GET: async (req: any) => {
        const filePath = "./" + new URL(req.url).pathname;
        const file = Bun.file(filePath);
        return new Response(file);
      },
    },

    // Image handling
    "/photo/current": {
      GET: async () => {
        const result = getImage({ id: currentState.currentImageNumber });
        return createJsonResponse(result);
      },
    },
    "/photo/:id": {
      GET: async (req: any) => {
        const result = getImage({ id: req.params.id });

        const filePath = "./" + result.image_path;
        const file = Bun.file(filePath);

        return new Response(file);
      },
    },
    "/photo/:id/responses": {
      GET: async (req: any) => {
        const result = getImageResponses({ id: req.params.id });

        return createJsonResponse(result);
      },
    },
    "/photo/next": {
      POST: async () => {
        const imageCount = getImageCount();

        if (imageCount < 1) {
          return createJsonResponse({
            status: "error",
            message: "No images to show",
          });
        }

        currentState.currentImageNumber += 1;
        currentState.currentImageNumber =
          currentState.currentImageNumber % imageCount;

        sendRefetchSignal();
        return createJsonResponse({ status: "ok" });
      },
    },

    // Response handling
    "/photo/response/create": {
      POST: async (req: any) => {
        const body = await req.json();
        const result = createImageResponse(body);

        sendRefetchSignal();
        return createJsonResponse(result);
      },
    },

    // Get all responses
    "/responses": {
      GET: async () => {
        const result = getAllImageResponses();

        return createJsonResponse(result);
      },
    },

    "/response/next": {
      POST: async (req: any) => {
        const body = await req.json();

        sendNextResponseSignal(body);
        sendRefetchSignal();

        return createJsonResponse({ status: "ok" });
      },
    },
  },

  websocket: {
    // Fired when the connection is successfully opened
    open(ws: any) {
      currentState.wsRefs.push(ws);
      console.log("Connected!");
      ws.send(JSON.stringify({ status: "connected" }));
    },

    message(ws: any, message: string) {
      console.log(`[WS] Received: ${message}`);
      ws.send(JSON.stringify({ type: "REFETCH" }));
    },

    // Fired when the connection closes
    close(_ws: any, _code: number, reason: string) {
      console.log(`[WS] Client disconnected. Reason: ${reason}`);
    },
  },

  fetch(req: any, server: any) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/ws") {
      const success = server.upgrade(req);

      if (success) {
        return undefined; // Handshake successful! Hand off to 'websocket' handlers.
      }

      return new Response("Upgrade failed", { status: 400 });
    }

    return new Response("Hello, this is unhandled request.");
  },
});
