import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const database = await Deno.openKv();

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // tillåt alla (kan bytas till din github.io-domän om du vill låsa)
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
    try {
        const url = new URL(req.url);

        // ✅ Hantera preflight OPTIONS
        if (req.method === "OPTIONS") {
            return new Response(null, { headers });
        }

        // ✅ Registrera användare
        if (req.method === "POST" && url.pathname === "/register") {
            let { username, password } = await req.json();
            let existing = await database.get(["users", username]);
            if (existing.value) {
                return new Response(JSON.stringify({ error: "User exists" }), {
                    status: 400,
                    headers,
                });
            }
            await database.set(["users", username], { password });
            return new Response(JSON.stringify({ success: true }), { headers });
        }

        // ✅ Logga in
        if (req.method === "POST" && url.pathname === "/login") {
            let { username, password } = await req.json();
            let user = await database.get(["users", username]);
            if (!user.value || user.value.password !== password) {
                return new Response(JSON.stringify({ error: "Invalid login" }), {
                    status: 401,
                    headers,
                });
            }
            return new Response(JSON.stringify({ success: true }), { headers });
        }

        // ✅ Spara bok
        if (req.method === "POST" && url.pathname.startsWith("/books/")) {
            let username = url.pathname.split("/")[2];
            let book = await req.json();
            if (!book.id) {
                book.id = crypto.randomUUID();
            }
            await database.set(["books", username, book.id], book);
            return new Response(JSON.stringify(book), { headers });
        }

        // ✅ Hämta böcker
        if (req.method === "GET" && url.pathname.startsWith("/books/")) {
            let username = url.pathname.split("/")[2];
            let books = [];
            for await (const entry of database.list({ prefix: ["books", username] })) {
                books.push(entry.value);
            }
            return new Response(JSON.stringify(books), { headers });
        }

        // ✅ Radera bok
        if (req.method === "DELETE" && url.pathname.startsWith("/books/")) {
            let parts = url.pathname.split("/");
            let username = parts[2];
            let id = parts[3];
            await database.delete(["books", username, id]);
            return new Response(JSON.stringify({ success: true }), { headers });
        }

        // ❌ Om ingen route matchar
        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers,
        });
    } catch (err) {
        console.error("Serverfel:", err);
        return new Response(JSON.stringify({ error: "Server error", details: err.message }), {
            status: 500,
            headers,
        });
    }
});
