// Öppna Deno KV-databasen
const database = await Deno.openKv();

async function handleRequest(req) {
    const url = new URL(req.url);

    // ✅ Alla headers vi behöver för CORS
    const headers = {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // ✅ Svara på preflight-requests (OPTIONS)
    if (req.method === "OPTIONS") {
        return new Response(null, { headers });
    }

    // --- REGISTRERA ANVÄNDARE ---
    if (req.method === "POST" && url.pathname === "/register") {
        let user = await req.json();
        let existing = await database.get(["users", user.username]);
        if (existing.value) {
            return new Response(
                JSON.stringify({ error: "User already exists" }),
                { status: 400, headers }
            );
        }
        await database.set(["users", user.username], user);
        return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- LOGGA IN ---
    if (req.method === "POST" && url.pathname === "/login") {
        let user = await req.json();
        let stored = await database.get(["users", user.username]);
        if (!stored.value) {
            return new Response(
                JSON.stringify({ error: "User does not exist" }),
                { status: 401, headers }
            );
        }
        if (stored.value.password !== user.password) {
            return new Response(
                JSON.stringify({ error: "Wrong password" }),
                { status: 401, headers }
            );
        }
        return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- HÄMTA BÖCKER FÖR ANVÄNDARE ---
    if (req.method === "GET" && url.pathname.startsWith("/books/")) {
        let username = url.pathname.split("/")[2];
        let books = [];
        for await (const entry of database.list({ prefix: ["books", username] })) {
            books.push(entry.value);
        }
        return new Response(JSON.stringify(books), { headers });
    }

    // --- SPARA BOK FÖR ANVÄNDARE ---
    if (req.method === "POST" && url.pathname.startsWith("/books/")) {
        let username = url.pathname.split("/")[2];
        let book = await req.json();
        if (!book.id) {
            book.id = crypto.randomUUID();
        }
        await database.set(["books", username, book.id], book);
        return new Response(JSON.stringify(book), { headers });
    }

    // --- FALLBACK ---
    return new Response(
        JSON.stringify({ error: "Not found" }),
        { status: 404, headers }
    );
}

// ✅ Starta servern
Deno.serve(handleRequest);
