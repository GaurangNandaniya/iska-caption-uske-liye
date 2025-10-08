Bun.serve({
  port: 3001,
  // `routes` requires Bun v1.2.3+
  routes: {
    // Websocket
    "/ws": new Response("OK"),

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
    message(ws) {
      // Publish to all "chat" subscribers
      server.publish("chat", "Hello everyone!");
    },
  },

  // (optional) fallback for unmatched routes:
  // Required if Bun's version < 1.2.3
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});
