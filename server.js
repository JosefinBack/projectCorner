import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.177.0/http/file_server.ts";

const kv = await Deno.openKv();

const jsonHeaders = {
    "Content-Type": "application/json",
};

// 🚀 Starta servern
serve(async (req) => {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                ...jsonHeaders,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    // ---------------- API ----------------

    if (req.method === "POST" && url.pathname === "/register") {
        let { username, password } = await req.json();
        let existing = await kv.get(["users", username]);
        if (existing.value) {
            return new Response(JSON.stringify({ error: "User exists" }), {
                status: 400,
                headers: jsonHeaders,
            });
        }
        await kv.set(["users", username], { password });
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    if (req.method === "POST" && url.pathname === "/login") {
        let { username, password } = await req.json();
        let user = await kv.get(["users", username]);
        if (!user.value || user.value.password !== password) {
            return new Response(JSON.stringify({ error: "Invalid login" }), {
                status: 401,
                headers: jsonHeaders,
            });
        }
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    if (req.method === "POST" && url.pathname.startsWith("/books/")) {
        let username = url.pathname.split("/")[2];
        let book = await req.json();
        if (!book.id) {
            book.id = crypto.randomUUID();
        }
        await kv.set(["books", username, book.id], book);
        return new Response(JSON.stringify(book), { headers: jsonHeaders });
    }

    if (req.method === "GET" && url.pathname.startsWith("/books/")) {
        let username = url.pathname.split("/")[2];
        let books = [];
        for await (const entry of kv.list({ prefix: ["books", username] })) {
            books.push(entry.value);
        }
        return new Response(JSON.stringify(books), { headers: jsonHeaders });
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/books/")) {
        let parts = url.pathname.split("/");
        let username = parts[2];
        let id = parts[3];
        await kv.delete(["books", username, id]);
        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    // ---------------- Static files ----------------

    // Om man går till `/`, ladda startsidan
    if (url.pathname === "/") {
        return await serveFile(req, "./HTML/projekt2.html");
    }

    try {
        return await serveFile(req, "." + url.pathname);
    } catch {
        return new Response("Not found", { status: 404 });
    }
});


//test