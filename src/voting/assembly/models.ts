import { Context, u128 } from "near-sdk-as";
import { AccountId } from "../../utils";
import {PersistentUnorderedMap, PersistentVector} from "near-sdk-core";

/**
 * An initiative started by someone
 */
@nearBindgen
export class Initiative {
  public creator: AccountId

  public contributions: u128 = u128.Zero

  constructor() {
    this.creator = Context.sender
  }

  add_contribution(value: u128): void {
    this.contributions = u128.add(this.contributions, value);
  };

}

/**
 * A vote
 */
@nearBindgen
export class Vote {
  public voter: AccountId

  public contribution: u128 = u128.Zero

  constructor(contribution: u128) {
    this.voter = Context.sender
    this.contribution = contribution
  }

}

export const initiatives: PersistentVector<Initiative> = new PersistentVector<Initiative>('i')

export const votes: PersistentUnorderedMap<i32, Vote[]> = new PersistentUnorderedMap<i32, Vote[]>('v')
