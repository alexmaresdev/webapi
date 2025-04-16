import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type:'mysql',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    logging: false, // Lo deshabilitamos de momento
    // Debug Database
    // logging: true,
    entities: [join(__dirname + '../../**/*.entity.{js,ts}')]  ,
    synchronize: true    
})