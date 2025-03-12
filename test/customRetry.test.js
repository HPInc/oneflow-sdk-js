require('should');
const _ = require('lodash');
const sinon = require('sinon');
const axiosRetry = require('axios-retry');
const { isRetryableError, exponentialDelay, isTooManyRequestsError } = require('../lib/customRetry');

describe('CustomRetry', function () {
    const stubs = {
        isNetworkOrIdempotentRequestError: sinon.stub(axiosRetry, 'isNetworkOrIdempotentRequestError')
    };

    afterEach(() => {
        Object.values(stubs).forEach(stub => stub.restore());
    });

    describe('isRetryableError', () => {
        it('should retry network or idempotent request', async () => {
            stubs.isNetworkOrIdempotentRequestError.returns(true);
            const error = { message: 'request failed', response: { status: 500 } };
            const shouldRetry = isRetryableError(error);
            shouldRetry.should.be.equal(true);
        });

        it('should retry 429 error', async () => {
            stubs.isNetworkOrIdempotentRequestError.returns(false);
            const error = { message: 'request failed', response: { status: 429 } };
            const shouldRetry = isRetryableError(error);
            shouldRetry.should.be.equal(true);
        });

        it('should not retry non network nor idempotent errors different than 429', async () => {
            stubs.isNetworkOrIdempotentRequestError.returns(false);
            const error = { message: 'request failed', response: { status: 500 } };
            const shouldRetry = isRetryableError(error);
            shouldRetry.should.be.equal(false);
        });
    });

    describe('exponentialDelay', () => {
        it('should retry in less than a second for non 429 errors', async () => {
            const error = { message: 'request failed', response: { status: 500 } };
            const delay = exponentialDelay(1, error);
            delay.should.be.below(1000);
        });

        it('should increment retry time in succesive calls', async () => {
            const error = { message: 'request failed', response: { status: 500 } };
            const firstDelay = exponentialDelay(1, error);
            const seconDelay = exponentialDelay(2, error);
            firstDelay.should.be.below(seconDelay);
        });

        it('should retry in more than 30 seconds and less than a minute for 429 errors', async () => {
            const error = { message: 'request failed', response: { status: 429 } };
            const delay = exponentialDelay(1, error);
            delay.should.be.above(1000 * 30);
            delay.should.be.below(1000 * 60);
        });        
        
        it('should increment retry time for 429 error in succesive calls', async () => {
            const error = { message: 'request failed', response: { status: 429 } };
            const firstDelay = exponentialDelay(1, error);
            const seconDelay = exponentialDelay(2, error);
            firstDelay.should.be.below(seconDelay);
        });
    });
    
    describe('isTooManyRequestsError', () => {
        it('should return false if error is not defined', done => {
            const result = isTooManyRequestsError();
            result.should.equal(false);
            done();
        });
        
        it('should return false if response is not defined', done => {
            const result = isTooManyRequestsError({});
            result.should.equal(false);
            done();
        });
        
        it('should return false if status is not defined', done => {
            const result = isTooManyRequestsError({ response: {} });
            result.should.equal(false);
            done();
        });
        
        it('should return false if status is not equal 429', done => {
            const result = isTooManyRequestsError({ response: { status: 400 } });
            result.should.equal(false);
            done();
        });
        
        it('should return true if status is equal 429', done => {
            const result = isTooManyRequestsError({ response: { status: 429 } });
            result.should.equal(true);
            done();
        });
    });
});
