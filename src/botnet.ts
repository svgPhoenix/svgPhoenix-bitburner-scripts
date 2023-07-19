import {
  findServers,
  openPortsAndNuke,
  millisToMinutesAndSeconds,
  multiHostExec,
  multiScriptKill,
  threadReport
} from './phoenixLib';
import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const enableLogs = ns.args.includes('--enable-logs');
  ns.disableLog('ALL');
  //ns.enableLog("exec");
  //ns.enableLog("nuke");
  ns.clearLog();
  ns.atExit(ns.closeTail);
  if (!ns.args.includes('--no-tail')) {
    ns.tail();
  }
  await ns.sleep(20); //necessary for tail maneuvering to function properly
  ns.setTitle('Botnet Manager');
  ns.resizeTail(340, 435);
  ns.moveTail(1860, 1);
  let player = ns.getPlayer();
  const weakenCost = ns.getScriptRam('weaken.js'),
    growCost = ns.getScriptRam('grow.js'),
    hackCost = ns.getScriptRam('hack.js');
  const spawnedScripts = ['weaken.js', 'grow.js', 'hack.js'];
  const blacklist = ['home', 'contracts', 'botnet'];

  // builds an array of all acessible servers
  // would storing this array in a csv file have any benefit?
  const hosts = findServers(ns, ['home'], blacklist);
  if (enableLogs) {
    ns.print(hosts);
  }
  for (let host of hosts) {
    ns.scp(['hack.js', 'weaken.js', 'grow.js'], host, 'home');
  }

  // repeats every hour using a second embedded while() loop
  // to see if we've levelled up enough to root any new servers
  // and check if there is a new best target
  while (true) {
    let bestMoneyCap = 0;
    let optimalTarget = '';
    for (let host of hosts) {
      if (!ns.hasRootAccess(host)) {
        openPortsAndNuke(ns, host);
      }
      //pick a server to target with the zombie hoard
      let candidateMaxMoney = ns.getServerMaxMoney(host);
      if (ns.args.includes('--log-targeting')) {
        ns.print(host + ': ' + candidateMaxMoney.toExponential(2));
      }
      if (
        ns.getServerRequiredHackingLevel(host) <= Math.ceil(player.skills.hacking * 0.75) &&
        candidateMaxMoney > bestMoneyCap &&
        ns.hasRootAccess(host)
      ) {
        bestMoneyCap = candidateMaxMoney;
        optimalTarget = host;
      }
    }
    if (ns.args.includes('--target')) {
      ns.tprint('target overridden by args');
      optimalTarget = ns.args[ns.args.indexOf('--target') + 1].toString();
    }

    let homeRAM = Math.floor((ns.getServerMaxRam('home') * 7) / 8);
    let currentTime = new Date(Date.now());
    // BUG prints only one zero on the hour (e.g. 9:0 instead of 09:00)
    ns.print('[] [] [] [] [] [] [] [] [] [] [] []');
    ns.print(
      '   Re-assessed targets at ' +
        currentTime.getHours() +
        ':' +
        currentTime.getMinutes() +
        '. \n      Targeting ' +
        optimalTarget
    );
    ns.print('[] [] [] [] [] [] [] [] [] [] [] []');

    let remainingTime = 18e5; // 30 minutes in ms
    while (remainingTime > 0) {
      // coordinate all zombie servers to attack the chosen target
      ns.print('  Re-assessing targets in T-' + millisToMinutesAndSeconds(remainingTime));
      let expectedThreads = 0,
        executedThreads = 0;
      const moneyThresh = ns.getServerMaxMoney(optimalTarget) * 0.9;
      const securityThresh = ns.getServerMinSecurityLevel(optimalTarget) + 5;
      const securityLevel = ns.getServerSecurityLevel(optimalTarget);
      const moneyLevel = ns.getServerMoneyAvailable(optimalTarget);
      if (securityLevel > securityThresh) {
        //ns.print("  Current security level: " + securityLevel.toFixed(2) + "\n        Threshold: " + securityThresh.toFixed(2))
        let weakenMillis = ns.getWeakenTime(optimalTarget) + 5;
        for (let host of hosts) {
          multiScriptKill(ns, spawnedScripts, host);
          let possibleThreads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / weakenCost);
          if (possibleThreads > 0 && ns.hasRootAccess(host)) {
            expectedThreads += possibleThreads;
            if (ns.exec('weaken.js', host, possibleThreads, optimalTarget)) {
              executedThreads += possibleThreads;
            }
          }
        }
        multiScriptKill(ns, spawnedScripts, 'home');
        let possibleThreads = Math.floor(homeRAM / weakenCost);
        expectedThreads += possibleThreads;
        if (ns.exec('weaken.js', 'home', possibleThreads, optimalTarget)) {
          executedThreads += possibleThreads;
        }
        ns.print(threadReport(expectedThreads, executedThreads, 'weaken', weakenMillis));
        ns.print('- - - - - - - - - - - - - - - - - -');
        await ns.sleep(weakenMillis);
        remainingTime -= weakenMillis;
        continue;
      } else if (moneyLevel < moneyThresh) {
        //ns.print("      Current balance: " + moneyLevel.toExponential(2) + "\n        Threshold: " + moneyThresh.toExponential(2))
        let growMillis = ns.getGrowTime(optimalTarget) + 5;
        for (let host of hosts) {
          multiScriptKill(ns, spawnedScripts, host);
          let possibleThreads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / growCost);
          if (possibleThreads > 0 && ns.hasRootAccess(host)) {
            expectedThreads += possibleThreads;
            if (ns.exec('grow.js', host, possibleThreads, optimalTarget)) {
              executedThreads += possibleThreads;
            }
          }
        }
        multiScriptKill(ns, spawnedScripts, 'home');
        let possibleThreads = Math.floor(homeRAM / growCost);
        expectedThreads += possibleThreads;
        if (ns.exec('grow.js', 'home', possibleThreads, optimalTarget)) {
          executedThreads += possibleThreads;
        }
        ns.print(threadReport(expectedThreads, executedThreads, 'grow', growMillis));
        ns.print('- - - - - - - - - - - - - - - - - -');
        await ns.sleep(growMillis);
        remainingTime -= growMillis;
        continue;
      } else {
        let hackMillis = ns.getHackTime(optimalTarget) + 5,
          homeThreads = Math.floor(homeRAM / hackCost);
        expectedThreads = Math.floor(0.5 / ns.hackAnalyze(optimalTarget)); // number of threads to hack 50% of server's money
        if (expectedThreads < 1) {
          expectedThreads = 1;
        }
        executedThreads = expectedThreads - multiHostExec(ns, 'hack.js', hosts, optimalTarget, expectedThreads);
        multiScriptKill(ns, spawnedScripts, 'home');
        if (homeThreads < expectedThreads) {
          expectedThreads = homeThreads + executedThreads;
        } //add executedThreads because it gets subtracted in the exec
        if (ns.exec('hack.js', 'home', expectedThreads - executedThreads, optimalTarget)) {
          executedThreads += expectedThreads - executedThreads;
        }
        ns.print(threadReport(expectedThreads, executedThreads, 'hack', hackMillis));
        ns.print('- - - - - - - - - - - - - - - - - -');
        await ns.sleep(hackMillis);
        remainingTime -= hackMillis;
        continue;
      }
    }
  }
}
