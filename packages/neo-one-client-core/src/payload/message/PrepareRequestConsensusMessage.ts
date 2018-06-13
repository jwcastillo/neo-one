import BN from 'bn.js';
import { ConsensusMessageType } from './ConsensusMessageType';
import { BinaryWriter } from '../../utils';
import {
  ConsensusMessageBase,
  ConsensusMessageBaseAdd,
} from './ConsensusMessageBase';
import { DeserializeWireBaseOptions } from '../../Serializable';
import { InvalidFormatError } from '../../errors';
import { MinerTransaction } from '../../transaction';
import { common, UInt160, UInt256 } from '../../common';

export interface PrepareRequestAdd extends ConsensusMessageBaseAdd {
  nonce: BN;
  nextConsensus: UInt160;
  transactionHashes: UInt256[];
  minerTransaction: MinerTransaction;
  signature: Buffer;
}

export class PrepareRequestConsensusMessage extends ConsensusMessageBase<
  PrepareRequestConsensusMessage,
  ConsensusMessageType.PrepareRequest
> {
  public static deserializeWireBase(
    options: DeserializeWireBaseOptions,
  ): PrepareRequestConsensusMessage {
    const { reader } = options;
    const message = super.deserializeConsensusMessageBaseWireBase(options);
    const nonce = reader.readUInt64LE();
    const nextConsensus = reader.readUInt160();
    const transactionHashes = reader.readArray(() => reader.readUInt256());
    const distinctTransactionHashes = new Set(
      transactionHashes.map((hash) => common.uInt256ToString(hash)),
    );

    if (distinctTransactionHashes.size !== transactionHashes.length) {
      throw new InvalidFormatError(
        `Distinct hashes: ${distinctTransactionHashes.size} ` +
          `Transaction hashes: ${transactionHashes.length}`,
      );
    }
    const minerTransaction = MinerTransaction.deserializeWireBase(options);
    if (!common.uInt256Equal(minerTransaction.hash, transactionHashes[0])) {
      throw new InvalidFormatError();
    }
    const signature = reader.readBytes(64);

    return new this({
      viewNumber: message.viewNumber,
      nonce,
      nextConsensus,
      transactionHashes,
      minerTransaction,
      signature,
    });
  }

  public readonly nonce: BN;
  public readonly nextConsensus: UInt160;
  public readonly transactionHashes: UInt256[];
  public readonly minerTransaction: MinerTransaction;
  public readonly signature: Buffer;

  constructor({
    viewNumber,
    nonce,
    nextConsensus,
    transactionHashes,
    minerTransaction,
    signature,
  }: PrepareRequestAdd) {
    super({
      type: ConsensusMessageType.PrepareRequest,
      viewNumber,
    });

    this.nonce = nonce;
    this.nextConsensus = nextConsensus;
    this.transactionHashes = transactionHashes;
    this.minerTransaction = minerTransaction;
    this.signature = signature;
  }

  public serializeWireBase(writer: BinaryWriter): void {
    super.serializeWireBase(writer);
    writer.writeUInt64LE(this.nonce);
    writer.writeUInt160(this.nextConsensus);
    writer.writeArray(this.transactionHashes, (value) => {
      writer.writeUInt256(value);
    });
    this.minerTransaction.serializeWireBase(writer);
    writer.writeBytes(this.signature);
  }
}