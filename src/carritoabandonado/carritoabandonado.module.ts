import { Module } from '@nestjs/common';
import { CarritoabandonadoService } from './carritoabandonado.service';
import { CarritoabandonadoController } from './carritoabandonado.controller';

@Module({
  controllers: [CarritoabandonadoController],
  providers: [CarritoabandonadoService],
})
export class CarritoabandonadoModule {}
