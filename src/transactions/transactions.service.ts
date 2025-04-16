import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';

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

  findAll(transactionDate?: string) {
    const options : FindManyOptions<Transaction> = {
      relations: {
        contents: true
      }
    }
    if (transactionDate) {
      const date = parseISO(transactionDate)
      if (!isValid(date)) {
        throw new BadRequestException('La fecha no es valida')
      }
      // Validamos el inicio y el final del dia
      const start = startOfDay(date)
      const end = endOfDay(date)
      
      options.where = {
        transactionDate: Between(start, end)
      }
    }
    return this.transactionRepository.find(options)
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id
      },
      relations: {
        contents:true
      }
    })

    // Checamos si existe la transaccion o venta
    if (!transaction) {
      throw new NotFoundException('Transaccion o venta no encontrada')
    }
    // Si todo sale bien mostramos la venta o transaccion
    return transaction
  }

  // update(id: number, updateTransactionDto: UpdateTransactionDto) {
  //   return `This action updates a #${id} transaction`;
  // }

  async remove(id: number) {
    const transaction = await this.findOne(id)

    // Existe la transaccion?
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    for(const contents of transaction.contents){
      // Checamos cuantos productos hay en la transaccion 
      const product = await this.productRepository.findOneBy({id: contents.product.id})

      // Para asegurarme de que el producto exista antes de intentar actualizar su inventario
      if(product){
        product.inventory += contents.quantity;
        await this.productRepository.save(product); // Guardar el producto actualizado
      }
      //product.inventory += contents.quantity


      const transactionContents = await this.transactionContentsRepository.findOneBy({id: contents.id})
      // Agregamos una validacion para saber si exiten los contenidos
      if (transactionContents) {
        await this.transactionContentsRepository.remove(transactionContents);
      } else {
        // Opcional: Manejar el caso en que no se encuentra el TransactionContents
        console.warn(`No se encontró TransactionContents con ID: ${contents.id} para la transacción ${id}`);
      }
      //await this.transactionContentsRepository.remove(transactionContents)
    }
    await this.transactionRepository.remove(transaction)
    return {message: 'Se eliminino la venta o transaccion'}
  }
}
