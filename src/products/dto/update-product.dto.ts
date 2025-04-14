import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    @IsNotEmpty({message: 'El nombre del producto es obligatorio'})
        @IsString({message: 'Nombre no valido'})
        name: string
}
