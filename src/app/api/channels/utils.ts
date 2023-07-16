import type { IpcMainInvokeEvent } from "electron";

const CHANNEL_PARAMS = Symbol();
const CHANNEL_RETURN = Symbol();

export const separator = '.';

export type Separator = typeof separator;

export type ChannelReturn<C extends ChannelType> = C extends ChannelType<any[], infer R> ? R : never;
export type ChannelParams<C extends ChannelType> = C extends ChannelType<infer P> ? P : never;
export type ChannelType<TParams extends unknown[] = unknown[], TReturn = unknown> = {
  [CHANNEL_PARAMS]: TParams,
  [CHANNEL_RETURN]: TReturn,
};

export type Intersection<U> = (U extends any ? (val: U) => void : never) extends (val: infer I) => void ? I : never;

export type NamedChannelsFrom<Channels, Prefix extends string = ''> = {
  [Key in keyof Channels extends string ? keyof Channels : never]: Channels[Key] extends (...args: infer P) => infer R
  ? { [ChannelName in `${Prefix}${Key}`]: ChannelType<P, R> }
  : NamedChannelsFrom<Channels[Key], `${Prefix}${Key}${Separator}`>
};

export type FlatChannels<Channels> = Channels extends { [K in string]: ChannelType }
  ? Channels
  : Channels extends { [K in string]: infer C }
  ? FlatChannels<C>
  : never;

export type NameChannels<Channels> = Intersection<FlatChannels<NamedChannelsFrom<Channels>>>;

export type ChannelsFrom<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
  ? ChannelType<P, R>
  : ChannelsFrom<T[K]>;
};

export type IPCHandler<C> = {
  [K in keyof C]: C[K] extends ChannelType<infer P, infer R>
  ? (ev: IpcMainInvokeEvent, ...args: P) => Promise<R>
  : IPCHandler<C[K]>;
};

export type IPCInvoker<C> = {
  [K in keyof C]: C[K] extends ChannelType<infer P, infer R>
  ? (...args: P) => Promise<R>
  : IPCInvoker<C[K]>;
};