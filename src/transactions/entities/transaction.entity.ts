import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'decimal', precision: 10, scale:2})
    total: number

    // Revisar mi version de MySQL @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    @Column({type: 'timestamp', default:()=> "CURRENT_TIMESTAMP"})
    transactionDate: Date
   
}
