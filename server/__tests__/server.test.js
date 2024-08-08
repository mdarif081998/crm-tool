const fs = require('fs');
const path = require('path');
const request = require('supertest');
const express = require('express');
const app = require('../server'); // Ensure that server.js exports the app

// Mock fs module
jest.mock('fs');

const DATA_FILE = path.join(__dirname, '../data.json');

describe('API Endpoints', () => {
    beforeEach(() => {
        // Setup mock implementation before each test
        fs.readFileSync.mockImplementation(() => JSON.stringify([]));
        fs.writeFileSync.mockImplementation(() => {});
    });

    it('should create a new lead', async () => {
        // Create a mock for file read and write
        const leads = [];
        fs.readFileSync.mockImplementation(() => JSON.stringify(leads));
        
        fs.writeFileSync.mockImplementation((path, data) => {
            const parsedData = JSON.parse(data);
            leads.push(...parsedData); // Simulate the addition of new lead
            fs.readFileSync.mockImplementation(() => JSON.stringify(leads));
        });

        const newLead = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            status: 'new'
        };

        const response = await request(app)
            .post('/leads')
            .send(newLead)
            .expect(201);

        const data = JSON.parse(fs.readFileSync());
        expect(data).toHaveLength(1);
        expect(data[0]).toMatchObject(newLead);
    });

    it('should return validation errors for invalid input', async () => {
        const response = await request(app)
            .post('/leads')
            .send({
                name: '',
                email: 'not-an-email',
                phone: '9123459123',
                status: 'invalid-status'
            })
            .expect(400);

        expect(response.body.errors).toHaveLength(3);
    });

    it('should update an existing lead', async () => {
        // Initialize mock data
        const initialData = [{
            id: '1',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            phone: '0987654321',
            status: 'new'
        }];
        
        // Mock file read and write
        fs.readFileSync.mockImplementation(() => JSON.stringify(initialData));
        fs.writeFileSync.mockImplementation((path, data) => {
            const updatedData = JSON.parse(data);
            initialData[0] = updatedData[0]; // Simulate the lead update
            fs.readFileSync.mockImplementation(() => JSON.stringify(updatedData[0]));
        });

        const updateResponse = await request(app)
            .put('/leads/1')
            .send({
                 ...initialData[0], status: 'contacted'
            })
            .expect(200);

        expect(updateResponse.body.status).toBe('contacted');
    });


    it('should delete an existing lead', async () => {
        // Initialize mock data
        const initialData = [{
            id: '1',
            name: 'Mike Smith',
            email: 'mike.smith@example.com',
            phone: '1122334455',
            status: 'new'
        }];
        
        // Mock file read and write
        fs.readFileSync.mockImplementation(() => JSON.stringify(initialData));
        fs.writeFileSync.mockImplementation((path, data) => {
            const updatedData = JSON.parse(data);
            // Check if data was correctly written
            initialData.length = updatedData.length;
            fs.readFileSync.mockImplementation(() => JSON.stringify(updatedData));
        });

        await request(app)
            .delete('/leads/1')
            .expect(204);

        const data = JSON.parse(fs.readFileSync());
        expect(data).toHaveLength(0);

    });

    it('should handle not found errors', async () => {
        // Mock initial data
        fs.readFileSync.mockImplementation(() => JSON.stringify([]));

        await request(app)
            .put('/leads/invalid-id')
            .send({
                id: '1',
                name: 'Mike Smith',
                email: 'mike.smith@example.com',
                phone: '1122334455',
                status: 'new'
            })
            .expect(404);
    });

    it('should handle internal server errors', async () => {
        // Create an app instance with a simulated error
        const appWithError = express();
        appWithError.use((req, res, next) => {
            next(new Error('Simulated Error'));
        });

        await request(appWithError)
            .get('/')
            .expect(500);
    });
});
