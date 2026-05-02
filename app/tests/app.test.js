const request = require('supertest');
const express = require('express');

const app = require('../server');

describe('DevOps App Tests', () => {

    test('GET / should return 200', async () => {

        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);

    });

    test('GET /health should return status UP', async () => {

        const response = await request(app).get('/health');

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe('UP');

    });

    test('GET /metrics should return prometheus metrics', async () => {

        const response = await request(app).get('/metrics');

        expect(response.statusCode).toBe(200);

        expect(response.text).toContain('process_cpu_user_seconds_total');

    });

});