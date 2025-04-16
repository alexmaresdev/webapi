import { IsDateString, IsInt, IsNotEmpty, Max, MAX, Min } from "class-validator"

export class CreateCouponDto {
   
    @IsNotEmpty({message: 'El nombre del cupon es obligatorio'})
    name: string

    @IsNotEmpty({message: 'El descuento no puede estar vacio'})
    @IsInt({message: 'El descuento debe estar entre 1 y 30'})
    @Max(30,{message: 'El descuento maximo es del 30%'})
    @Min(1, {message: 'El descuento minimo es del 1%'})
    percentage: number

    @IsNotEmpty({message: 'La fecha no puede ir vacia'})
    @IsDateString({}, {message: 'Fecha no valida'})
    expirationDate: Date
}
