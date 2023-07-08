import { NS } from "@ns";
/** @param {NS} ns */
export async function main(ns: NS) {
	if (ns.getRunningScript()!.server != "contracts") {
		ns.alert("contractsWorker.js was run outside of the contracts server.");
		return;
	}
	let hour = 3600000;
	while (true) {
		ns.exec("contracts.js", "contracts");
		await ns.sleep(hour);
	}
}