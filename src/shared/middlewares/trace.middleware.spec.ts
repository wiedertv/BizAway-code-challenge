import { Test, TestingModule } from '@nestjs/testing';
import { TraceMiddleware } from './trace.middleware';
import { ClsService } from 'nestjs-cls';
import { Request, Response, NextFunction } from 'express';

describe('TraceMiddleware', () => {
  let middleware: TraceMiddleware;

  const mockClsService = {
    set: jest.fn(),
  };

  const mockRequest = {
    headers: {},
  } as Request;

  const mockResponse = {} as Response;
  const mockNext: NextFunction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TraceMiddleware,
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    middleware = module.get<TraceMiddleware>(TraceMiddleware);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRequest.headers = {}; // Reset headers
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should generate traceId if not present', () => {
    const mockSetHeader = jest.fn();
    mockResponse.setHeader = mockSetHeader;
    mockRequest.originalUrl = '/api/test';

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockClsService.set).toHaveBeenCalledWith(
      'traceId',
      expect.any(String),
    );
    expect(mockSetHeader).toHaveBeenCalledWith(
      'x-request-id',
      expect.any(String),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use existing traceId', () => {
    mockRequest.headers['x-request-id'] = 'existing-trace-id';
    const mockSetHeader = jest.fn();
    mockResponse.setHeader = mockSetHeader;
    mockRequest.originalUrl = '/api/test';

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockClsService.set).toHaveBeenCalledWith(
      'traceId',
      'existing-trace-id',
    );
    expect(mockSetHeader).toHaveBeenCalledWith(
      'x-request-id',
      'existing-trace-id',
    );
    expect(mockNext).toHaveBeenCalled();
  });
});
