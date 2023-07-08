import { multiScriptKill } from "./phoenixLib";
import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
	/**#TODO
	 * make or buy hacking programs
	 * manage factions
	 */
	const toKill = ["weaken.js", "grow.js", "hack.js", "botnet.js"];
	multiScriptKill(ns, toKill, "home");
	ns.exec("botnet.js", "home", 1, "--ui");
	ns.exec("contractServerPurchaseWorker.js", "home");
}