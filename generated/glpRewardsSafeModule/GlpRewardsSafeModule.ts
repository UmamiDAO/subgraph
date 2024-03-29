// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class GlpWethRewardsDistributed extends ethereum.Event {
  get params(): GlpWethRewardsDistributed__Params {
    return new GlpWethRewardsDistributed__Params(this);
  }
}

export class GlpWethRewardsDistributed__Params {
  _event: GlpWethRewardsDistributed;

  constructor(event: GlpWethRewardsDistributed) {
    this._event = event;
  }

  get _totalClaimed(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get _amountDistributed(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class MarinateShareBpsUpdated extends ethereum.Event {
  get params(): MarinateShareBpsUpdated__Params {
    return new MarinateShareBpsUpdated__Params(this);
  }
}

export class MarinateShareBpsUpdated__Params {
  _event: MarinateShareBpsUpdated;

  constructor(event: MarinateShareBpsUpdated) {
    this._event = event;
  }

  get _oldShareBps(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get _newShareBps(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Paused extends ethereum.Event {
  get params(): Paused__Params {
    return new Paused__Params(this);
  }
}

export class Paused__Params {
  _event: Paused;

  constructor(event: Paused) {
    this._event = event;
  }
}

export class Unpaused extends ethereum.Event {
  get params(): Unpaused__Params {
    return new Unpaused__Params(this);
  }
}

export class Unpaused__Params {
  _event: Unpaused;

  constructor(event: Unpaused) {
    this._event = event;
  }
}

export class GlpRewardsSafeModule__distributeResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  get_totalClaimed(): BigInt {
    return this.value0;
  }

  get_amountDistributed(): BigInt {
    return this.value1;
  }
}

export class GlpRewardsSafeModule extends ethereum.SmartContract {
  static bind(address: Address): GlpRewardsSafeModule {
    return new GlpRewardsSafeModule("GlpRewardsSafeModule", address);
  }

  DELEGATOR(): Address {
    let result = super.call("DELEGATOR", "DELEGATOR():(address)", []);

    return result[0].toAddress();
  }

  try_DELEGATOR(): ethereum.CallResult<Address> {
    let result = super.tryCall("DELEGATOR", "DELEGATOR():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  OWNER(): Address {
    let result = super.call("OWNER", "OWNER():(address)", []);

    return result[0].toAddress();
  }

  try_OWNER(): ethereum.CallResult<Address> {
    let result = super.tryCall("OWNER", "OWNER():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  distribute(): GlpRewardsSafeModule__distributeResult {
    let result = super.call("distribute", "distribute():(uint256,uint256)", []);

    return new GlpRewardsSafeModule__distributeResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_distribute(): ethereum.CallResult<
    GlpRewardsSafeModule__distributeResult
  > {
    let result = super.tryCall(
      "distribute",
      "distribute():(uint256,uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new GlpRewardsSafeModule__distributeResult(
        value[0].toBigInt(),
        value[1].toBigInt()
      )
    );
  }

  isPaused(): boolean {
    let result = super.call("isPaused", "isPaused():(bool)", []);

    return result[0].toBoolean();
  }

  try_isPaused(): ethereum.CallResult<boolean> {
    let result = super.tryCall("isPaused", "isPaused():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  marinateShareBps(): BigInt {
    let result = super.call(
      "marinateShareBps",
      "marinateShareBps():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_marinateShareBps(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "marinateShareBps",
      "marinateShareBps():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _owner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _delegator(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class DistributeCall extends ethereum.Call {
  get inputs(): DistributeCall__Inputs {
    return new DistributeCall__Inputs(this);
  }

  get outputs(): DistributeCall__Outputs {
    return new DistributeCall__Outputs(this);
  }
}

export class DistributeCall__Inputs {
  _call: DistributeCall;

  constructor(call: DistributeCall) {
    this._call = call;
  }
}

export class DistributeCall__Outputs {
  _call: DistributeCall;

  constructor(call: DistributeCall) {
    this._call = call;
  }

  get _totalClaimed(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }

  get _amountDistributed(): BigInt {
    return this._call.outputValues[1].value.toBigInt();
  }
}

export class SetIsPausedCall extends ethereum.Call {
  get inputs(): SetIsPausedCall__Inputs {
    return new SetIsPausedCall__Inputs(this);
  }

  get outputs(): SetIsPausedCall__Outputs {
    return new SetIsPausedCall__Outputs(this);
  }
}

export class SetIsPausedCall__Inputs {
  _call: SetIsPausedCall;

  constructor(call: SetIsPausedCall) {
    this._call = call;
  }

  get _isPaused(): boolean {
    return this._call.inputValues[0].value.toBoolean();
  }
}

export class SetIsPausedCall__Outputs {
  _call: SetIsPausedCall;

  constructor(call: SetIsPausedCall) {
    this._call = call;
  }
}

export class SetMarinateShareBpsCall extends ethereum.Call {
  get inputs(): SetMarinateShareBpsCall__Inputs {
    return new SetMarinateShareBpsCall__Inputs(this);
  }

  get outputs(): SetMarinateShareBpsCall__Outputs {
    return new SetMarinateShareBpsCall__Outputs(this);
  }
}

export class SetMarinateShareBpsCall__Inputs {
  _call: SetMarinateShareBpsCall;

  constructor(call: SetMarinateShareBpsCall) {
    this._call = call;
  }

  get _newBps(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetMarinateShareBpsCall__Outputs {
  _call: SetMarinateShareBpsCall;

  constructor(call: SetMarinateShareBpsCall) {
    this._call = call;
  }
}
