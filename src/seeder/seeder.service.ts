import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { categories } from './data/categories';
import { products } from './data/products';

@Injectable()
export class SeederService {

    constructor(
        @InjectRepository(Category) private readonly categoryRepository : Repository<Category>,
        @InjectRepository(Product) private readonly prodcutRepository : Repository<Product>

    ) { }

    async seed() {
        await this.categoryRepository.save(categories)
        for await (const seedProduct of products) {
            const category = await this.categoryRepository.findOneBy({id: seedProduct.categoryId})
            const product = new Product
            product.name = seedProduct.name
            product.image = seedProduct.image
            product.price = seedProduct.price
            product.name = seedProduct.name
            product.inventory = seedProduct.inventory
            // Usamos el operador ! para asegurar que category no es null
            product.category = category!

            await this.prodcutRepository.save(product)
        }
    }
}
