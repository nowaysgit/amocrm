import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DataService } from './data.service';
import { AmocrmService } from './amocrm.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tokens } from './models/tokens.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('DB_DIALECT'),
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: true,
        ssl: configService.get<boolean>('DB_SSL'),
        dialectOptions: {
          ssl: {
            require: configService.get<boolean>('DB_SSL'),
            rejectUnauthorized: false,
          },
        },
        models: [Tokens],
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    SequelizeModule.forFeature([Tokens]),
  ],
  controllers: [AppController],
  providers: [AppService, DataService, AmocrmService],
})
export class AppModule {}
