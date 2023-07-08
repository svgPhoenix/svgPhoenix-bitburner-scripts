import { NS } from '@ns';
/** @param {NS} ns */
export async function main(ns: NS) {
	const flags = ns.flags([
		["help", true],
		["name", ""],
		["size", 2],
		["ui", false],
		["scripts", []]
	]);
	if (typeof flags.help != "boolean" ||
		typeof flags.name != "string" ||
		typeof flags.size != "number" ||
		typeof flags.ui != "boolean" ||
		!Array.isArray(flags.scripts)) {
		throw new Error("one or more argument was of the incorrect type");
	}
	if (ns.args.includes("--help")) {
		ns.tprint("Buys a server with the most RAM the player can afford, ");
		ns.tprint("	and names it \"autoPurchase#(PID)\"");
		ns.tprint();
		ns.tprint("--name 'hostname' uses the given name for the purchased server.");
		ns.tprint("--size # specifies the RAM size in GB. must be a factor of 2.");
		ns.tprint("--scripts 'foo.js bar.js ...' copies the given scripts to the newly purchased server.");
		return;
	}

	if (flags.ui) { ns.tail(); };
	let serverSize = 2;
	const player = ns.getPlayer();
	const playerMoney = player.money;
	const maxServerRam = ns.getPurchasedServerMaxRam();
	ns.print("Max purchased server RAM: " + maxServerRam);
	if (flags.size > 2) {
		serverSize = flags.size;
		if (serverSize > maxServerRam) {
			ns.alert("RAM must be <= " + maxServerRam);
			return;
		}
		if (ns.getPurchasedServerCost(serverSize) > playerMoney) {
			ns.alert("You do not have enough money for a server that large.");
			return;
		}
	} else {
		while (serverSize < maxServerRam) {
			let newServerSize = serverSize * 2;
			let newServerCost = ns.getPurchasedServerCost(newServerSize);
			if (newServerCost < playerMoney) {
				serverSize = newServerSize;
			} else {
				break;
			}
		}
	}

	ns.print("Buying server with " + serverSize + "GB");

	let serverName: string;
	if (flags.name.length > 0) {
		serverName = flags.name;
	} else {
		const thisScript = ns.getRunningScript()!;
		const thisPID = thisScript.pid;
		serverName = "autoPurchase#" + thisPID.toString();
	}
	ns.purchaseServer(serverName, serverSize) + ": " + serverSize;

	if (flags.scripts.length > 0) {
		ns.scp(flags.scripts, serverName);
	}
}