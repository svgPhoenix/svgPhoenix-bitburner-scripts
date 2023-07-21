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
  const enableLogs = ns.args.includes('--enable-logs'),
    showUI = ns.args.includes('--ui'),
    targetOverride = ns.args.includes('--target');
  ns.disableLog('ALL');
  if (showUI) {
    ns.clearLog();
    ns.atExit(ns.closeTail);
    ns.tail();
    await ns.asleep(0); //necessary for tail maneuvering to function properly
    ns.setTitle('Botnet Manager');
    ns.resizeTail(340, 435);
    ns.moveTail(1860, 1);
  }
  const weakenCost = ns.getScriptRam('weaken.js'),
    growCost = ns.getScriptRam('grow.js'),
    hackCost = ns.getScriptRam('hack.js');
  const spawnedScripts = ['weaken.js', 'grow.js', 'hack.js'];
  const blacklist = ['home', 'contracts', 'botnet'];

  const hosts = findServers(ns, ['home'], blacklist);
  if (enableLogs) {
    ns.print(hosts);
  }
  for (const host of hosts) {
    ns.scp(['hack.js', 'weaken.js', 'grow.js'], host, 'home');
  }

  // repeats every hour using a second embedded while() loop
  // to see if we've levelled up enough to root any new servers
  // and check if there is a new best target
  while (true) {
    const player = ns.getPlayer();
    let bestMoneyCap = 0,
      optimalTarget = '';
    // TODO buy port-openers from the darkweb, maybe with a flag
    for (const host of hosts) {
      if (!ns.hasRootAccess(host)) {
        openPortsAndNuke(ns, host);
      }
      //pick a server to target with the zombie hoard
      const candidateMaxMoney = ns.getServerMaxMoney(host);
      if (ns.args.includes(enableLogs)) {
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
    if (targetOverride) {
      ns.tprint('target overridden by args');
      optimalTarget = ns.args[ns.args.indexOf('--target') + 1].toString();
    }

    const currentTime = new Date(Date.now());
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

    let remainingTime = 30 * 60 * 1000; // 30 minutes
    while (remainingTime > 0) {
      // coordinate all zombie servers to attack the chosen target
      ns.print('  Re-assessing targets in T-' + millisToMinutesAndSeconds(remainingTime));
      let expectedThreads = 0,
        executedThreads = 0,
        homeRAM = Math.floor(((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) * 7) / 8);
      const moneyThresh = ns.getServerMaxMoney(optimalTarget) * 0.9,
        securityThresh = ns.getServerMinSecurityLevel(optimalTarget) + 5,
        securityLevel = ns.getServerSecurityLevel(optimalTarget),
        moneyLevel = ns.getServerMoneyAvailable(optimalTarget);
      if (securityLevel > securityThresh) {
        //ns.print("  Current security level: " + securityLevel.toFixed(2) + "\n        Threshold: " + securityThresh.toFixed(2))
        const weakenMillis = ns.getWeakenTime(optimalTarget) + 5;
        for (const host of hosts) {
          multiScriptKill(ns, spawnedScripts, host);
          const possibleThreads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / weakenCost);
          if (possibleThreads > 0 && ns.hasRootAccess(host)) {
            expectedThreads += possibleThreads;
            if (ns.exec('weaken.js', host, possibleThreads, optimalTarget)) {
              executedThreads += possibleThreads;
            }
          }
        }
        multiScriptKill(ns, spawnedScripts, 'home');
        const possibleThreads = Math.floor(homeRAM / weakenCost);
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
        const growMillis = ns.getGrowTime(optimalTarget) + 5;
        for (const host of hosts) {
          multiScriptKill(ns, spawnedScripts, host);
          const possibleThreads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / growCost);
          if (possibleThreads > 0 && ns.hasRootAccess(host)) {
            expectedThreads += possibleThreads;
            if (ns.exec('grow.js', host, possibleThreads, optimalTarget)) {
              executedThreads += possibleThreads;
            }
          }
        }
        multiScriptKill(ns, spawnedScripts, 'home');
        const possibleThreads = Math.floor(homeRAM / growCost);
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
        const hackMillis = ns.getHackTime(optimalTarget) + 5,
          homeThreads = Math.floor(homeRAM / hackCost);
        expectedThreads = Math.floor(0.5 / ns.hackAnalyze(optimalTarget)); // number of threads to hack 50% of server's money
        if (expectedThreads < 1) {
          expectedThreads = 1;
        }
        executedThreads = expectedThreads - multiHostExec(ns, 'hack.js', hosts, optimalTarget, expectedThreads);
        multiScriptKill(ns, spawnedScripts, 'home');
        if (homeThreads < expectedThreads) {
          expectedThreads = homeThreads + executedThreads;
        } //add executedThreads because it gets subtracted in prior the exec
        const homeThreadsToExec = expectedThreads - executedThreads;
        if (homeThreadsToExec > 0 && ns.exec('hack.js', 'home', homeThreadsToExec, optimalTarget)) {
          executedThreads += homeThreadsToExec;
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
