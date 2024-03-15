import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { CarritoabandonadoService } from './carritoabandonado.service';
import {
  DataVtexDto,
  DataCompraVtexDto,
} from './dto/create-carritoabandonado.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('carritoabandonado')
export class CarritoabandonadoController {
  constructor(
    private readonly carritoabandonadoService: CarritoabandonadoService,
  ) {}

  @Post('/enviar-data')
  @UsePipes(new ValidationPipe())
  async obtenerDetallesDelProducto(@Body() dataVtexDto: DataVtexDto) {
    try {
      const productDetails =
        await this.carritoabandonadoService.getProductDetails(dataVtexDto);
      return { productDetails };
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  }
  @Post('/actualizar-data')
  @UsePipes(new ValidationPipe())
  async actualizarDetallesDelProducto(
    @Body() dataCompraVtexDto: DataCompraVtexDto,
  ) {
    try {
      const productDetails =
        await this.carritoabandonadoService.updateProductDetails(
          dataCompraVtexDto,
        );
      return productDetails;
    } catch (error) {
      return { error: error.message };
    }
  }
}
