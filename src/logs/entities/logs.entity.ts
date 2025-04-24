import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LogsDocument = HydratedDocument<Logs>;

// ================== geo location ======================================================
@Schema()
export class GeoLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point', required: true })
  type: string;

  @Prop({ type: [Number], default: [0, 0], required: true }) // [longitude, latitude]
  coordinates: [number, number];
}

const GeoLocationSchema = SchemaFactory.createForClass(GeoLocation);

// ==================  address =========================================================

@Schema()
export class Address {
  @Prop({ type: String, default: '' })
  country: string;

  @Prop({ type: String, default: '' })
  region: string;

  @Prop({ type: String, default: '' })
  city: string;

  @Prop({ type: GeoLocationSchema, required: true })
  location: GeoLocation;
}

const AddressSchema = SchemaFactory.createForClass(Address);

// ================== logs ============================================================

@Schema({
  timestamps: true,
})
export class Logs {
  @Prop({ type: String, default: '' })
  ip: string;

  @Prop({ type: String })
  timestamp: string;

  @Prop({ type: String, default: '' })
  method: string;

  @Prop({ type: String, default: '' })
  url: string;

  @Prop({ type: String, default: '' })
  protocol: string;

  @Prop({ type: Number, default: 0 })
  statusCode: number;

  @Prop({ type: Number, default: 0 })
  bytes: number;

  @Prop({ type: String, default: '' })
  referer: string;

  @Prop({ type: String, default: '' })
  userAgent: string;

  @Prop({ type: String, default: '' })
  source: string;

  @Prop({ type: AddressSchema, required: false })
  address: Address;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);

//===================== Indexes for performance ===========================================
LogsSchema.index({ ip: 1 });
LogsSchema.index({ timestamp: -1 });
LogsSchema.index({ 'address.country': 1 });
LogsSchema.index({ 'address.city': 1 });
LogsSchema.index({ 'address.region': 1 });
LogsSchema.index({ 'address.location': '2dsphere' });
