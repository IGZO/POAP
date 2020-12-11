import { BigInt, store } from "@graphprotocol/graph-ts"
import {
  Poap,
  EventToken,
  EventMinterAdded,
  EventMinterRemoved,
  Transfer,
  MintToken1Call,
  MintTokenCall,
  MintEventToManyUsersCall,
  MintUserToManyEventsCall
} from "../generated/Poap/Poap"
import { Account, Event, EventMinter, Token, EventOwner } from "../generated/schema"

export function handleEventToken(event: EventToken): void {
  let token = getOrCreateToken(event.params.tokenId.toHexString())
  let eevent = getOrCreateEvent(event.params.eventId.toHexString())

  eevent.token = token.id
  token.event = eevent.id
  
  token.save()
  eevent.save()

}

export function handleMint1Token(call: MintToken1Call): void {
  let inputs = call.inputs
  let account = getOrCreateAccount(inputs.to.toHexString())

  let event = getOrCreateEvent(inputs.eventId.toHexString())

  let eventown = new EventOwner(event.id.toString() + "-" + account.id.toString())
  eventown.owner = account.id
  eventown.event = event.id
  eventown.save()

  event.save()
}

export function handleMintToken(call: MintTokenCall): void {
  let inputs = call.inputs
  let event = getOrCreateEvent(inputs.eventId.toHexString())
  let account = getOrCreateAccount(inputs.to.toHexString())

  let eventown = new EventOwner(event.id.toString() + "-" + account.id.toString())
  eventown.owner = account.id
  eventown.event = event.id
  eventown.save()
  
  event.save()
}

export function handleMintEventToManyUsers(call: MintEventToManyUsersCall): void {
  let inputs = call.inputs
  let event = getOrCreateEvent(inputs.eventId.toHexString())


  let users = inputs.to
  for(let i = 0; i< users.length; i++){
    let account = getOrCreateAccount(users[i].toHexString())
    let eventown = new EventOwner(event.id.toString() + "-" + account.id.toString())
    eventown.owner = account.id
    eventown.event = event.id
    eventown.save()
  }
}

export function handleMintUserToManyEvents(call: MintUserToManyEventsCall): void {
  let inputs = call.inputs
  let account = getOrCreateAccount(inputs.to.toHexString())

  let events = inputs.eventIds
  for(let i = 0; i< events.length; i++){
    let event = getOrCreateEvent(events[i].toHexString())

    let eventown = new EventOwner(event.id.toString() + "-" + account.id.toString())
    eventown.owner = account.id
    eventown.event = event.id
    eventown.save()
  }
}

export function handleEventMinterAdded(event: EventMinterAdded): void {
  let eevent = getOrCreateEvent(event.params.eventId.toHexString())
  let minter = getOrCreateAccount(event.params.account.toHexString())
  let eventmint = new EventMinter(eevent.id.toString() + "-" + minter.id.toString())
  eventmint.minter = minter.id
  eventmint.event = eevent.id
  eventmint.save()
}

export function handleEventMinterRemoved(event: EventMinterRemoved): void {
  store.remove("EventMinter", event.params.eventId.toString() + "-" + event.params.account.toString())
}

export function handleTransfer(event: Transfer): void {
  if(event.params.from.toHexString() != '0x0000000000000000000000000000000000000000'){  //mint
    let account = getOrCreateAccount(event.params.to.toHexString())
    let token = getOrCreateToken(event.params.tokenId.toHexString())
    let tokenown = new EventOwner(token.id.toString() + "-" + account.id.toString())
    tokenown.owner = account.id
    tokenown.event = token.id
    tokenown.save()
  }
}

function getOrCreateEvent(id: string) : Event {
  let event = Event.load(id)
  if(event == null) {
    event = new Event(id)
    event.save()
    return event as Event
  } else return event as Event
}

function getOrCreateToken(id: string) : Token {
  let token = Token.load(id)
  if(token == null) {
    token = new Token(id)
    token.save()
    return token as Token
  } else return token as Token
}

function getOrCreateAccount(id: string) : Account {
  let account = Account.load(id)
  if(account == null) {
    account = new Account(id)
    account.save()
    return account as Account
  } else return account as Account
}