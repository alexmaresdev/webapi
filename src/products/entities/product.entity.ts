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

    // If you haven't explicitly defined precision and scale in your entity's @Column decorator for price, 
    // TypeORM might be using default values that result in a scale of 0 in your database.
    @Column({type: 'decimal', precision:10, scale:2})
    price: number    

    @Column({type: 'int'})
    inventory: number

    @ManyToOne(()=> Category)
    category: Category

    @Column({type: 'int'})
    categoryId: number

}
