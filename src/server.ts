import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json()); // Parse JSON bodies

const angularApp = new AngularNodeAppEngine();

/**
 * Mock Database
 */
interface MockRide {
  id: string;
  from: any;
  to: any;
  date: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  status: string;
  driverId: string;
  driverName: string;
}

const RIDES_DB: MockRide[] = [
  {
    id: '1',
    from: { type: 'GPS', address: 'Hostel A', coordinates: { lat: 12.0, lng: 77.0 } },
    to: { type: 'GPS', address: 'CS Block', coordinates: { lat: 12.1, lng: 77.1 } },
    date: '2024-01-20',
    time: '09:00',
    availableSeats: 3,
    totalSeats: 4,
    price: 0,
    status: 'active',
    driverId: 'd1',
    driverName: 'Alex Johnson'
  }
];

/**
 * API Endpoints
 */
app.get('/api/rides', (req, res) => {
  res.json({ data: RIDES_DB });
});

app.post('/api/rides', (req, res) => {
  const newRide = {
    ...req.body,
    id: Date.now().toString(),
    status: 'active',
    driverId: 'd1', // Mock driver
    driverName: 'Alex Johnson'
  };
  RIDES_DB.push(newRide);
  res.json({ data: newRide });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
