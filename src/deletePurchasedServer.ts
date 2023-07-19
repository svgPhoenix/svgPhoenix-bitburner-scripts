import { NS } from '@ns';
/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags([
    ['help', false],
    ['search', ''],
    ['force', false]
  ]);
  if (typeof flags.help != 'boolean' || typeof flags.search != 'string' || typeof flags.force != 'boolean') {
    throw new Error('one or more argument was of the incorrect type');
  }
  if (ns.args.length == 0 || flags.help) {
    ns.tprint('quickly delete a server from the terminal.');
    ns.tprint('using alias dps="run deletePurchasedServer.js" is recommended.');
    ns.tprint();
    ns.tprint("--search 'substring' deletes the first server found that contains 'substring'");
    return;
  }

  let toDelete: string;
  if (flags.search) {
    let purchasedServers = ns.getPurchasedServers();
    toDelete = purchasedServers.find((element) => element.includes(flags.search.toString()))!;
    handleDeleteServer(toDelete);
  } else {
    toDelete = ns.args[0].toString();
    handleDeleteServer(toDelete);
  }
  function handleDeleteServer(hostname: string) {
    if (!ns.serverExists(hostname)) {
      ns.alert(hostname + ' does not exist.');
    }
    // doesn't execute killall if force is false because && operands are evaluated LtR and evaluations stops if at the first false..
    if (flags.force && ns.killall(hostname)) {
      ns.tprint('Killed all scripts running on ' + hostname);
    }
    if (ns.deleteServer(hostname)) {
      ns.tprint('successfully deleted ' + hostname);
    } else {
      ns.tprint("Cannot delete server '" + hostname + "' because it still has scripts running.");
      ns.tprint('Try running with the --force option');
    }
  }
}
