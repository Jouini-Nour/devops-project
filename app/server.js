const express = require('express');
const client = require('prom-client');

const app = express();

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "1.0.0";

/* =========================
   PROMETHEUS METRICS
========================= */

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests'
});

/* =========================
   MIDDLEWARE
========================= */

app.use((req, res, next) => {
    httpRequestsTotal.inc();
    console.log(`${req.method} ${req.url}`);
    next();
});

/* =========================
   FRONTEND PAGE
========================= */

app.get('/', (req, res) => {

    const uptime = process.uptime();

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>DevOps App</title>

        <style>

            body {
                font-family: Arial, sans-serif;
                background: #0f172a;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }

            .card {
                background: #1e293b;
                padding: 40px;
                border-radius: 16px;
                width: 500px;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }

            h1 {
                color: #38bdf8;
            }

            .status {
                color: #22c55e;
                font-weight: bold;
            }

            code {
                background: #334155;
                padding: 4px 8px;
                border-radius: 5px;
            }

        </style>
    </head>

    <body>

        <div class="card">

            <h1>🚀 DevOps Monitoring App</h1>

            <p><strong>Status:</strong> 
                <span class="status">RUNNING</span>
            </p>

            <p><strong>Version:</strong> ${VERSION}</p>

            <p><strong>Uptime:</strong> ${uptime.toFixed(2)} seconds</p>

            <hr>

            <h3>Available Endpoints</h3>

            <ul>
                <li><code>/health</code></li>
                <li><code>/metrics</code></li>
            </ul>

        </div>

    </body>
    </html>
    `);
});

/* =========================
   HEALTH CHECK
========================= */

app.get('/health', (req, res) => {

    res.status(200).json({
        status: "UP",
        version: VERSION
    });

});

/* =========================
   PROMETHEUS METRICS
========================= */

app.get('/metrics', async (req, res) => {

    res.set('Content-Type', client.register.contentType);

    res.end(await client.register.metrics());

});

/* =========================
   START SERVER
========================= */

if (require.main === module) {

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

}

module.exports = app;