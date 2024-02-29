import { Controller, Post, Put, Body, UsePipes } from '@nestjs/common';
import { CarritoabandonadoService } from './carritoabandonado.service';
import {
  DataVtexDto,
  DataCompraVtexDto,
  Item,
} from './dto/create-carritoabandonado.dto';
import { ValidationPipe } from '@nestjs/common';
import * as moment from 'moment';

@Controller('carritoabandonado')
export class CarritoabandonadoController {
  constructor(
    private readonly carritoabandonadoService: CarritoabandonadoService,
  ) {}

  @Post('/enviar-data')
  @UsePipes(new ValidationPipe())
  async obtenerDetallesDelProducto(@Body() dataVtexDto: DataVtexDto) {
    const rclastcart = dataVtexDto.rclastcart;
    const matches = rclastcart.match(/sku=([^&]+)/g);
    const sessionDate = moment(dataVtexDto.rclastsessiondate).format(
      'YYYY-MM-DD',
    );
    const skus = matches ? matches.map((match) => match.split('=')[1]) : [];
    if (!skus.length) {
      return { error: 'SKUs no encontrados en la solicitud' };
    }

    try {
      const productDetails =
        await this.carritoabandonadoService.getProductDetails(
          skus,
          dataVtexDto.email,
          dataVtexDto.accountId,
          sessionDate,
        );
      return { productDetails };
    } catch (error) {
      return { error: 'Error al obtener detalles de los productos' };
    }
  }
  @Put('/actualizar-data')
  @UsePipes(new ValidationPipe())
  async actualizarDetallesDelProducto(
    @Body() dataCompraVtexDto: DataCompraVtexDto,
  ) {
    const status = dataCompraVtexDto.status;

    if (status === 'invoiced') {
      const accountId = dataCompraVtexDto.accountId;
      const skus = dataCompraVtexDto.items.map((item: Item) => item.sellerSku);
      if (!skus.length) {
        return { error: 'SKUs no encontrados en la solicitud' };
      }
      try {
        const productDetails =
          await this.carritoabandonadoService.updateProductDetails(
            skus,
            accountId,
          );
        return productDetails;
      } catch (error) {
        return { error: 'Error al obtener detalles de los productos' };
      }
    }
    return { error: 'El status no es Invoiced.' };
  }
}
