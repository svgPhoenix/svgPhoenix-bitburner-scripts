import { findServers } from "./phoenixLib";
import * as solvers from "./contractSolvers";
import { NS } from "@ns";

export function main(ns:NS) {
	ns.disableLog("scan");
	ns.clearLog();
	ns.tail();
	let hosts = findServers(ns, ["home"], [], false);
	for (let host of hosts) {
		let contracts = ns.ls(host, ".cct");
		if (contracts.length > 0) { ns.print("\n" + host + ":\n" + contracts.toString() + "\n"); }
		for (let contract of contracts) {
			let contractType = ns.codingcontract.getContractType(contract, host);
			let data = ns.codingcontract.getData(contract, host);
			switch (contractType) {
				case ("Compression II: LZ Decompression"): {
					let ans = solvers.compressionII(data);
					ns.print(ns.codingcontract.attempt(ans, contract, host));
				}
				case ("Algorithmic Stock Trader I"): {
					let ans = solvers.algorithmicStocksI(data);
					ns.print(ns.codingcontract.attempt(ans, contract, host));
				}
				case ("Encryption I: Caesar Cipher"): {
					let ans = solvers.encryptionI(data);
					ns.print(ns.codingcontract.attempt(ans, contract, host));
				}
				case ("Compression I: RLE Compression"): {
					let ans = solvers.compressionI(data);
					ns.print(ns.codingcontract.attempt(ans, contract, host));
				}
				default: {
					ns.print("unsolved contract type: " + contractType);
				}
			}
		}
	}

}
