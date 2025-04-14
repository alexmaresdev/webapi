import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ){}


  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({id: createProductDto.categoryId}) 

    if (!category) {
      let errors: string[] = []
      errors.push('La categoria no existe')
      throw new NotFoundException(errors)      
    }

    return this.productRepository.save({
      ...createProductDto,
      category
    })
    console.log(Product)
   
  }

  // Modificación importante:  categoryId ahora es opcional (number | undefined)
  // En TypeScript, todos los parámetros opcionales deben ir al final.
  async findAll(take: number, categoryId?: number, skip?: number) {
    const where: any = {}; // Inicializamos un objeto vacío para las condiciones del WHERE

    if (categoryId !== undefined) {
      // Si categoryId tiene un valor, lo agregamos a las condiciones
      where.category = { id: categoryId };
    }

    const [products, total] = await this.productRepository.findAndCount({
      relations: {
        category: true,
      },
      where, // Usamos el objeto 'where' para aplicar el filtro
      order: {
        id: 'DESC',
      },
      take,
      skip
    });
    return {
      products,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
