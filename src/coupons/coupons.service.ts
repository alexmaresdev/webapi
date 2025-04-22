import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';

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

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id)
    Object.assign(coupon, updateCouponDto)
    if (!coupon) {
      throw new NotFoundException(`El cupon con el Id: ${id} no existe`)
    }
    return await this.couponRepository.save(coupon)
  }

  async remove(id: number) {
    const coupon = await this.findOne(id)
    if (!coupon) {
      throw new NotFoundException(`El cupon con el Id: ${id} no existe`)
    }
    await this.couponRepository.remove(coupon)
    return {messge: 'Cupon eliminado exitosamente'}
  }

  async applyCoupon(couponName: string){
    const coupon = await this.couponRepository.findOneBy({name: couponName})
    // Validamos si existe el cupon
    if (!coupon) {
      throw new NotFoundException(`El cupon : ${couponName} no existe`)
    }

    // Validamos si el cupon no esta expirado
    const currentDate = new Date()
    const expirationDate = endOfDay(coupon.expirationDate)

    if (isAfter(currentDate, expirationDate)) {
      throw new UnprocessableEntityException('El cupon ah expirado')
    }

    return {
      message: 'Cupon valido, listo para ser usado',
      ...coupon
    }

  }



}
