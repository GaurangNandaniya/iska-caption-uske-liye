import type { ServerWebSocket } from "bun";

type WebSocketData = {
  id: string;
};

Bun.serve({
  hostname: "0.0.0.0",

  port: 3001,
  // `routes` requires Bun v1.2.3+
  routes: {
    // Dynamic routes
    "/viewer": (req) => {
      // return static html
      return new Response(`Hello User ${req.params.id}!`);
    },
    "/admin": (req) => {
      // return static html
      return new Response(`Hello User ${req.params.id}!`);
    },
    "/": (req) => {
      // return static html
      return new Response(`Hello User ${req.params.id}!`);
    },

    // Per-HTTP method handlers
    "/mode": {
      GET: () => new Response("List posts"),
      POST: async (req) => {
        const body = await req.json();
        return Response.json({ created: true, ...body });
      },
    },
    "/user": {
      GET: () => {
        // get current user
        return new Response("List posts");
      },
      POST: async (req) => {
        const body = await req.json();
        return Response.json({ created: true, ...body });
      },
    },

    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),

    // Redirect from /blog/hello to /blog/hello/world
    "/blog/hello": Response.redirect("/blog/hello/world"),
  },

  websocket: {
    // Fired when the connection is successfully opened
    open(ws: ServerWebSocket<WebSocketData>) {
      console.log("Connected!");
      ws.send(JSON.stringify({ status: "connected" }));
    },

    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
      console.log(`[WS] Received: ${message}`);
      ws.send(JSON.stringify({ message }));
    },

    // Fired when the connection closes
    close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
      console.log(`[WS] Client disconnected.`);
    },
  },

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      // 2. We have the 'server' object here, so we can call upgrade
      const success = server.upgrade(req);

      if (success) {
        return undefined; // Handshake successful! Hand off to 'websocket' handlers.
      }

      return new Response("Upgrade failed", { status: 400 });
    }

    // Fallback for non-websocket traffic
    return new Response("Not a websocket request.");
  },
});
