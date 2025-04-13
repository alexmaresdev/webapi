import { Product } from "../../products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'varchar', length: 80})
    name: string

    // Una categoria va a tener multiles productos
    @OneToMany(() => Product, (Product) => Product.category, {cascade: true})
    products: Product[]

}
