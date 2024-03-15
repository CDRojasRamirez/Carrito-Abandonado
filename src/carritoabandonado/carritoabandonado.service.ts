import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  DataVtexDto,
  DataCompraVtexDto,
  Item,
  Datasend,
  Postsend,
} from './dto/create-carritoabandonado.dto';
import * as moment from 'moment';

@Injectable()
export class CarritoabandonadoService {
  constructor() {}

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.auth.marketingcloudapis.com/v2/token',
        {
          grant_type: 'client_credentials',
          client_id: 'rhcpyzt0o6ks3c2qzcpy47x1',
          client_secret: 'QkngX4gxSXSGUcuD2BvWHZHB',
        },
      );
      console.log(response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      throw new Error('Error al obtener el token de acceso');
    }
  }
  async getProductDetails(dataVtexDto: DataVtexDto): Promise<Postsend[]> {
    try {
      const accessToken = await this.getAccessToken();
      const rclastcart = dataVtexDto.rclastcart;
      const phone = dataVtexDto.phone;
      const matches = rclastcart.match(/sku=([^&]+)/g);
      const accountId = dataVtexDto.accountId;
      const sessionDate = moment(dataVtexDto.rclastsessiondate).format(
        'YYYY-MM-DD',
      );
      const email = dataVtexDto.email;
      const skus = matches ? matches.map((match) => match.split('=')[1]) : [];
      if (!skus.length) {
        return;
      }
      const productDetailsPromises = skus.map(async (skuValue: string) => {
        const response = await axios.get(
          `https://footloose.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${skuValue}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const profile = await axios.get(
          `https://footloose.myvtex.com/api/checkout/pub/profiles?email=${email}&ensureComplete=false`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const dni = profile?.data?.userProfile?.document || '00000000';
        const productName = response?.data[0]?.productName;
        const imageUrl = response.data[0].items[0].images[0].imageUrl;
        let listPrice =
          response.data[0].items[0].sellers[0].commertialOffer.ListPrice;
        const price =
          response.data[0].items[0].sellers[0].commertialOffer.Price;
        if (listPrice === price) {
          listPrice = '';
        }

        return {
          dni,
          productName,
          imageUrl,
          listPrice,
          price,
          sku: skuValue,
          flag: false,
        };
      });
      const productDetails = await Promise.all(productDetailsPromises);
      await this.sendDataToEndpoint(
        productDetails,
        phone,
        email,
        accountId,
        sessionDate,
        accessToken,
      );
      return productDetails;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async sendDataToEndpoint(
    productDetails: Postsend[],
    phone: string,
    email: string,
    accountId: string,
    sessionDate: string,
    accessToken: string,
  ): Promise<void> {
    try {
      const apiEvent = 'APIEvent-873bb9e4-ea34-39cf-e81c-694e8d241086';
      const dataDetalles_CarritoAbandonado = {
        items: productDetails.map((product: Postsend) => {
          return {
            email,
            productName: product.productName,
            imageUrl: product.imageUrl,
            listPrice: product.listPrice,
            price: product.price,
            sku: product.sku,
            sessionDate,
            flag: product.flag,
          };
        }),
      };
      const dni = productDetails[0].dni;
      const dataPrincipal_CarritoAbandonado = {
        ContactKey: email,
        EventDefinitionKey: apiEvent,
        Data: {
          dni,
          email,
          accountId,
          flag: false,
          phone,
        },
      };
      console.log(dataPrincipal_CarritoAbandonado);
      const res = await axios.post(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:281AFE6D-7146-41AC-9CAE-CA0E3F5CC0EC/rows',
        dataDetalles_CarritoAbandonado,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log(res);
      const accessToken2 = await this.getAccessToken();
      console.log(accessToken);
      console.log(accessToken2);
      const res2 = await axios
        .post(
          'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/interaction/v1/events',
          dataPrincipal_CarritoAbandonado,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .catch((err) => console.log(err));
      console.log(res2);
    } catch (error) {
      throw new Error('Error al enviar los datos al endpoint');
    }
  }
  async updateProductDetails(
    dataCompraVtexDto: DataCompraVtexDto,
  ): Promise<Datasend[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (dataCompraVtexDto.State === 'invoiced') {
        const orderId = dataCompraVtexDto.OrderId;
        const response = await axios.get(
          `https://footloose.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
              'X-VTEX-API-AppKey': 'vtexappkey-passarelape-QPQROX',
              'X-VTEX-API-AppToken':
                'RZXREUHANNXUWVJVHAWQAZIGNCBBSSYFFCVHCQXCAUXBYOGBJTJYICSORWLZKDYDWHHQTQLPVSGAWUVCQNLLCVDJRQPXTPPLLEQKILXGICLZDJNRYRHCLCMPWZVTMCZH',
            },
          },
        );

        const skus = response.data.items.map((item: Item) => item.sellerSku);
        const dni = response.data.clientProfileData.document || '00000000';
        if (!skus.length) {
          return;
        }
        const productDetailsPromises = skus.map(async (skuValue: string) => {
          return {
            dni: dni,
            email: response.data.clientProfileData.email,
            sku: skuValue,
            flag: true,
          };
        });
        const productDetails = await Promise.all(productDetailsPromises);
        await this.updateDataToEndpoint(productDetails, accessToken);
        return productDetails;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  private async updateDataToEndpoint(
    productDetails: Datasend[],
    accessToken: string,
  ): Promise<void> {
    try {
      const dataUpdatePrincipal_CarritoAbandonado = {
        items: [
          {
            email: productDetails[0].email,
            flag: true,
          },
        ],
      };
      const dataUpdateDetalles_CarritoAbandonado = {
        items: productDetails.map((product: Datasend) => {
          return {
            email: product.email,
            sku: product.sku,
            flag: true,
          };
        }),
      };
      const response = await axios.put(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:281AFE6D-7146-41AC-9CAE-CA0E3F5CC0EC/rows',
        dataUpdateDetalles_CarritoAbandonado,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log(response);
      if (response && response.status === 202) {
        const requestId = response.data.requestId;
        console.log('ID de solicitud:', requestId);
        const res = await axios.get(
          `https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/${requestId}/results`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        console.log(res.data);
      }

      const response2 = await axios.put(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:FA6F3610-AE27-45DA-83B5-E7A868AFDA60/rows',
        dataUpdatePrincipal_CarritoAbandonado,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log(response2);
      console.log('Datos enviados correctamente al endpoint.');
      return response.data;
    } catch (error) {
      console.error('Error al enviar los datos al endpoint:', error);
      throw error;
    }
  }
}
