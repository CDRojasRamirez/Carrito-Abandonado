import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class DataVtexDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  rclastsessiondate: string;

  @IsNotEmpty()
  @IsString()
  rclastcart: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;
  phone: string;
}
export interface Item {
  sellerSku: string;
}
export class DataCompraVtexDto {
  @IsString()
  OrderId: string;
  @IsString()
  State: string;
}
export class Postsend {
  dni: string;
  @IsNotEmpty()
  productName: string;
  @IsNotEmpty()
  @IsString()
  imageUrl: string;
  listPrice: number;
  price: number;
  sku: string;
  flag: boolean;
}

export interface Datasend {
  dni: string;
  email: string;
  sku: string;
  flag: boolean;
}

export interface DataApiSalesforce {
  ContactKey: string;
  EventDefinitionKey: string;
  Data: Data;
}

export interface Data {
  dni: string;
  email: string;
  productName: string;
  imageUrl: string;
  listPrice: number;
  price: number;
  accountId: string;
  sku: string;
  flag: boolean;
}
