import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarritoabandonadoModule } from './carritoabandonado/carritoabandonado.module';

@Module({
  imports: [CarritoabandonadoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
