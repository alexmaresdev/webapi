import { Category } from "../../categories/entities/category.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'varchar', length: 80})
    name: string

    @Column({type: 'varchar', length: 200, nullable:true, default:'default.svg'})
    image: string

    @Column({type: 'decimal'})
    price: number

    @Column({type: 'int'})
    inventory: number

    @ManyToOne(()=> Category)
    category: Category

}
