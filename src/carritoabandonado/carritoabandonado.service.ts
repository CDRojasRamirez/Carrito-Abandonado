import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

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
      return response.data.access_token;
    } catch (error) {
      throw new Error('Error al obtener el token de acceso');
    }
  }
  async getProductDetails(
    skus: string[],
    email: string,
    accountId: string,
    sessionDate: string,
  ): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      const productDetailsPromises = skus.map(async (skuValue: string) => {
        const response = await axios.get(
          `https://footloose.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${skuValue}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const productName = response.data[0].productName;
        const imageUrl = response.data[0].items[0].images[0].imageUrl;
        let listPrice =
          response.data[0].items[0].sellers[0].commertialOffer.ListPrice;
        const price =
          response.data[0].items[0].sellers[0].commertialOffer.Price;
        if (listPrice === price) {
          listPrice = '';
        }

        return {
          email,
          productName,
          imageUrl,
          listPrice,
          price,
          accountId,
          sku: skuValue,
          flag: false,
          sessionDate,
        };
      });
      const productDetails = await Promise.all(productDetailsPromises);
      await this.sendDataToEndpoint(
        productDetails,
        email,
        accountId,
        sessionDate,
        accessToken,
      );
      return productDetails;
    } catch (error) {
      throw new Error('Error al obtener detalles de los productos');
    }
  }

  private async sendDataToEndpoint(
    productDetails: any[],
    email: string,
    accountId: string,
    sessionDate: string,
    accessToken: string,
  ): Promise<void> {
    try {
      const dataToSend = {
        items: productDetails.map((product: any) => {
          return {
            email,
            productName: product.productName,
            imageUrl: product.imageUrl,
            listPrice: product.listPrice,
            price: product.price,
            accountId,
            sku: product.sku,
            flag: product.flag,
            fechaCarrito: sessionDate,
            sessionDate,
          };
        }),
      };

      await axios.post(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:868EFB5B-769F-46C3-9C8B-BA9CC5ACF4F7/rows',
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('Datos enviados correctamente al endpoint.');
    } catch (error) {
      throw new Error('Error al enviar los datos al endpoint');
    }
  }
  async updateProductDetails(
    skus: string[],
    accountId: string,
  ): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      const productDetailsPromises = skus.map(async (skuValue: string) => {
        return {
          accountId,
          sku: skuValue,
          flag: true,
        };
      });
      const productDetails = await Promise.all(productDetailsPromises);

      await this.updateDataToEndpoint(productDetails, accountId, accessToken);
      return productDetails;
    } catch (error) {
      throw new Error('Error al obtener detalles de los productos');
    }
  }
  private async updateDataToEndpoint(
    productDetails: any[],
    accountId: string,
    accessToken: string,
  ): Promise<AxiosResponse> {
    try {
      const dataToUpdate = {
        items: productDetails.map((product: any) => {
          return {
            accountId,
            sku: product.sku,
            flag: product.flag,
          };
        }),
      };
      const response: AxiosResponse = await axios.put(
        'https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:868EFB5B-769F-46C3-9C8B-BA9CC5ACF4F7/rows',
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response && response.status === 202) {
        const requestId = response.data.requestId;
        console.log('ID de solicitud:', requestId);
        const res: AxiosResponse = await axios.get(
          `https://mccpl-f2jqb2j21shfrqv655qlv4.rest.marketingcloudapis.com/data/v1/async/${requestId}/results`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        console.log(res.data);
      }
      console.log('Datos enviados correctamente al endpoint.');
      return response;
    } catch (error) {
      console.error('Error al enviar los datos al endpoint:', error);
      throw error;
    }
  }
}
