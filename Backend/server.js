// server.js

// Öppna databasen (Deno KV)
const database = await Deno.openKv();

// Funktion som hanterar alla inkommande requests
async function handleRequest(req) {
    const url = new URL(req.url);

    // Standard-headers (CORS + JSON)
    const headers = {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Svara på OPTIONS-förfrågningar (CORS)
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: headers });
    }

    // Hämta alla böcker
    if (req.method === "GET" && url.pathname === "/books") {
        let res = await database.get(["allBooks"]);
        let books = res.value || []; // om inget finns ännu → tom array
        return new Response(JSON.stringify(books), { headers: headers });
    }

    // Spara en ny bok
    if (req.method === "POST" && url.pathname === "/books") {
        const book = await req.json();
        book.id = crypto.randomUUID();

        // Hämta befintliga böcker
        let res = await database.get(["allBooks"]);
        let books = res.value || [];

        // Lägg till nya boken
        books.push(book);

        // Spara tillbaka hela listan
        await database.set(["allBooks"], books);

        return new Response(JSON.stringify(book), { status: 201, headers: headers });
    }

    // Om ingen route matchar
    return new Response(
        JSON.stringify({ error: "Not found" }),
        { status: 404, headers: headers }
    );
}

// Starta servern med en vanlig funktion
Deno.serve(handleRequest);