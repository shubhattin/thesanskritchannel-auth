import Type from 'typebox';
import { AppScopeEnum } from './schema';

/** Coerce ISO date strings (from JSON) into Date instances. */
const CoercedDate = Type.Codec(Type.String())
  .Decode((value) => new Date(value))
  .Encode((value) => value.toISOString());

export const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  emailVerified: Type.Boolean(),
  image: Type.Union([Type.String(), Type.Null()]),
  createdAt: CoercedDate,
  updatedAt: CoercedDate,
  username: Type.Union([Type.String(), Type.Null()]),
  displayUsername: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.String(), Type.Null()]),
  banned: Type.Union([Type.Boolean(), Type.Null()]),
  banReason: Type.Union([Type.String(), Type.Null()]),
  banExpires: Type.Union([CoercedDate, Type.Null()]),
  is_maintainer: Type.Union([Type.Boolean(), Type.Null()])
});

export const AccountSchema = Type.Object({
  id: Type.String(),
  accountId: Type.String(),
  providerId: Type.String(),
  userId: Type.String(),
  accessToken: Type.Union([Type.String(), Type.Null()]),
  refreshToken: Type.Union([Type.String(), Type.Null()]),
  idToken: Type.Union([Type.String(), Type.Null()]),
  accessTokenExpiresAt: Type.Union([CoercedDate, Type.Null()]),
  refreshTokenExpiresAt: Type.Union([CoercedDate, Type.Null()]),
  scope: Type.Union([Type.String(), Type.Null()]),
  password: Type.Union([Type.String(), Type.Null()]),
  createdAt: CoercedDate,
  updatedAt: CoercedDate
});

export const VerificationSchema = Type.Object({
  id: Type.String(),
  identifier: Type.String(),
  value: Type.String(),
  expiresAt: CoercedDate,
  createdAt: CoercedDate,
  updatedAt: CoercedDate
});

export const UserAppScopeJoinSchema = Type.Object({
  user_id: Type.String(),
  scope: AppScopeEnum
});

export const JwksSchema = Type.Object({
  id: Type.String(),
  publicKey: Type.String(),
  privateKey: Type.String(),
  createdAt: CoercedDate,
  expiresAt: Type.Optional(Type.Union([CoercedDate, Type.Null()]))
});
