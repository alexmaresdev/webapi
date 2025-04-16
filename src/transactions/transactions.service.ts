import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>

  ) { }

  async create(createTransactionDto: CreateTransactionDto) {
    // Creamos un transaction con TypeORM para primero confirmar la existencia de los prodcutos para poder generar la venta
    await this.productRepository.manager.transaction(async (transactionEntityManager) => {
      const transaction = new Transaction()
      // Vamos a manejar el pago total por los contenidos
      const total = createTransactionDto.contents.reduce((total, item)=> total + (item.quantity * item.price), 0)      
      transaction.total = total
      await transactionEntityManager.save(transaction)

      for (const contents of createTransactionDto.contents) {
        // findOne en TypeORM v0.3+ ya no acepta directamente condiciones como {id: 1}, sino que requiere explícitamente la propiedad where
        // const product = await this.productRepository.findOne({ where: { id: contents.productId } })
        const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId })

        // Vamos a manejar los errore en un arreglo
        const errors: string[] = []

        // Valida que el producto realmente exista antes de usarlo.
        if (!product) {
          // Manejo de errores
          errors.push(`Producto con ID ${contents.productId} no encontrado`)          
          // Lanza una excepción si no se encuentra.
          throw new NotFoundException(errors);
        }

        // Validamos que tengamos suficientes productos en el inventario
        if (contents.quantity > product.inventory) {
          // Manejo de errores
          errors.push(`El producto: ${product.name}, excede la cantidad disponible, intenta con menos`)
          throw new BadRequestException(errors)
        }
        // Descontar del inventario la cantidad de productos vendidos
        product.inventory -= contents.quantity
        // console.log(product)

        // Creamos una instancia de TransactionContents
        const transactionContent = new TransactionContents()
        transactionContent.price = contents.price
        transactionContent.product = product
        transactionContent.quantity = contents.quantity
        transactionContent.transaction = transaction

        //Luego, guarda el contenido de la transacción con confianza.
        // const transactionContent = this.transactionContentsRepository.create({
        //   ...contents,
        //   transaction,
        //   product,
        // });
        await transactionEntityManager.save(transaction)
        await transactionEntityManager.save(transactionContent)
      }
    })
    return "Venta almacendada correctamente"
  }

  findAll() {
    const options : FindManyOptions<Transaction> = {
      relations: {
        contents: true
      }
    }
    return this.transactionRepository.find(options)
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
