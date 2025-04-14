import { Product } from "../../products/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'decimal', precision: 10, scale:2})
    total: number

    // Revisar mi version de MySQL @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    @Column({type: 'timestamp', default:()=> "CURRENT_TIMESTAMP"})
    transactionDate: Date

    @OneToMany(()=> TransactionContents, (trasaction)=> trasaction.transaction)
    contents: TransactionContents[]
   
}

@Entity()
export class TransactionContents {
    @PrimaryGeneratedColumn()
    id: number

    @Column('int')
    quantity: number

    @Column({type: 'decimal', precision: 10, scale:2})
    price: number

    @ManyToOne(()=> Product, (product)=> product.id, {eager:true, cascade:true})
    product: Product

    @ManyToOne(()=> Transaction, (transaction)=> transaction.contents, {cascade:true})
    transaction: Transaction



}
