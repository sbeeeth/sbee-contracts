https://ide.bitquery.io/

call the following query for each memo contracts:

1.BONK holders
get count from the following query:
{
EVM(dataset: archive, network: eth) {
TokenHolders(
date: "2024-04-01"
tokenSmartContract: "0x1151cb3d861920e07a38e03eead12c32178567f6"
) {
count
}
}
}

get holder list from the following query:
query {
EVM(dataset: archive, network: eth) {
TokenHolders(date: "2024-04-01", tokenSmartContract: "0x1151cb3d861920e07a38e03eead12c32178567f6", limit: {count: 19232}, orderBy: {descending: Balance_Amount}) {
Holder {
Address
}
Balance {
Amount
}
}
}
}

2. POND holders
   {
   EVM(dataset: archive, network: eth) {
   TokenHolders(
   date: "2024-04-01"
   tokenSmartContract: "0x423f4e6138E475D85CF7Ea071AC92097Ed631eea"
   ) {
   count
   }
   }
   }

query {
EVM(dataset: archive, network: eth) {
TokenHolders(date: "2024-04-01", tokenSmartContract: "0x423f4e6138E475D85CF7Ea071AC92097Ed631eea", limit: {count: 39884}, orderBy: {descending: Balance_Amount}) {
Holder {
Address
}
Balance {
Amount
}
}
}
}

3. PORK holders
   {
   EVM(dataset: archive, network: eth) {
   TokenHolders(
   date: "2024-04-01"
   tokenSmartContract: "0xb9f599ce614Feb2e1BBe58F180F370D05b39344E"
   ) {
   count
   }
   }
   }

query {
EVM(dataset: archive, network: eth) {
TokenHolders(date: "2024-04-01", tokenSmartContract: "0xb9f599ce614Feb2e1BBe58F180F370D05b39344E", limit: {count: 52619}, orderBy: {descending: Balance_Amount}) {
Holder {
Address
}
Balance {
Amount
}
}
}
}

PEPE holders
{
EVM(dataset: archive, network: eth) {
TokenHolders(
date: "2024-04-01"
tokenSmartContract: "0x6982508145454Ce325dDbE47a25d4ec3d2311933"
) {
count
}
}
}

query {
EVM(dataset: archive, network: eth) {
TokenHolders(date: "2024-04-01", tokenSmartContract: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", limit: {count: 457690}, orderBy: {descending: Balance_Amount}) {
Holder {
Address
}
Balance {
Amount
}
}
}
}

MOG holders
{
EVM(dataset: archive, network: eth) {
TokenHolders(
date: "2024-04-01"
tokenSmartContract: "0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a"
) {
count
}
}
}

query {
EVM(dataset: archive, network: eth) {
TokenHolders(date: "2024-04-01", tokenSmartContract: "0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a", limit: {count: 33293}, orderBy: {descending: Balance_Amount}) {
Holder {
Address
}
Balance {
Amount
}
}
}
}
