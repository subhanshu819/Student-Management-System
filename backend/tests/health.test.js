import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/health — System Health & Service Status', () => {
  it('should return 200 OK with operational service status and metadata', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'student-management-api');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
    assert.ok(res.body.timestamp);
    assert.ok(res.body.database);
    assert.ok(typeof res.body.database.connected === 'boolean');
    assert.ok(['connected', 'disconnected', 'connecting', 'unknown'].includes(res.body.database.state));
  });

  it('should return 404 for undefined routes outside /api', async () => {
    const res = await request(app).get('/non-existent-endpoint-random');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Endpoint not found'));
  });
});
