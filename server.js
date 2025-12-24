import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.177.0/http/file_server.ts";

const kv = await Deno.openKv();

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
};

// 🚀 Starta servern
serve(async (req) => {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // ---------------- API ----------------

    // Register
    if (req.method === "POST" && url.pathname === "/register") {
        let { username, password } = await req.json();
        let existing = await kv.get(["users", username]);
        if (existing.value) {
            return new Response(JSON.stringify({ error: "User exists" }), {
                status: 400,
                headers: corsHeaders,
            });
        }
        await kv.set(["users", username], { password });
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // Login
    if (req.method === "POST" && url.pathname === "/login") {
        let { username, password } = await req.json();
        let user = await kv.get(["users", username]);
        if (!user.value || user.value.password !== password) {
            return new Response(JSON.stringify({ error: "Invalid login" }), {
                status: 401,
                headers: corsHeaders,
            });
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // Create book
    if (req.method === "POST" && url.pathname.startsWith("/books/")) {
        try {
            let username = url.pathname.split("/")[2];
            let book = await req.json();

            // Alltid skapa nytt ID för nya böcker
            book.id = crypto.randomUUID();

            if (!book.order) {
                book.order = Date.now();
            }

            await kv.set(["books", username, book.id], book);

            return new Response(JSON.stringify(book), { headers: corsHeaders });
        } catch (err) {
            console.error("Fel i POST /books:", err);
            return new Response(JSON.stringify({ error: "Server error", details: String(err) }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    }

    // Update book
    if (req.method === "PUT" && url.pathname.startsWith("/books/")) {
        try {
            let parts = url.pathname.split("/");
            let username = parts[2];
            let id = parts[3];
            let book = await req.json();

            // säkerställ att id följer med
            book.id = id;

            if (!book.order) {
                book.order = Date.now();
            }

            await kv.set(["books", username, id], book);

            return new Response(JSON.stringify(book), { headers: corsHeaders });
        } catch (err) {
            console.error("Fel i PUT /books/:username/:id", err);
            return new Response(JSON.stringify({ error: "Server error", details: String(err) }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    }



    // Get all books
    if (req.method === "GET" && url.pathname.startsWith("/books/")) {
        let username = url.pathname.split("/")[2];
        let books = [];
        for await (const entry of kv.list({ prefix: ["books", username] })) {
            books.push(entry.value);
        }
        return new Response(JSON.stringify(books), { headers: corsHeaders });
    }

    // Spara alla böcker i en JSON-fil (backup)
    // if (req.method === "POST" && url.pathname === "/backup-books") {

    //     // Läs användarnamnet som skickas från frontend
    //     const body = await req.json();
    //     const username = body.username;

    //     // Hämta alla böcker för användaren
    //     let books = [];

    //     for await (const entry of kv.list({ prefix: ["books", username] })) {
    //         books.push(entry.value);
    //     }

    //     // Skriv över / skapa allBooks.json
    //     await Deno.writeTextFile(
    //         "./allBooks.json",
    //         JSON.stringify(books, null, 2)
    //     );

    //     // Skicka svar tillbaka till frontend
    //     return new Response(
    //         JSON.stringify({
    //             success: true,
    //             message: "Backup skapad",
    //             amount: books.length
    //         }),
    //         { headers: corsHeaders }
    //     );
    // }


    // Delete book
    if (req.method === "DELETE" && url.pathname.startsWith("/books/")) {
        let parts = url.pathname.split("/");   // delar upp URL:en i ["", "books", username, id]
        let username = parts[2];               // andra elementet blir användarnamn
        let id = parts[3];                     // tredje elementet blir bokens id
        await kv.delete(["books", username, id]); // tar bort boken från databasen
        return new Response(
            JSON.stringify({ success: true }),
            { headers: corsHeaders }
        );
    }

    // ---------------- Static files ----------------

    // Om man går till `/`, ladda startsidan
    if (url.pathname === "/") {
        return await serveFile(req, "./HTML/books.html");
    }

    if (url.pathname === "/calender") {
        return await serveFile(req, "./HTML/calender.html");
    }


    try {
        return await serveFile(req, "." + url.pathname);
    } catch {
        return new Response("Not found", { status: 404, headers: corsHeaders });
    }
});