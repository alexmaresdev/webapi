import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CouponsService {

  // Inyectamos el repositorio
  constructor(
    @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>
  ) {}

  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto)
  }

  findAll() {
    return this.couponRepository.find()
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({id})
    if (!coupon) {
      throw new NotFoundException(`El cupon con el Id: ${id} no existe`)
    }
    return coupon
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
