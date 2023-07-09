import { NS } from "@ns";
/**
 * @param {NS} ns
 * @param {number} expected 
 * num of threads that should have executed
 * @param {number} executed
 * num of threads that did execute
 * @param {string} operation
 * name of function that was multithreaded
 * @param {number} millis
 * milliseconds that the multithreaded function will run for
 */
export function threadReport(expected: number, executed: number, operation: string, millis: number) {
	let toReturn = "";
	if (expected == executed) {
		toReturn += "	Threads: " + executed;
	} else {
		toReturn += "	THREAD EXECUTION ERROR!\n	expected threads: " + expected + "\n	executed threads: " + executed;
	}
	return toReturn + "\n     Awaiting " + operation + " for: " + millisToMinutesAndSeconds(millis);
}
export function millisToMinutesAndSeconds(millis: number) {
	var minutes = Math.floor(millis / 60000);
	var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
	return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/**
 * @param {NS} ns
 * @param {string[]} hosts
 * must contain at minimum one server name from which scanning will start
 * @param {string[]} blacklist
 * any servers to exclude from the compiled list. use Array.shift() to remove the first entry
 * @returns {string[]} 
 * list of located servers
 */
export function findServers(ns: NS, hosts = ["home"], blacklist: string[] = [], excludeNoRAM = true) {

	/**
	 * build the initial array of all servers in the network.
	 * servers that the caller wishes to exclude must still be added to the array
	 * initially in case there are any more servers connected beyond them.
	 */
	for (let i = 0; i < hosts.length; i++) {
		const newHosts = ns.scan(hosts[i]);
		for (var newHost of newHosts) {
			if (!hosts.includes(newHost)) {
				hosts.push(newHost);
			}
		}
	}

	// remove any blacklisted servers from the completed array
	for (var host of blacklist) {
		let index = hosts.indexOf(host);
		hosts.splice(index, 1);
	}

	// remove servers with no RAM if requested.
	if (excludeNoRAM) {
		for (let i = 0; i < hosts.length; i++) {
			if (ns.getServerMaxRam(hosts[i]) == 0) {
				hosts.splice(i, 1);
				i -= 1; //because we're shrinking the array we're iterating through
			}
		}
	}

	return hosts;
}

/**
 * @remarks 
 * will open every possible port, not just enough to successfully nuke the target
 * @param {NS} ns
 * @param {string} toNuke 
 * hostname of server to nuke
 */
export function openPortsAndNuke(ns: NS, toNuke: string) {
	let openPorts = 0;
	if (ns.fileExists("SQLInject.exe")) {
		ns.sqlinject(toNuke);
		openPorts++;
	}
	if (ns.fileExists("HTTPWorm.exe")) {
		ns.httpworm(toNuke);
		openPorts++;
	}
	if (ns.fileExists("relaySMTP.exe")) {
		ns.relaysmtp(toNuke);
		openPorts++;
	}
	if (ns.fileExists("FTPCrack.exe")) {
		ns.ftpcrack(toNuke);
		openPorts++;
	}
	if (ns.fileExists("BruteSSH.exe")) {
		ns.brutessh(toNuke);
		openPorts++;
	}

	if (ns.getServerNumPortsRequired(toNuke) <= openPorts) {
		ns.nuke(toNuke);
	}

	if (ns.hasRootAccess(toNuke)) {
		return true;
	} else {
		return false;
	}
}
/**
 * @param {NS} ns
 * @param {string[]} toKill
 * array of names of scripts to kill
 * @param {string} host
 * name of server to kill scripts on
 */
export function multiScriptKill(ns: NS, toKill: string[], host: string) {
	for (var script of toKill) {
		ns.scriptKill(script, host);
	}
}
/**@param {NS} ns */
export function getRunningScripts(ns: NS, filename: string, hostname: string | undefined, _args = []): number[] {
	let runningScripts = ns.ps(hostname);
	let instances: number[] = [];
	for (let script of runningScripts) {
		if (script.filename == filename) {
			let isSame = true;
			for (let arg of _args) {
				if (!script.args.includes(arg)) {
					isSame = false;
				}
			}
			if (isSame) {
				instances.push(script.pid);
			}
		}
	}
	return instances;
}

/**
 * @remarks 
 * fills every server in the passed array of hostnames one at a time.
 * If a specific number of threads to execute is given, returns the index at which the last thread was executed (or the index of the last element otherwise)
 * @param {NS} ns 
 * @param {string[]} hostnames
 * @param {string} script
 * @param {number} threads
 * @param {string} args
 * @returns index of the passed array of hostnames at which the request was fulfilled
*/
export function multiHostExec(ns: NS, script: string, hostnames: string[], args: string, threads = 9999999999) {
	const scriptCost = ns.getScriptRam(script);
	for (let i = 0; i < hostnames.length; i++) {
		if (!ns.hasRootAccess(hostnames[i])) { continue; }
		const free = ns.getServerMaxRam(hostnames[i]) - ns.getServerUsedRam(hostnames[i]);
		const hostCapacity = Math.floor(free / scriptCost);
		const threadsToExec = Math.min(hostCapacity, threads);
		if (threadsToExec == 0) { continue; }
		if (ns.exec(script, hostnames[i], threadsToExec, args)) {
			threads -= threadsToExec;
		}
		if (threads == 0) { return threads; }
	}
	return threads;
}

// export function execFromTerminal(command: string) {
// 	// Acquire a reference to the terminal text field
// 	const terminalInput = document.getElementById("terminal-input")!;

// 	// Set the value to the command you want to run.
// 	//@ts-ignore
// 	terminalInput.value = command;

// 	// Get a reference to the React event handler.
// 	const handler = Object.keys(terminalInput)[1];

// 	// Perform an onChange event to set some internal values.
// 	//@ts-ignore
// 	terminalInput[handler].onChange({ target: terminalInput });

// 	// Simulate an enter press
// 	//@ts-ignore
// 	terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
// }

export function findPathToServer(ns: NS, target: string, origin?: string) {
	return findPathRecursive(ns, target, origin || ns.getHostname(), [], []);
	//TODO CPU: return [path, found] instead of checking path.includes constantly
	//TODO RAM: prepend to path on the way up from the target instead of building and passing args
	function findPathRecursive(ns: NS, target: string, origin: string, path: string[], visited: string[]) {
		visited.push(origin);
		const neighbors = ns.scan(origin);
		if (neighbors.includes(target)) { return path.concat([origin, target]); }
		for (let neighbor of neighbors) {
			if (visited.includes(neighbor)) { continue; }
			path = findPathRecursive(ns, neighbor, target, path.concat([origin]), visited);
			if (path.includes(target)) { return path; }
			path.pop();
		}
		return path;
	}
}