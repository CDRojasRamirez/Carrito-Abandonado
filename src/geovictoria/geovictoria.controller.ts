import { Controller, Param, Post } from '@nestjs/common';
import { GeovictoriaService } from './geovictoria.service';

@Controller('marcaciones')
export class GeovictoriaController {
  constructor(private readonly geoVictoriaService: GeovictoriaService) {}

  @Post('/dni/:idPersona/:fecha')
  async obtenerMarcaciones(
    @Param('idPersona') idPersona: string,
    @Param('fecha') fecha: string,
  ) {
    return this.geoVictoriaService.obtenerMarcacionesPorDni(idPersona, fecha);
  }
  @Post(':fechaInicio/:fechaFin')
  async obtenerMarcacionesFechaInicioFechaFin(
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.geoVictoriaService.obtenerMarcacionesPorFechaInicioFechaFin(fechaInicio, fechaFin);
  }
}
