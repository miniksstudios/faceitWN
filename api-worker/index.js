export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);

    // GET /api/players
    if (url.pathname === '/api/players' && request.method === 'GET') {
      const data = await env.PLAYERS_KV.get('list', { type: 'json' });
      return new Response(JSON.stringify(data || ['_kolzer_', 'minilstudio']), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // POST /api/players
    if (url.pathname === '/api/players' && request.method === 'POST') {
      try {
        const body = await request.json();
        const nick = body.nickname?.trim();
        if (!nick || nick.length < 2 || nick.length > 30) {
          return new Response(JSON.stringify({ error: 'Invalid nickname' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        let players = await env.PLAYERS_KV.get('list', { type: 'json' }) || ['_kolzer_', 'minilstudio'];
        if (!players.includes(nick)) {
          players.push(nick);
          await env.PLAYERS_KV.put('list', JSON.stringify(players));
        }
        return new Response(JSON.stringify({ ok: true, players }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not found', { status: 404, headers: cors });
  },
};
