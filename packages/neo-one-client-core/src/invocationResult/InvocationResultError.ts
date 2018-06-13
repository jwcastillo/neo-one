import BN from 'bn.js';
import {
  DeserializeWireBaseOptions,
  SerializableJSON,
  SerializeJSONContext,
} from '../Serializable';
import { InvocationResultBase } from './InvocationResultBase';
import { InvalidFormatError } from '../errors';
import { ContractParameter, ContractParameterJSON } from '../contractParameter';
import { VMState } from '../vm';
import { utils, BinaryWriter, IOHelper, JSONHelper } from '../utils';

export interface InvocationResultErrorAdd {
  gasConsumed: BN;
  gasCost: BN;
  stack: ContractParameter[];
  message: string;
}

export interface InvocationResultErrorJSON {
  state: VMState.Fault;
  gas_consumed: string;
  gas_cost: string;
  stack: ContractParameterJSON[];
  message: string;
}

const MAX_SIZE = 1024;

export class InvocationResultError extends InvocationResultBase<VMState.Fault>
  implements SerializableJSON<InvocationResultErrorJSON> {
  public static deserializeWireBase(
    options: DeserializeWireBaseOptions,
  ): InvocationResultError {
    const { reader } = options;
    const {
      state,
      gasConsumed,
      gasCost,
      stack,
    } = super.deserializeInvocationResultWireBase(options);
    if (state !== VMState.Fault) {
      throw new InvalidFormatError();
    }
    const message = reader.readVarString(MAX_SIZE);
    return new this({ gasConsumed, gasCost, stack, message });
  }

  public readonly message: string;
  protected readonly sizeExclusive: () => number;

  constructor({
    gasConsumed,
    gasCost,
    stack,
    message,
  }: InvocationResultErrorAdd) {
    super({ state: VMState.Fault, gasConsumed, gasCost, stack });
    this.message = message;
    this.sizeExclusive = utils.lazy(() =>
      IOHelper.sizeOfVarString(this.message),
    );
  }

  public serializeWireBase(writer: BinaryWriter): void {
    super.serializeWireBase(writer);
    writer.writeVarString(this.message, MAX_SIZE);
  }

  public serializeJSON(
    context: SerializeJSONContext,
  ): InvocationResultErrorJSON {
    return {
      state: VMState.Fault,
      gas_consumed: JSONHelper.writeFixed8(this.gasConsumed),
      gas_cost: JSONHelper.writeFixed8(this.gasCost),
      stack: this.stack.map((value) => value.serializeJSON(context)),
      message: this.message,
    };
  }
}