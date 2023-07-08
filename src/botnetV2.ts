import { multiHostExec, findServers, millisToMinutesAndSeconds, openPortsAndNuke } from "./phoenixLib";
import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
	// FIXME handle purchased servers being deleted while the script is running
	const enableLogs = ns.args.includes("--debug"),
		showUI = ns.args.includes("--ui"),
		customTarget = ns.args.includes("--target"),
		logTargeting = ns.args.includes("--log-targeting"),
		msOfBuffer = 30;
	ns.disableLog("ALL");
	ns.clearLog();
	if (enableLogs) { ns.enableLog("exec"); }
	if (showUI) {
		ns.tail();
		ns.atExit(ns.closeTail);
		await ns.sleep(20); //necessary for tail maneuvering to function properly
		ns.setTitle("Botnet Manager");
		ns.resizeTail(340, 435);
		ns.moveTail(1860, 1);
	}

	const weakenCost = ns.getScriptRam("weaken.js"),
		growCost = ns.getScriptRam("grow.js"),
		hackCost = ns.getScriptRam("hack.js"),
		spawnedScripts = ["weaken.js", "grow.js", "hack.js"],
		blacklist = ["home", "contracts", "botnet"];

	// not going to store as a file since args may change as script is updated.
	const hosts = findServers(ns, ["home"], blacklist, true);
	if (enableLogs) { ns.print(hosts); }
	// it's not like the hack scripts are going to change while this is running
	for (let host of hosts) {
		ns.scp(spawnedScripts, host, "home");
	}

	// repeats every hour using a second embedded while() loop
	// to see if we've levelled up enough to root any new servers
	// and check if there is a new best target
	while (true) {
		let moneyCap = 0, optimalTarget = "", maxWeakenThreads = 0, maxHackThreads = 0, maxGrowThreads = 0;
		for (let host of hosts) {
			// hack everything and track how many threads can be executed
			if (!ns.hasRootAccess(host)) {
				if (openPortsAndNuke(ns, host)) {
					maxHackThreads += ns.getServerMaxRam(host) / hackCost;
					maxWeakenThreads += ns.getServerMaxRam(host) / weakenCost;
					maxGrowThreads += ns.getServerMaxRam(host) / growCost;
				}
			} else {
				maxHackThreads += ns.getServerMaxRam(host) / hackCost;
				maxWeakenThreads += ns.getServerMaxRam(host) / weakenCost;
				maxGrowThreads += ns.getServerMaxRam(host) / growCost;
			}

			//pick a server to target with the zombie hoard
			let candidateMaxMoney = ns.getServerMaxMoney(host);
			if (logTargeting) { ns.print(host + ": " + candidateMaxMoney.toExponential(2)); }
			let player = ns.getPlayer();
			if (ns.getServerRequiredHackingLevel(host) <= Math.ceil(player.skills.hacking * .75) && candidateMaxMoney > moneyCap && ns.hasRootAccess(host)) {
				moneyCap = candidateMaxMoney;
				optimalTarget = host;
			}
		}
		let homeRAM = Math.floor(ns.getServerMaxRam("home") * 7 / 8);
		let homeHackThreads = homeRAM / hackCost;
		let homeWeakenThreads = homeRAM / weakenCost;
		let homeGrowThreads = homeRAM / growCost;

		if (customTarget) {
			ns.tprint("target overridden by args");
			optimalTarget = ns.args[ns.args.indexOf("--target") + 1].toString();
			moneyCap = ns.getServerMaxMoney(optimalTarget);
		}

		let currentTime = new Date(Date.now());
		ns.print("[] [] [] [] [] [] [] [] [] [] [] []");
		ns.print("   Re-assessed targets at " + currentTime.getHours() + ":" + currentTime.getMinutes() + ". \n      Targeting " + optimalTarget);
		ns.print("[] [] [] [] [] [] [] [] [] [] [] []");

		let curSec = ns.getServerSecurityLevel(optimalTarget), minSec = ns.getServerMinSecurityLevel(optimalTarget);
		while (curSec > minSec) {
			let weakenTime = ns.getWeakenTime(optimalTarget);
			ns.print("Preliminary weakening: " + curSec + ">" + minSec + " : " + millisToMinutesAndSeconds(weakenTime));
			multiHostExec(ns, "weaken.js", hosts, optimalTarget);
			ns.exec("weaken.js", "home", homeWeakenThreads, optimalTarget);
			await ns.sleep(weakenTime + msOfBuffer);
			curSec = ns.getServerSecurityLevel(optimalTarget);
		}
		let weakenTime = ns.getWeakenTime(optimalTarget),
			growTime = ns.getGrowTime(optimalTarget),
			hackTime = ns.getHackTime(optimalTarget),
			curMoney = ns.getServerMoneyAvailable(optimalTarget);
		function updateHackTimes() {
			weakenTime = ns.getWeakenTime(optimalTarget),
				growTime = ns.getGrowTime(optimalTarget),
				hackTime = ns.getHackTime(optimalTarget);
		}
		async function growPhase() {
			while (curMoney < moneyCap) { // can probably use more grow threads and fewer weaken threads
				ns.print("preliminary growth phase: " + curMoney.toExponential(2) + "/" + moneyCap.toExponential(2) + " : " + millisToMinutesAndSeconds(weakenTime));
				multiHostExec(ns, "weaken.js", hosts, optimalTarget, Math.floor(maxWeakenThreads * 0.33));
				ns.exec("weaken.js", "home", Math.floor(homeWeakenThreads * 0.33), optimalTarget);
				await ns.sleep(weakenTime - (growTime + msOfBuffer));
				multiHostExec(ns, "grow.js", hosts, optimalTarget, Math.floor(maxGrowThreads * 0.66));
				ns.exec("grow.js", "home", Math.floor(homeGrowThreads * 0.66), optimalTarget);
				await ns.sleep(growTime + msOfBuffer);
				curMoney = ns.getServerMoneyAvailable(optimalTarget);
			}
		}
		await growPhase();
		let hour = 3600000;
		while (hour > 0) {
			ns.print("testing hack");
			let hackThreads = Math.floor(0.5 / ns.hackAnalyze(optimalTarget)); // number of threads to hack 50% of server's money
			if (hackThreads < 1) { hackThreads = 1; }
			multiHostExec(ns, "hack.js", hosts, optimalTarget, hackThreads);



			break;
		}
		break;
	}
}