const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Import auth routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');

const corsOptions = {
  origin: '*', // Mengizinkan semua origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], // Semua metode HTTP yang diizinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
  credentials: true, // Mengizinkan pengiriman cookies dan otentikasi
};

const app = express();

// Cek apakah file SSL ada
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');
const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);

let sslOptions = null;
if (useHttps) {
    sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
}

app.use(cors(corsOptions));
app.use(express.json());

// Route untuk health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Auth routes
app.use('/login', authRoutes);
app.use('/login', adminAuthRoutes);

//redirect
app.get('/gis/peta', (req, res) => {
  res.redirect(301, '/gis/peta/');
});

// Proxy untuk static files portal (tanpa path rewrite) - HARUS DULUAN
app.use('/static', createProxyMiddleware({
    target: 'http://localhost:3000/static', // Portaldata-fe running on port 3000
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/portal/static': '/static', // Redirect /portal/static to /static in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /portal/static:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying static portal ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy untuk portaldata-fe
app.use('/portal', createProxyMiddleware({
    target: 'http://localhost:3000', // Portaldata-fe running on port 3000
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/': '/', // Redirect /portal to / in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /portal:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying portal ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));
// Proxy untuk portaldata-fe
app.use('/portal-be', createProxyMiddleware({
    target: 'http://localhost:5000', // Portaldata-fe running on port 3000
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/': '/', // Redirect /portal to / in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /portal:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying portal ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Redirect /peta to /gis/peta
// app.use('/peta', (req, res) => {
//     const newUrl = `/gis/peta${req.url}`;
//     console.log(`Redirecting ${req.url} to ${newUrl}`);
//     res.redirect(newUrl);
// });

// Proxy untuk GIS service (termasuk static files)
app.use('/gis/peta', createProxyMiddleware({
    target: 'http://localhost:9100', // GIS service running on port 9100
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/gis/peta': '', // Redirect /gis to /peta in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /gis:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy untuk GIS service (termasuk static files)
app.use('/gis-be', createProxyMiddleware({
    target: 'http://localhost:9000', // GIS service running on port 9100
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/': '/', // Redirect /gis to /peta in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /gis:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));
// Proxy untuk static files dengan /peta di belakang
app.use('/peta', createProxyMiddleware({
    target: 'http://localhost:9100/peta', // GIS service running on port 9100 dengan /peta
    changeOrigin: true,
    secure: false,
    onError: (err, req, res) => {
        console.error('Proxy error for /peta:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying static ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy untuk login service
app.use('/login', createProxyMiddleware({
    target: 'http://localhost:1225', // Login service running on port 1225
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/login': '/', // Redirect /login to / in backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /login:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying login ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy untuk portaldata-be API
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000', // Portaldata-be running on port 5000
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api': '/api', // Keep /api path
    },
    onError: (err, req, res) => {
        console.error('Proxy error for /api:', err.message);
        res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying API ${req.method} ${req.url} to ${proxyReq.path}`);
    }
}));

// Proxy untuk static files login (kecuali health check, portal, dan static)
app.use('/', (req, res, next) => {
    if (req.path === '/health' || req.path.startsWith('/portal') || req.path.startsWith('/static') || req.path.startsWith('/api')) {
        return next();
    }
    
    const proxy = createProxyMiddleware({
        target: 'http://localhost:1225', // Login service running on port 1225
        changeOrigin: true,
        secure: false,
        onError: (err, req, res) => {
            console.error('Proxy error for static files:', err.message);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        },
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying static ${req.method} ${req.url} to ${proxyReq.path}`);
        }
    });
    
    proxy(req, res, next);
});

const PORT = process.env.PORT || 9200;

// Mulai server berdasarkan ketersediaan SSL
if (useHttps) {
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`✅ HTTPS Proxy server running on https://localhost:${PORT}`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`✅ HTTP Proxy server running on http://localhost:${PORT}`);
        console.log('⚠️  SSL certificates not found, running in HTTP mode');
    });
}
