import { findServers } from "./phoenixLib";
import * as solvers from "./contractSolvers";
import { NS } from "@ns";

export function main(ns: NS) {
	ns.disableLog("scan");
	ns.disableLog("codingcontract.attempt");
	ns.clearLog();
	ns.tail();
	let hosts = findServers(ns, ["home"], [], false),
		rewards: string[] = [],
		allContracts: ContractDirectory = {},
		contractType: string,
		data: any;
	for (let host of hosts) {
		let contracts = ns.ls(host, ".cct");
		allContracts[host] = [];
		for (let contract of contracts) {
			contractType = ns.codingcontract.getContractType(contract, host),
				data = ns.codingcontract.getData(contract, host);
			switch (contractType) {
				case ("Compression II: LZ Decompression"): {
					handleAttempt(solvers.compressionII, data, contract, host);
				}
				case ("Algorithmic Stock Trader I"): {
					handleAttempt(solvers.algorithmicStocksI, data, contract, host);
				}
				case ("Encryption I: Caesar Cipher"): {
					handleAttempt(solvers.encryptionI, data, contract, host);
				}
				case ("Compression I: RLE Compression"): {
					handleAttempt(solvers.compressionI, data, contract, host);
				}
				default: {
					allContracts[host].push("\n" + contract + ": " + contractType);
				}
			}
		}
	}
	for (let server in allContracts) {
		if (allContracts[server].length > 0) {
			ns.print("\n" + server + ": " + allContracts[server]);
		}
	}
	if (rewards.length > 0) {
		ns.print("\nReward summary:\n" + rewards.join("\n"));
	}

	function handleAttempt(solver: Function, data: string, contract: string, host: string) {
		ns.print("attempting " + contractType + " with data: " + data);
		const ans = solver(data);
		const reward = ns.codingcontract.attempt(ans, contract, host);
		if (reward) {
			rewards.push(reward);
		} else {
			ns.alert("Failed to solve " + contract + " on " + host + " with answer: " + ans);
		}
	}
}

interface ContractDirectory {
	[index: string]: string[];
}