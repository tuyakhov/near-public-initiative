import {Context, ContractPromiseBatch, logging, PersistentVector, u128} from "near-sdk-core"
import { AccountId, ONE_NEAR, XCC_GAS, assert_self, assert_single_promise_success } from "../../utils"
import { Initiative, Vote, initiatives, votes } from "./models"


// max 5 NEAR accepted to this contract before it forces a transfer to the owner
const CONTRIBUTION_SAFETY_LIMIT: u128 = u128.mul(ONE_NEAR, u128.from(5));
const INITIATIVE_CONTRIBUTION_MINIMUM: u128 = u128.mul(ONE_NEAR, u128.from(0.1));

@nearBindgen
export class Contract {
  private owner: AccountId

  constructor(owner: AccountId) {
    this.owner = owner
  }

  /**
   * Creates an initiative with an initial amount of contributions
   */
  @mutateState()
  create_initiative(): u32 {
    const contribution = Context.attachedDeposit
    this.assert_contribution(contribution)

    const new_initiative = new Initiative()
    new_initiative.add_contribution(contribution)
    initiatives.push(new_initiative)
    ContractPromiseBatch.create(Context.contractName)
        .transfer(contribution)
    return initiatives.length - 1
  }

  /**
   * Resets all the initiatives
   */
  @mutateState()
  private reset_initiatives(): void {
    for (let i = 0; i < initiatives.length; i++) {
      this.assert_initiative_has_no_contributions(initiatives[i])
      initiatives.swap_remove(i)
    }
    votes.clear()
  }

  @mutateState()
  vote(initiative: u32): void {
    const contribution = Context.attachedDeposit
    this.assert_contribution(contribution)
    this.assert_initiative_exists(initiative)

    const initiativeVotes = votes.contains(initiative)
        ? votes.getSome(initiative)
        : new Array<Vote>()
    initiativeVotes.push(new Vote(contribution))
    votes.set(initiative, initiativeVotes)
    const updated = initiatives[initiative]
    updated.add_contribution(contribution)
    initiatives.replace(initiative, updated)
    ContractPromiseBatch.create(Context.contractName)
        .transfer(contribution)
  }

  list_votes(initiative: u32): Vote[] {
    this.assert_initiative_exists(initiative)
    return votes.getSome(initiative)
  }

  /**
   * Initiative with the most contributions wins. All the funds are distributed to the initiative creator
   */
  @mutateState()
  finalize_voting(): void {
    this.assert_owner()

    let winningInitiative = initiatives[0]
    for (let i = 1; i < initiatives.length; i++) {
      const initiative = initiatives[i]
      winningInitiative = u128.gt(initiative.contributions, winningInitiative.contributions) ? initiative : winningInitiative
    }

    const to_self = Context.contractName
    const to_creator = ContractPromiseBatch.create(winningInitiative.creator)

    // transfer earnings to owner then confirm transfer complete
    const promise = to_creator.transfer(winningInitiative.contributions)
    promise.then(to_self).function_call("on_transfer_complete", '{}', u128.Zero, XCC_GAS)
  }

  @mutateState()
  on_transfer_complete(): void {
    assert_self()
    assert_single_promise_success()

    logging.log("transfer complete")
    // reset initiatives
    this.reset_initiatives()
  }

  // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  private assert_owner(): void {
    const caller = Context.predecessor
    assert(this.owner == caller, "Only the owner of this contract may call this method")
  }

  private assert_contribution(contribution: u128): void {
    assert(u128.le(contribution, CONTRIBUTION_SAFETY_LIMIT), `You are trying to attach too many NEAR Tokens to this call.  There is a safe limit while in beta of ${CONTRIBUTION_SAFETY_LIMIT.toString()} NEAR`)
    assert(u128.ge(contribution, INITIATIVE_CONTRIBUTION_MINIMUM), `To create an initiative you need attach at least ${INITIATIVE_CONTRIBUTION_MINIMUM.toString()}`)
  }

  private assert_initiative_exists(index: u32): void {
    assert(initiatives.containsIndex(index), "Initiative doesn't exist")
  }

  private assert_initiative_creator(initiative: Initiative): void {
    const caller = Context.predecessor
    assert(initiative.creator === caller, "Only the creator of the initiative may call this method")
  }

  private assert_initiative_has_no_contributions(initiative: Initiative): void {
    assert(u128.eq(initiative.contributions, u128.Zero), "This initiative has not been finalised yet")
  }

}
