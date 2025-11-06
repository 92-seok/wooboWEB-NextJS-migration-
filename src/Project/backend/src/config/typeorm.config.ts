import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const commonConf = {
  SYNCRONIZE: true,
  autoLoadEntities: true,
  //ENTITIES: ['/weathersr/entities/*.entity{.ts,.js}'],
  //MIGRATIONS: [__dirname + '/weathersi/migrations/**/*{.ts,.js}'],
  //MIGRATIONS_RUN: false,
};

function ormConfig_default(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: commonConf.SYNCRONIZE,
    autoLoadEntities: commonConf.autoLoadEntities,
  };
}

function ormConfig_weathersi(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    database: process.env.DB_DATABASE_WEATHERSI,
    host: process.env.DB_HOST_WEATHERSI,
    port: Number(process.env.DB_PORT_WEATHERSI),
    username: process.env.DB_USERNAME_WEATHERSI,
    password: process.env.DB_PASSWORD_WEATHERSI,
    logging: true,
    synchronize: commonConf.SYNCRONIZE,
    autoLoadEntities: commonConf.autoLoadEntities,
  };
}

function ormConfig_weathersr(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    database: process.env.DB_DATABASE_WEATHERSR,
    host: process.env.DB_HOST_WEATHERSR,
    port: Number(process.env.DB_PORT_WEATHERSR),
    username: process.env.DB_USERNAME_WEATHERSR,
    password: process.env.DB_PASSWORD_WEATHERSR,
    logging: true,
    autoLoadEntities: true,
    synchronize: commonConf.SYNCRONIZE,
  };
}

export { ormConfig_default, ormConfig_weathersi, ormConfig_weathersr };
