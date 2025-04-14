import { IsInt, IsNumberString, IsOptional, Min } from "class-validator"

export class GetProductsQueryDto {
    
    @IsOptional()
    @IsNumberString({}, {message: 'La categoria debe ser un numero'})
    category_id?: number // Permitimos string para que Nest pueda convertirlo

    @IsOptional()    
    @IsNumberString({}, {message: 'La cantidad debe ser un numero'})
    take: number

    @IsOptional()    
    @IsNumberString({}, {message: 'La cantidad debe ser un numero'})
    skip: number

}