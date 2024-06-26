import {  VerifyProductQuantity } from 'src/internal/application/useCases/product';
import { makeEventEmitter } from 'tests/stubs/event-emitter.stub';
import { makeProductRepository } from 'tests/stubs/product-repository.stub';

const makeSut = () => {
    const productRepository = makeProductRepository()
    const eventEmitter = makeEventEmitter()
    const verifyProductQuantity = new VerifyProductQuantity(productRepository, eventEmitter)
    return {
        productRepository,
        eventEmitter,
        verifyProductQuantity
    }
}

describe('Verify Product Quantity Use Case', () => {
    it('should call productRepository.findOne with correct params', async () => {
        const { verifyProductQuantity, productRepository, eventEmitter } = makeSut()
        const findOneSpy = jest.spyOn(productRepository, "findOne")
        const emitSpy = jest.spyOn(eventEmitter, "emit")
        
        const productsToVerifyMock = [{
            id: "id-product",
            quantity: 1,
            price: 2
        }]
        
        await verifyProductQuantity.execute(productsToVerifyMock)

        expect(findOneSpy).toBeCalled()
        expect(findOneSpy).toBeCalledWith(productsToVerifyMock[0].id)
        expect(emitSpy).toBeCalled()        
    });
    it('should throw NotFoundException when product not exists', async () => { 
        const { verifyProductQuantity, productRepository } = makeSut()
        jest.spyOn(productRepository, "findOne").mockReturnValueOnce(null)
                
        const productsToVerifyMock = [{
            id: "id-product",
            quantity: 1,
            price: 2
        }]
        
        try {
            await verifyProductQuantity.execute(productsToVerifyMock)
        } catch(err) {
            expect(err).toBeTruthy()
            expect(err.message).toEqual('Product not found.')
        } 

    });
    it('should throw DomainException when product quantity is less than zero', async () => {
        const { verifyProductQuantity, productRepository } = makeSut()
        jest.spyOn(productRepository, "findOne")
                
        const productsToVerifyMock = [{
            id: "id-product",
            quantity: 3,
            price: 2
        }]
        
        try {
            await verifyProductQuantity.execute(productsToVerifyMock)
        } catch(err) {
            expect(err).toBeTruthy()
            expect(err.message).toEqual('Product quantity is not enough.')
        }      
    });
});
