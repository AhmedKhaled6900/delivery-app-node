import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IClientAddress } from '../types';

export interface IClient {
  name: string;
  email: string;
  phone: string;
  password: string;
  addresses: IClientAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type IClientDocument = HydratedDocument<IClient, IClientMethods>;

type ClientModel = Model<IClient, object, IClientMethods>;

const clientSchema = new Schema<IClient, ClientModel, IClientMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        coordinates: { lat: Number, lng: Number },
      },
    ],
  },
  { timestamps: true }
);

clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

clientSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Client = mongoose.model<IClient, ClientModel>('Client', clientSchema);
export default Client;
