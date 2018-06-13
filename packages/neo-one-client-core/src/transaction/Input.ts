import { Equatable, Equals } from '../Equatable';
import {
  DeserializeWireBaseOptions,
  DeserializeWireOptions,
  SerializeJSONContext,
  SerializableJSON,
  SerializeWire,
  SerializableWire,
  createSerializeWire,
} from '../Serializable';
import { common, UInt256 } from '../common';
import {
  utils,
  BinaryReader,
  BinaryWriter,
  IOHelper,
  JSONHelper,
} from '../utils';

export interface InputAdd {
  hash: UInt256;
  index: number;
}

export interface InputJSON {
  txid: string;
  vout: number;
}

export class Input
  implements SerializableWire<Input>, Equatable, SerializableJSON<InputJSON> {
  public static deserializeWireBase({
    reader,
  }: DeserializeWireBaseOptions): Input {
    const hash = reader.readUInt256();
    const index = reader.readUInt16LE();
    return new this({ hash, index });
  }

  public static deserializeWire(options: DeserializeWireOptions): Input {
    return this.deserializeWireBase({
      context: options.context,
      reader: new BinaryReader(options.buffer),
    });
  }

  public readonly hash: UInt256;
  public readonly index: number;
  public readonly size: number =
    IOHelper.sizeOfUInt256 + IOHelper.sizeOfUInt16LE;
  public readonly equals: Equals = utils.equals(
    Input,
    (other) =>
      common.uInt256Equal(this.hash, other.hash) && other.index === this.index,
  );
  public readonly serializeWire: SerializeWire = createSerializeWire(
    this.serializeWireBase.bind(this),
  );

  constructor({ hash, index }: InputAdd) {
    this.hash = hash;
    this.index = index;
  }

  public serializeWireBase(writer: BinaryWriter): void {
    writer.writeUInt256(this.hash);
    writer.writeUInt16LE(this.index);
  }

  public serializeJSON(context: SerializeJSONContext): InputJSON {
    return {
      txid: JSONHelper.writeUInt256(this.hash),
      vout: this.index,
    };
  }
}