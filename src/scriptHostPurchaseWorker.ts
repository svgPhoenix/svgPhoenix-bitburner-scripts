import { getRunningScripts } from './phoenixLib';
import { NS, RunOptions } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  //ns.tail();
  const servers: ScriptHostInfo[] = [
      {
        //contracts
        ram: 32,
        files: ['contracts.js', 'phoenixLib.js', 'contractsWorker.js', 'contractSolvers.js'],
        cost: ns.getPurchasedServerCost(32),
        name: 'contracts',
        executable: 'contractsWorker.js',
        isUpToDate: false
      },
      {
        //botnet
        ram: 8,
        files: ['botnet.js', 'phoenixLib.js', 'hack.js', 'weaken.js', 'grow.js'],
        cost: ns.getPurchasedServerCost(8),
        name: 'botnet',
        executable: 'botnet.js',
        isUpToDate: false,
        args: ['--ui']
      }
    ],
    serversToBuy = servers.length;
  let purchasedServers = 0;

  while (purchasedServers < serversToBuy) {
    for (const server of servers) {
      initScriptHost(server);
    }
    await ns.sleep(1000);
  }

  function initScriptHost(server: ScriptHostInfo) {
    if (ns.serverExists(server.name) && !server.isUpToDate) {
      ns.print('updating ' + server.name + ' scripts');
      copyAndExecute(server);
    } else if (ns.getPlayer().money > server.cost && !ns.serverExists(server.name)) {
      ns.tprint('purchased: ' + ns.purchaseServer(server.name, server.ram));
      copyAndExecute(server);
    }
  }
  function copyAndExecute(server: ScriptHostInfo) {
    ns.killall(server.name);
    ns.scp(server.files, server.name, 'home');
    if (server.hasOwnProperty('args')) ns.exec(server.executable, server.name, 1, ...server.args!);
    else ns.exec(server.executable, server.name);
    server.isUpToDate = true;
    ++purchasedServers;
  }
  interface ScriptHostInfo {
    ram: number;
    files: string[];
    cost: number;
    name: string;
    executable: string;
    isUpToDate: boolean;
    args?: string[];
  }
}
