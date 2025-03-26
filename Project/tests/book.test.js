
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Book = require('../models/book');

let mongoServer;


beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});


afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});


afterEach(async () => {
    await Book.deleteMany();
});

describe('Book API', () => {
    it('should fetch all books (GET /books)', async () => {
        const book = new Book({ title: 'Sample Book', description: 'A sample book for testing' });
        await book.save();

        const res = await request(app).get('/books');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Sample Book');
    });

    
    it('should create a new book (POST /books)', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                title: 'New Book',
                description: 'Description for new book',
                imagePath: 'path/to/image.jpg'
            });
        
        expect(res.statusCode).toEqual(201);
        const bookInDb = await Book.findOne({ title: 'New Book' });
        expect(bookInDb).not.toBeNull();
        expect(bookInDb.description).toBe('Description for new book');
    });
});
