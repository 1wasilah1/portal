const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware with CSP configuration for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));
app.use(cors());

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Handle static files
app.use('/static', express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Environment variables
const PROXY_PORT = process.env.PROXY_PORT || 1500;
const PROXY_HOST = process.env.PROXY_HOST || 'localhost';
const LOGIN_PORT = process.env.LOGIN_PORT || 1225;
const GIS_FE_PORT = process.env.GIS_FE_PORT || 9000;
const PORTALDATA_PORT = process.env.PORTALDATA_PORT || 5500;
const USE_SSL = process.env.USE_SSL === 'true';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || './ssl/cert.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || './ssl/key.pem';

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  timeout: 10000, // 10 second timeout
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    
    // Check if it's a connection refused error
    if (err.code === 'ECONNREFUSED') {
      let targetPort = 'unknown';
      
      // Try to extract port from error message or address
      if (err.address && err.address.includes(':')) {
        targetPort = err.address.split(':')[1];
      } else if (err.message && err.message.includes(':')) {
        const match = err.message.match(/:(\d+)/);
        if (match) {
          targetPort = match[1];
        }
      } else if (err.errors && err.errors.length > 0) {
        // Handle AggregateError
        const firstError = err.errors[0];
        if (firstError.address && firstError.address.includes(':')) {
          targetPort = firstError.address.split(':')[1];
        } else if (firstError.message && firstError.message.includes(':')) {
          const match = firstError.message.match(/:(\d+)/);
          if (match) {
            targetPort = match[1];
          }
        }
      }
      
      res.status(503).json({ 
        error: 'Service Unavailable', 
        message: `Target service on port ${targetPort} is not running`,
        details: 'Please make sure the target application is started',
        target: {
          port: targetPort,
          error: err.message,
          code: err.code
        }
      });
    } else {
      res.status(500).json({ 
        error: 'Proxy Error', 
        message: err.message,
        code: err.code
      });
    }
  }
};

// Login App Proxy - Route /login to port 1225
app.use('/login', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${LOGIN_PORT}`,
  pathRewrite: {
    '^/login': '/login'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Handle trailing slash issue
    if (proxyReq.path === '//') {
      proxyReq.path = '/login/';
    }
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    // Log original and rewritten paths for debugging
    console.log(`Original path: ${req.url}, Rewritten path: ${proxyReq.path}`);
  }
}));

// Handle all static files and Vite development server files for Login App
app.use(['/node_modules', '/@vite', '/@react-refresh', '/src', '/public', '/assets'], createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${LOGIN_PORT}`,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying static file: ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// GIS-FE App Proxy - Route /gis-fe to port 9000
app.use('/gis-fe', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${GIS_FE_PORT}`,
  pathRewrite: {
    '^/gis-fe': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Handle static files for GIS-FE App
app.use(['/gis-fe/node_modules', '/gis-fe/@vite', '/gis-fe/src', '/gis-fe/public', '/gis-fe/assets'], createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${GIS_FE_PORT}`,
  pathRewrite: {
    '^/gis-fe/(.*)': '/$1'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying GIS-FE static file: ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Handle static files for GIS-FE App (peta route)
app.use('/peta', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${GIS_FE_PORT}`,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying GIS-FE peta: ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Portal Data App Proxy - Route /portal to port 5500
app.use('/portal', createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${PORTALDATA_PORT}`,
  pathRewrite: {
    '^/portal': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Handle static files for Portal Data App
app.use(['/portal/static', '/portal/manifest.json', '/portal/favicon.ico'], createProxyMiddleware({
  ...proxyOptions,
  target: `http://${PROXY_HOST}:${PORTALDATA_PORT}`,
  pathRewrite: {
    '^/portal/(.*)': '/$1'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying Portal Data static file: ${req.method} ${req.url} to ${proxyReq.path}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    proxy: {
      port: PROXY_PORT,
      host: PROXY_HOST,
      ssl: USE_SSL
    },
    services: {
      login: `${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/login`,
      gis_fe: `${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/gis-fe`,
      portaldata: `${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/portal`
    },
    targets: {
      login: `http://${PROXY_HOST}:${LOGIN_PORT}`,
      gis_fe: `http://${PROXY_HOST}:${GIS_FE_PORT}`,
      portaldata: `http://${PROXY_HOST}:${PORTALDATA_PORT}`
    }
  });
});

// Service status check endpoint
app.get('/status', async (req, res) => {
  const http = require('http');
  
  const checkService = (port) => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: PROXY_HOST,
        port: port,
        path: '/',
        method: 'GET',
        timeout: 3000
      }, (res) => {
        resolve({ port, status: 'running', code: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ port, status: 'down', code: null });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ port, status: 'timeout', code: null });
      });
      
      req.end();
    });
  };
  
  const results = await Promise.all([
    checkService(LOGIN_PORT),
    checkService(GIS_FE_PORT),
    checkService(PORTALDATA_PORT)
  ]);
  
  res.json({
    timestamp: new Date().toISOString(),
    services: {
      login: results[0],
      gis_fe: results[1],
      portaldata: results[2]
    }
  });
});

// Default route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const startServer = () => {
  const server = USE_SSL ? https.createServer({
    cert: fs.readFileSync(SSL_CERT_PATH),
    key: fs.readFileSync(SSL_KEY_PATH)
  }, app) : http.createServer(app);

  server.listen(PROXY_PORT, () => {
    console.log(`🚀 ${USE_SSL ? 'HTTPS' : 'HTTP'} Proxy Server running on ${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}`);
    console.log(`📱 Login App: ${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/login`);
    console.log(`🗺️  GIS-FE App: ${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/gis-fe`);
    console.log(`📊 Portal Data: ${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/portal`);
    console.log(`❤️  Health Check: ${USE_SSL ? 'https' : 'http'}://${PROXY_HOST}:${PROXY_PORT}/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PROXY_PORT} is already in use!`);
      console.error('💡 Please stop the existing process or change the port in .env file');
      console.error('   To kill the process: lsof -ti:1500 | xargs kill -9');
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

startServer(); 