import  createDbSchemas  from './createDbSchemas.js';
import { defaultTables } from '../config/constants.js';
import { dbConfigObj } from '../config';
import { Client } from 'pg';

jest.mock('pg', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        query: jest.fn().mockResolvedValueOnce({}),
        end: jest.fn().mockResolvedValueOnce({}),
      };
    }),
  };
});

describe('createDbSchemas', () => {
  const mockQuery = jest.fn();
  const mockEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the db client
    Client.mockImplementationOnce(() => ({
      query: mockQuery,
      end: mockEnd,
    }));
  });

  it('should create schemas successfully', async () => {
    await createDbSchemas();

    expect(mockQuery).toHaveBeenCalledTimes(defaultTables.length);
    defaultTables.forEach((schema, index) => {
      const expectedQuery = `CREATE SCHEMA IF NOT EXISTS ${schema} AUTHORIZATION ${dbConfigObj.user || process.env.DB_USERNAME || "postgres"};`;
      expect(mockQuery).nthCalledWith(index + 1, expectedQuery);
    });

    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when creating schemas', async () => {
    const error = new Error('Mocked error');
    mockQuery.mockRejectedValueOnce(error);

    await expect(createDbSchemas()).rejects.toThrowError(error);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  it('should end the database connection even if an error occurs', async () => {
    const error = new Error('Mocked error');
    mockQuery.mockRejectedValueOnce(error);

    try {
      await createDbSchemas();
    } catch (err) {
      expect(err).toBe(error);
    }

    expect(mockEnd).toHaveBeenCalledTimes(1);
  });
});
