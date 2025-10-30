import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function ormConfig(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCRONIZE: false,
    ENTITIES: [__dirname + '/domain/*.entity{.ts,.js}'],
    MIGRATIONS: [__dirname + '/migrations/**/*{.ts,.js}'],
    MIGRATIONS_RUN: false,
  };

  return {
    name: 'default',
    type: 'mysql',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    logging: false,
    synchronize: commonConf.SYNCRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
  };
}

function ormConfig_weathersi(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCRONIZE: false,
    ENTITIES: [__dirname + '/weathersi/entities/*.entity{.ts,.js}'],
    MIGRATIONS: [__dirname + '/weathersi/migrations/**/*{.ts,.js}'],
    MIGRATIONS_RUN: false,
  };

  return {
    name: 'weathersi',
    type: 'mysql',
    database: process.env.DB_NAME_WEATHERSI,
    host: process.env.DB_HOST_WEATHERSI,
    port: Number(process.env.DB_PORT_WEATHERSI),
    username: process.env.DB_USER_WEATHERSI,
    password: process.env.DB_PASS_WEATHERSI,
    logging: true,
    synchronize: commonConf.SYNCRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
  };
}

function ormConfig_weathersr(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCRONIZE: false,
    ENTITIES: [__dirname + '/weathersr/entities/*.entity{.ts,.js}'],
    MIGRATIONS: [__dirname + '/migrations/**/*{.ts,.js}'],
    MIGRATIONS_RUN: false,
  };

  return {
    name: 'weathersr',
    type: 'mysql',
    database: process.env.DB_NAME_WEATHERSR,
    host: process.env.DB_HOST_WEATHERSR,
    port: Number(process.env.DB_PORT_WEATHERSR),
    username: process.env.DB_USER_WEATHERSR,
    password: process.env.DB_PASS_WEATHERRI,
    logging: true,
    synchronize: commonConf.SYNCRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
  };
}

export { ormConfig, ormConfig_weathersi, ormConfig_weathersr };
