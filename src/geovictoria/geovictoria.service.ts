import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geovictoria } from './entities/geovictoria.entity';
import axios from 'axios';

@Injectable()
export class GeovictoriaService {
  private token: string;

  constructor(
    @InjectRepository(Geovictoria)
    private geoVictoriaRepository: Repository<Geovictoria>  ) {}

  async obtenerToken() {
    const url = 'https://customerapi-sandbox.geovictoria.com/api/v1/Login';
    const body = {
      User: '4367de', 
      Password: 'f1b2026c', 
    };

    try {
      const response = await axios.post(url, body);
      this.token = response.data.token;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  }


  async obtenerMarcacionesPorDni(idPersona: string, fecha: string) {
    await this.obtenerToken();
try{
    const marcaciones = await this.geoVictoriaRepository.query(`EXEC ObtenerMarcaciones @idPersona = '${idPersona}', @fecha = '${fecha}'`);
    for (const marcacion of marcaciones) {
      try{
      await this.enviarMarcacionPorDni(marcacion,idPersona,fecha);
    }
    catch (error) {
      console.error('Error al enviar la marcación:', error);
        continue;
    }
    console.log(marcaciones);
    return marcaciones;
  }}
 catch (error) {
  console.error('Error al obtener las marcaciones:', error);
  throw error; 
}}


  async obtenerMarcacionesPorFechaInicioFechaFin(fechaInicio: string, fechaFin: string) {
    await this.obtenerToken();
  
    try {
      const marcaciones = await this.geoVictoriaRepository.query(`EXEC ObtenerMarcacionesRangoFechasSinPersonas2 @fechaInicio = '${fechaInicio}', @fechaFin = '${fechaFin}'`);
      for (const marcacion of marcaciones) {
        try {
          await this.enviarMarcacionPorRangoFechas(marcacion);
        } catch (error) {
          console.error('Error al enviar la marcación:', error);
            continue;
        }
      }
      console.log('Todas las marcaciones han sido procesadas correctamente.');
      return marcaciones;
    } catch (error) {
      console.error('Error al obtener las marcaciones:', error);
      throw error; 
    }
  }
  
  
  async enviarMarcacionPorRangoFechas(marcacion: any) {
    const { numerodocumento, fechahora, tipo } = marcacion;
    const payload = {
      Date: fechahora,
      UserIdentifier: numerodocumento,
      Type: tipo === 'ingreso' ? 'Ingreso' : 'Salida',
    };

    try {
      this.geoVictoriaRepository.query(`EXEC ActualizarEstadoMarcacionesPorDocumento @numeroDocumento = '${payload.UserIdentifier}', @fecha = '${payload.Date}'`);
      const response = await axios.post('https://customerapi-sandbox.geovictoria.com/api/v1/Punch/AddArtificial', payload, {
        headers: {
          Authorization: `Bearer ${this.token}`, 
        },
      });
      this.geoVictoriaRepository.query(`EXEC ActualizarEstadoMarcacionesPorDocumento @numeroDocumento = '${payload.UserIdentifier}', @fecha = '${payload.Date}'`);
      console.log('Respuesta de la solicitud HTTP:', response.data);
    } catch (error) {
      console.error('Error al enviar la marcación:', error);
      throw error;
    }
  }


  async enviarMarcacionPorDni(marcacion: any,idPersona:string, fecha:string) {
    const { numerodocumento, fechahora, tipo } = marcacion;
    const payload = {
      Date: fechahora,
      UserIdentifier: numerodocumento,
      Type: tipo === 'ingreso' ? 'Ingreso' : 'Salida',
    };
console.log(payload);
console.log(marcacion);
    try {
      const response = await axios.post('https://customerapi-sandbox.geovictoria.com/api/v1/Punch/AddArtificial', payload, {
        headers: {
          Authorization: `Bearer ${this.token}`, 
        },    
      });
      this.geoVictoriaRepository.query(`EXEC ActualizarEstadoMarcaciones @idPersona = '${idPersona}', @fecha = '${fecha}'`);
      console.log('Respuesta de la solicitud HTTP:', response.data);
    } catch (error) {
      console.error('Error al enviar la marcación:', error);
      throw error;
    }
  }
}
