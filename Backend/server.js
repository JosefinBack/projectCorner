import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

async function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Access-Control-Allow-Origin", "*");
    headerCORS.append("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    headerCORS.append("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: headerCORS
        });
    }

    // Serva statiska filer
    const response = await serveDir(request, {
        fsRoot: "./Frontend", // <-- justera till din mapp
        urlRoot: "",
        showDirListing: false,
    });

    return response;
}

Deno.serve(handler);
