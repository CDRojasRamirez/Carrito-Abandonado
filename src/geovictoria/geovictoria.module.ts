import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeovictoriaController } from './geovictoria.controller';
import { GeovictoriaService } from './geovictoria.service';
import { Geovictoria } from './entities/geovictoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Geovictoria]),
  ],
  controllers: [GeovictoriaController],
  providers: [GeovictoriaService],
})
export class GeovictoriaModule {}
