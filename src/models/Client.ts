import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IClientAddress, ClientAuthProvider } from '../types';

export interface IClient {
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  password?: string;
  googleId?: string;
  authProvider: ClientAuthProvider;
  phoneVerified: boolean;
  emailVerified: boolean;
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
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    countryCode: { type: String, uppercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['phone', 'email', 'google'], required: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
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
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

clientSchema.methods.comparePassword = function (candidate: string) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export const Client = mongoose.model<IClient, ClientModel>('Client', clientSchema);
export default Client;
