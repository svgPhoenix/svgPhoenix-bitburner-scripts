import {NS} from "@ns";
/** @param {NS} ns */
export async function main(ns:NS) {
	await ns.weaken(ns.args[0].toString());
}