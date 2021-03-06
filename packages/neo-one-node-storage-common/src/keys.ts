import {
  ActionKey,
  ActionsKey,
  common,
  OutputKey,
  StorageItemKey,
  StorageItemsKey,
  UInt160,
  UInt256,
  ValidatorKey,
} from '@neo-one/client-core';
import { AccountInputKey, AccountInputsKey } from '@neo-one/node-core';
import { BN } from 'bn.js';
import bytewise from 'bytewise';

const accountKeyPrefix = 'account';
const accountUnclaimedKeyPrefix = 'accountUnclaimed';
const accountUnspentKeyPrefix = 'accountUnspent';
const actionKeyPrefix = 'action';
const assetKeyPrefix = 'asset';
const blockKeyPrefix = 'block';
const blockDataKeyPrefix = 'blockData';
const headerKeyPrefix = 'header';
const headerHashKeyPrefix = 'header-index';
const transactionKeyPrefix = 'transaction';
const outputKeyPrefix = 'output';
const transactionDataKeyPrefix = 'transactionData';
const contractKeyPrefix = 'contract';
const storageItemKeyPrefix = 'storageItem';
const validatorKeyPrefix = 'validator';
const invocationDataKeyPrefix = 'invocationData';
const settingsPrefix = 'settings';

const validatorsCountKeyString = 'validatorsCount';
const validatorsCountKey = bytewise.encode([validatorsCountKeyString]);

const serializeHeaderIndexHashKey = (index: number): Buffer => bytewise.encode([headerHashKeyPrefix, index]);
const serializeHeaderIndexHashKeyString = (index: number): string => `${headerHashKeyPrefix}:${index}`;

const maxHeaderHashKey = bytewise.encode([settingsPrefix, 'max-header-hash']) as Buffer;
const maxBlockHashKey = bytewise.encode([settingsPrefix, 'max-block-hash']) as Buffer;

const createSerializeAccountInputKey = (prefix: string) => ({ hash, input }: AccountInputKey): Buffer =>
  bytewise.encode([prefix, common.uInt160ToBuffer(hash), common.uInt256ToBuffer(input.hash), input.index]);

const createSerializeAccountInputKeyString = (prefix: string) => ({ hash, input }: AccountInputKey): string =>
  `${prefix}:` + `${common.uInt160ToString(hash)}:` + `${common.uInt256ToString(input.hash)}:` + `${input.index}`;
const createGetAccountInputKeyMin = (prefix: string) => ({ hash }: AccountInputsKey): Buffer =>
  bytewise.encode(bytewise.sorts.array.bound.lower([prefix, common.uInt160ToBuffer(hash)]));

const createGetAccountInputKeyMax = (prefix: string) => ({ hash }: AccountInputsKey): Buffer =>
  bytewise.encode(bytewise.sorts.array.bound.upper([prefix, common.uInt160ToBuffer(hash)]));

const getAccountUnclaimedKeyMin = createGetAccountInputKeyMin(accountUnclaimedKeyPrefix);
const getAccountUnclaimedKeyMax = createGetAccountInputKeyMax(accountUnclaimedKeyPrefix);

const getAccountUnspentKeyMin = createGetAccountInputKeyMin(accountUnspentKeyPrefix);
const getAccountUnspentKeyMax = createGetAccountInputKeyMax(accountUnspentKeyPrefix);

const serializeStorageItemKey = ({ hash, key }: StorageItemKey): Buffer =>
  bytewise.encode([storageItemKeyPrefix, common.uInt160ToBuffer(hash), key]);
const serializeStorageItemKeyString = ({ hash, key }: StorageItemKey): string =>
  `${storageItemKeyPrefix}:` + `${common.uInt160ToString(hash)}:` + `${key.toString('hex')}`;
const getStorageItemKeyMin = ({ hash, prefix }: StorageItemsKey): Buffer => {
  if (hash === undefined) {
    return bytewise.encode(bytewise.sorts.array.bound.lower([storageItemKeyPrefix]));
  }

  if (prefix === undefined) {
    return bytewise.encode(bytewise.sorts.array.bound.lower([storageItemKeyPrefix, common.uInt160ToBuffer(hash)]));
  }

  return bytewise.encode(
    bytewise.sorts.array.bound.lower([storageItemKeyPrefix, common.uInt160ToBuffer(hash), prefix]),
  );
};
const getStorageItemKeyMax = ({ hash, prefix }: StorageItemsKey): Buffer => {
  if (hash === undefined) {
    return bytewise.encode(bytewise.sorts.array.bound.upper([storageItemKeyPrefix]));
  }

  if (prefix === undefined) {
    return bytewise.encode(bytewise.sorts.array.bound.upper([storageItemKeyPrefix, common.uInt160ToBuffer(hash)]));
  }

  return bytewise.encode(
    bytewise.sorts.array.bound.upper([storageItemKeyPrefix, common.uInt160ToBuffer(hash), prefix]),
  );
};

const serializeUInt64 = (value: BN) => value.toArrayLike(Buffer, 'be', 8);

const serializeActionKey = ({ index }: ActionKey): Buffer => bytewise.encode([actionKeyPrefix, serializeUInt64(index)]);
const serializeActionKeyString = ({ index }: ActionKey): string => `${actionKeyPrefix}:${index.toString(10)}`;

const getActionKeyMin = ({ indexStart }: ActionsKey): Buffer =>
  bytewise.encode(
    bytewise.sorts.array.bound.lower(
      [actionKeyPrefix, indexStart === undefined ? undefined : serializeUInt64(indexStart)].filter(Boolean),
    ),
  );

const getActionKeyMax = ({ indexStop }: ActionsKey): Buffer =>
  bytewise.encode(
    bytewise.sorts.array.bound.upper(
      [actionKeyPrefix, indexStop === undefined ? undefined : serializeUInt64(indexStop)].filter(
        (value) => value !== undefined,
      ),
    ),
  );

const serializeValidatorKey = ({ publicKey }: ValidatorKey): Buffer =>
  bytewise.encode([validatorKeyPrefix, common.ecPointToBuffer(publicKey)]);
const serializeValidatorKeyString = ({ publicKey }: ValidatorKey): string =>
  `${validatorKeyPrefix}:${common.ecPointToString(publicKey)}`;
const validatorMinKey = bytewise.encode(bytewise.sorts.array.bound.lower([validatorKeyPrefix]));
const validatorMaxKey = bytewise.encode(bytewise.sorts.array.bound.upper([validatorKeyPrefix]));

const serializeUInt160Key = ({ hash }: { readonly hash: UInt160 }): Buffer => common.uInt160ToBuffer(hash);
const serializeUInt256Key = ({ hash }: { readonly hash: UInt256 }): Buffer => common.uInt256ToBuffer(hash);

const createSerializeUInt160Key = (prefix: string) => (input: { readonly hash: UInt160 }): Buffer =>
  bytewise.encode([prefix, serializeUInt160Key(input)]);
const createSerializeUInt256Key = (prefix: string) => (input: { readonly hash: UInt256 }): Buffer =>
  bytewise.encode([prefix, serializeUInt256Key(input)]);

const createSerializeUInt160KeyString = (prefix: string) => (input: { readonly hash: UInt160 }): string =>
  `${prefix}:${common.uInt160ToString(input.hash)}`;
const createSerializeUInt256KeyString = (prefix: string) => (input: { readonly hash: UInt256 }): string =>
  `${prefix}:${common.uInt256ToString(input.hash)}`;

const accountMinKey = bytewise.encode(bytewise.sorts.array.bound.lower([accountKeyPrefix]));
const accountMaxKey = bytewise.encode(bytewise.sorts.array.bound.upper([accountKeyPrefix]));

const serializeOutputKey = ({ index, hash }: OutputKey): Buffer =>
  bytewise.encode([outputKeyPrefix, serializeUInt256Key({ hash }), index]);
const serializeOutputKeyString = ({ index, hash }: OutputKey): string =>
  `${outputKeyPrefix}:${common.uInt256ToString(hash)}:${index}`;

const typeKeyToSerializeKey = {
  account: createSerializeUInt160Key(accountKeyPrefix),
  accountUnclaimed: createSerializeAccountInputKey(accountUnclaimedKeyPrefix),
  accountUnspent: createSerializeAccountInputKey(accountUnspentKeyPrefix),
  action: serializeActionKey,
  asset: createSerializeUInt256Key(assetKeyPrefix),
  block: createSerializeUInt256Key(blockKeyPrefix),
  blockData: createSerializeUInt256Key(blockDataKeyPrefix),
  header: createSerializeUInt256Key(headerKeyPrefix),
  transaction: createSerializeUInt256Key(transactionKeyPrefix),
  output: serializeOutputKey,
  transactionData: createSerializeUInt256Key(transactionDataKeyPrefix),
  contract: createSerializeUInt160Key(contractKeyPrefix),
  storageItem: serializeStorageItemKey,
  validator: serializeValidatorKey,
  invocationData: createSerializeUInt256Key(invocationDataKeyPrefix),
};

const typeKeyToSerializeKeyString = {
  account: createSerializeUInt160KeyString(accountKeyPrefix),
  accountUnclaimed: createSerializeAccountInputKeyString(accountUnclaimedKeyPrefix),

  accountUnspent: createSerializeAccountInputKeyString(accountUnspentKeyPrefix),
  action: serializeActionKeyString,
  asset: createSerializeUInt256KeyString(assetKeyPrefix),
  block: createSerializeUInt256KeyString(blockKeyPrefix),
  blockData: createSerializeUInt256KeyString(blockDataKeyPrefix),
  header: createSerializeUInt256KeyString(headerKeyPrefix),
  transaction: createSerializeUInt256KeyString(transactionKeyPrefix),
  output: serializeOutputKeyString,
  transactionData: createSerializeUInt256KeyString(transactionDataKeyPrefix),
  contract: createSerializeUInt160KeyString(contractKeyPrefix),
  storageItem: serializeStorageItemKeyString,
  validator: serializeValidatorKeyString,
  invocationData: createSerializeUInt256KeyString(invocationDataKeyPrefix),
};

export const keys = {
  validatorsCountKeyString,
  validatorsCountKey,
  serializeHeaderIndexHashKey,
  serializeHeaderIndexHashKeyString,
  maxHeaderHashKey,
  maxBlockHashKey,
  getAccountUnclaimedKeyMin,
  getAccountUnclaimedKeyMax,
  getAccountUnspentKeyMin,
  getAccountUnspentKeyMax,
  getStorageItemKeyMin,
  getStorageItemKeyMax,
  serializeActionKey,
  serializeActionKeyString,
  getActionKeyMin,
  getActionKeyMax,
  validatorMinKey,
  validatorMaxKey,
  accountMinKey,
  accountMaxKey,
  typeKeyToSerializeKey,
  typeKeyToSerializeKeyString,
};
