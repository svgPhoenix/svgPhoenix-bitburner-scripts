import { NS } from '@ns';
import { findPathToServer, openPortsAndNuke } from './phoenixLib';

export async function main(ns: NS) {
  if (ns.args.length == 0) {
    ns.tprint(
      'Usage: run connect.ts [options] hostname\n' +
        '  options:\n' +
        "  --backdoor: install backdoor on the server once you're connected\n" +
        '  --goback: return to the server you were connected to when you ran this command\n' +
        '      (happens after all other operations, if any)'
    );
    return;
  }
  //flags
  const backdoor = ns.args.includes('--backdoor'),
    goBack = ns.args.includes('--goBack'),
    origin = ns.getHostname();

  let target = '';
  for (const arg of ns.args) {
    if (typeof arg != 'string') continue;
    if (arg.startsWith('--')) continue;
    if (ns.serverExists(arg)) target = arg;
  }
  if (target == '') {
    ns.tprint('You must specify a server to connect to.');
    return;
  }

  multiStepConnect(target);
  //ns.tprint("reached destination: " + target);

  flagBackdoor: {
    if (!backdoor) break flagBackdoor;

    const server = ns.getServer(target),
      player = ns.getPlayer();
    if (server.backdoorInstalled) {
      ns.tprint('You already hava a backdoor to that server. ');
      break flagBackdoor;
    }
    if (typeof server.requiredHackingSkill == 'undefined') {
      ns.tprint('ERROR: NS returned "undefined" for requiredHackingSkill of ' + server.hostname);
      break flagBackdoor;
    }
    if (player.skills.hacking < server.requiredHackingSkill) {
      ns.tprint('ERROR: player hack level too low: ' + player.skills.hacking + ' / ' + server.requiredHackingSkill);
      break flagBackdoor;
    }
    if (openPortsAndNuke(ns, server.hostname)) {
      ns.tprint('installing backdoor, please wait.');
      await ns.singularity.installBackdoor();
    } else {
      ns.tprint('ERROR: failed to nuke. do you have enough port-openers?');
    }
  }

  if (goBack) {
    multiStepConnect(origin);
  }

  function multiStepConnect(target: string) {
    ns.disableLog('scan');
    let path = findPathToServer(ns, target);
    ns.enableLog('scan');
    for (let host of path) {
      ns.singularity.connect(host);
    }
  }
}

export function autocomplete(data: any, args: any) {
  return ['--backdoor', '--goBack', ...data.servers];
}
