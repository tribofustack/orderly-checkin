import { Injectable, Inject } from '@nestjs/common';
import { CreateCustomerDto } from 'src/internal/domain/customers/dto/create-customer.dto';
import { Customer } from 'src/internal/domain/customers/entities/customer.entity';
import { ICustomerRepository } from 'src/internal/domain/customers/repositories/customer.repository';
import { IIdentifierGenerator } from 'src/internal/application/ports/tokens/id-generator';

@Injectable()
export class CreateCustomer {
    constructor(
        @Inject('CustomerRepository')
        private customerRepository: ICustomerRepository,
        @Inject('IdGenerator')
        private idGenerator: IIdentifierGenerator,
    ) { }

    async execute(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const customerExists = await this.customerRepository.findOneByCpfOrEmail(
            createCustomerDto.cpf,
            createCustomerDto.email,
        );

        if (!customerExists) {
            const customer = new Customer({
                id: this.idGenerator.generate(),
                cpf: createCustomerDto.cpf,
                email: createCustomerDto.email,
                name: createCustomerDto.name,
            });
            await this.customerRepository.create(customer);
            return customer;
        }

        const emailExists = customerExists.email
            ? { email: createCustomerDto.email }
            : null;
        const cpfExists = customerExists.cpf
            ? { cpf: createCustomerDto.cpf }
            : null;

        const customerUpdated = new Customer({
            id: customerExists.id,
            name: createCustomerDto.name,
            ...emailExists,
            ...cpfExists,
        });
        await this.customerRepository.update(customerExists.id, customerUpdated);

        return customerUpdated;
    }
}
