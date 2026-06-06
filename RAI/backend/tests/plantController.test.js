const plantController = require('../controllers/plantController');
const Plant = require('../models/Plant');

jest.mock('../models/Plant'); // Mock the Plant model

describe('Plant Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            file: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('list should return all plants', async () => {
        const mockPlants = [
            { name: 'Rose', price: '10' },
            { name: 'Tulip', price: '8' }
        ];
        // Mock Plant.find to resolve to mockPlants
        Plant.find = jest.fn().mockResolvedValue(mockPlants);

        await plantController.list(req, res);

        expect(Plant.find).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(mockPlants);
    });

    test('show should return a plant by ID', async () => {
        const mockPlant = { name: 'Rose', price: '10' };
        req.params.id = '123';
        Plant.findById = jest.fn().mockResolvedValue(mockPlant);

        await plantController.show(req, res);

        expect(Plant.findById).toHaveBeenCalledWith('123');
        expect(res.json).toHaveBeenCalledWith(mockPlant);
    });

    test('show should return 404 if plant does not exist', async () => {
        req.params.id = '123';
        Plant.findById = jest.fn().mockResolvedValue(null);

        await plantController.show(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Rastlina ne obstaja.' });
    });
});
