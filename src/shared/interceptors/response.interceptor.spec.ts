/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseInterceptor } from './response.interceptor';
import { ClsService } from 'nestjs-cls';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  const mockClsService = {
    get: jest.fn().mockReturnValue('trace-id-123'),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      getRequest: jest.fn().mockReturnValue({ url: '/api/trips' }),
    }),
  };

  const mockCallHandler: CallHandler = {
    handle: jest.fn().mockReturnValue(of({ some: 'data' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseInterceptor,
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    interceptor = module.get<ResponseInterceptor<any>>(ResponseInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response', (done) => {
    interceptor
      .intercept(
        mockExecutionContext as unknown as ExecutionContext,
        mockCallHandler,
      )
      .subscribe({
        next: (result) => {
          expect(result).toEqual({
            data: { some: 'data' },
            meta: {
              timestamp: expect.any(String),
              traceId: 'trace-id-123',
            },
            statusCode: 200,
            message: 'Operation successful',
          });
          done();
        },
        error: (err: any) => {
          done(err);
        },
      });
  });
});
