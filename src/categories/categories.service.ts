import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository : Repository<Category>
  ){}

  create(createCategoryDto: CreateCategoryDto) {    
    return this.categoryRepository.save(createCategoryDto);  
  }

  findAll() {
    return this.categoryRepository.find(); 
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({id});
    if(!category) {
      throw new NotFoundException('La categoria no existe');
    }
    return category;    
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
