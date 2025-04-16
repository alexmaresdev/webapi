import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
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
      transaction.total = createTransactionDto.total
      await transactionEntityManager.save(transaction)

      for (const contents of createTransactionDto.contents) {

        // findOne en TypeORM v0.3+ ya no acepta directamente condiciones como {id: 1}, sino que requiere explícitamente la propiedad where
        // const product = await this.productRepository.findOne({ where: { id: contents.productId } })
        const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId })

        // Valida que el producto realmente exista antes de usarlo.
        if (!product) {
          // Lanza una excepción si no se encuentra.
          throw new Error(`Producto con ID ${contents.productId} no encontrado`);
        }

        // Validamos que tengamos suficientes productos en el inventario
        if (contents.quantity > product.inventory) {
          throw new BadRequestException(`No existen suficientes ${product.name} disponibles, intenta con menos`)
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
    return `This action returns all transactions`;
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
