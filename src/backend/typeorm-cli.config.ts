//import { DataSource } from 'typeorm';
//import { NmsDevice } from './src/entities/nms_device.entity';

//const AppDataSource = new DataSource ({
//  type: 'mysql',
//  host: process.env.DB_HOST,
//  port: parseInt(process.env.DB_PORT || '3306'),
//  username: process.env.DB_USERNAME,
//  password: process.env.DB_PASSWORD,
//  database: process.env.DB_DATABASE,
//  entities: [NmsDevice],
//  migrations: ['src/migrations/**/*.ts'],
//  synchronize: true, // 기존 DB이므로 false로 설정
//  logging: process.env.NODE_ENV === 'development',
//});

//module.exports = AppDataSource;
