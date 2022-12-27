const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    })

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should response with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200)
        })
    })

    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'UCC Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'January 4, 2028'
        };
        const launchDataWithoutDate = {
            mission: 'UCC Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
        };
        const launchDataWithInvalidDate = {
            mission: 'UCC Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'abc'
        };

        test('It should response with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const responseDate = new Date(response.body.launchDate).valueOf();
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        })
        test('It should catch missing date with 400', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: "Missing required launch property",
            });
        })
        test('It should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        })
    })
})