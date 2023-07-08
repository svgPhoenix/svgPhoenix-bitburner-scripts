import { getRunningScripts } from "./phoenixLib";
import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
	//ns.tail();
	const ram = 32,
		scripts = ["contracts.js", "phoenixLib.js", "contractsWorker.js", "contractSolvers.js"],
		serverCost = ns.getPurchasedServerCost(32);
	function copyAndExecute() {
		ns.scp(scripts, "contracts", "home");
		ns.killall("contracts");
		ns.exec("contractsWorker.js", "contracts");
	}

	if (ns.serverExists("contracts")) {
		ns.print("updating contract scripts");
		copyAndExecute();
		return;
	}

	if (getRunningScripts(ns, "contractServerPurchaseWorker.js", "home").length > 1) {
		ns.print("Already running. Exiting.");
		return;
	}

	while (true) {
		if (ns.getPlayer().money < serverCost) {
			await ns.sleep(1000);
			continue;
		}
		ns.purchaseServer("contracts", ram);
		copyAndExecute();
		break;
	}
}

